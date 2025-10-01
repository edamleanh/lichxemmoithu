// YouTube Cache Service với Firebase Firestore
import { db } from '../config/firebase'
import { 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp
} from 'firebase/firestore'

export class YouTubeCacheService {
  static CACHE_COLLECTION = 'youtube_cache'
  
  // Cache expiry times (in minutes)
  static CACHE_EXPIRY = {
    live: 30,      // 30 minutes for live data
    upcoming: 720  // 12 hours for upcoming data
  }

  /**
   * Get cache key for a specific request
   */
  static getCacheKey(game, type, channelId) {
    return `${game}_${type}_${channelId}`
  }

  /**
   * Check if cached data is still valid
   */
  static isCacheValid(cachedData, type) {
    if (!cachedData || !cachedData.timestamp) {
      return false
    }

    const now = Date.now()
    const cacheTime = cachedData.timestamp.toMillis()
    const expiryMinutes = this.CACHE_EXPIRY[type]
    const expiryMs = expiryMinutes * 60 * 1000

    // Check basic time expiry (12h cho upcoming, 30ph cho live)
    const isTimeValid = (now - cacheTime) < expiryMs

    // 🎯 Cho UPCOMING: kiểm tra thêm xem có event nào đã bắt đầu
    if (type === 'upcoming' && isTimeValid && cachedData.data) {
      const hasStartedEvents = this.hasEventsStarted(cachedData.data)
      
      if (hasStartedEvents) {
        console.log(`📅 Upcoming cache invalid: Some events have started`)
        return false
      }
    }

    return isTimeValid
  }

  /**
   * Check if any events in the data have started
   */
  static hasEventsStarted(data) {
    const now = Date.now()
    
    return data.some(item => {
      if (item.liveStreamingDetails?.scheduledStartTime) {
        const scheduledTime = new Date(item.liveStreamingDetails.scheduledStartTime).getTime()
        return now >= scheduledTime
      }
      // Kiểm tra cả items array nếu có
      if (item.items) {
        return item.items.some(subItem => {
          if (subItem.liveStreamingDetails?.scheduledStartTime) {
            const scheduledTime = new Date(subItem.liveStreamingDetails.scheduledStartTime).getTime()
            return now >= scheduledTime
          }
          return false
        })
      }
      return false
    })
  }

  /**
   * Get cached YouTube data với logic đồng bộ theo yêu cầu
   */
  static async getCachedData(game, type, fetchFunction) {
    try {
      const cacheKey = this.getCacheKey(game, type, game) // Use game as channelId
      const docRef = doc(db, this.CACHE_COLLECTION, cacheKey)
      const docSnap = await getDoc(docRef)

      let needsFetch = false
      let cacheInvalidReason = null

      if (docSnap.exists()) {
        const cachedData = docSnap.data()
        
        if (this.isCacheValid(cachedData, type)) {
          console.log(`✅ Using cached ${game} ${type} data (age: ${Math.round((Date.now() - cachedData.timestamp.toMillis()) / 1000 / 60)}m)`)
          return cachedData.data
        } else {
          needsFetch = true
          cacheInvalidReason = 'expired_or_events_started'
        }
      } else {
        needsFetch = true
        cacheInvalidReason = 'not_found'
      }

      if (needsFetch) {
        console.log(`🔄 Fetching fresh ${game} ${type} data (reason: ${cacheInvalidReason})`)
        
        // Fetch new data
        const freshData = await fetchFunction()
        
        if (freshData) {
          // Save to cache
          await this.setCachedData(game, type, game, freshData)
          
          // � LOGIC MỚI: CHỈ khi upcoming refresh → invalidate live cache
          if (type === 'upcoming') {
            console.log(`🔄 Upcoming refreshed → Invalidating live cache for ${game}`)
            await this.clearCache(game, 'live')
            await this.clearCache(game, 'live-stats')
          }
          
          // 🚫 REMOVED: Live refresh KHÔNG invalidate upcoming cache
          
          return freshData
        }
      }

      return null
    } catch (error) {
      console.error(`❌ Error in getCachedData for ${game} ${type}:`, error)
      return null
    }
  }

  /**
   * Save YouTube data to cache
   */
  static async setCachedData(game, type, channelId, data) {
    try {
      const cacheKey = this.getCacheKey(game, type, channelId)
      const docRef = doc(db, this.CACHE_COLLECTION, cacheKey)

      const cacheData = {
        game,
        type,
        channelId,
        data,
        timestamp: Timestamp.now(),
        expiryMinutes: this.CACHE_EXPIRY[type]
      }

      await setDoc(docRef, cacheData)
      console.log(`💾 Cached ${game} ${type} data (${data?.length || 0} items)`)
    } catch (error) {
      console.error(`❌ Error caching data for ${game} ${type}:`, error)
    }
  }

  /**
   * Clear cache for a specific game/type
   */
  static async clearCache(game, type = null) {
    try {
      const collectionRef = collection(db, this.CACHE_COLLECTION)
      let q

      if (type) {
        q = query(collectionRef, where('game', '==', game), where('type', '==', type))
      } else {
        q = query(collectionRef, where('game', '==', game))
      }

      const querySnapshot = await getDocs(q)
      
      const deletePromises = querySnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      )

      await Promise.all(deletePromises)
      console.log(`🗑️ Cleared cache for ${game} ${type || 'all types'}`)
    } catch (error) {
      console.error(`❌ Error clearing cache for ${game}:`, error)
    }
  }

  /**
   * Force refresh cache (clear and refetch)
   */
  static async forceRefresh(game, type) {
    try {
      await this.clearCache(game, type)
      console.log(`🔄 Force refresh triggered for ${game} ${type}`)
    } catch (error) {
      console.error(`❌ Error force refreshing cache:`, error)
    }
  }

  /**
   * Get cache statistics
   */
  static async getCacheStats() {
    try {
      const collectionRef = collection(db, this.CACHE_COLLECTION)
      const querySnapshot = await getDocs(collectionRef)
      
      const stats = {
        total: querySnapshot.size,
        byGame: {},
        byType: {}
      }

      querySnapshot.docs.forEach(doc => {
        const data = doc.data()
        const game = data.game
        const type = data.type
        
        stats.byGame[game] = (stats.byGame[game] || 0) + 1
        stats.byType[type] = (stats.byType[type] || 0) + 1
      })

      return stats
    } catch (error) {
      console.error('❌ Error getting cache stats:', error)
      return null
    }
  }
}

export default YouTubeCacheService
