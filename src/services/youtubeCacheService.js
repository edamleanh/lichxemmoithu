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
    live: 30,
    'live-stats': 30,
    upcoming: 720,
    'upcoming-schedule': 720
  }

  static getCacheKey(game, type, channelId) {
    return `${game}_${type}_${channelId}`
  }

  static isCacheValid(cachedData, type) {
    if (!cachedData || !cachedData.timestamp) {
      return false
    }

    const now = Date.now()
    const cacheTime = cachedData.timestamp.toMillis()
    const expiryMinutes = this.CACHE_EXPIRY[type]
    const expiryMs = expiryMinutes * 60 * 1000

    const isTimeValid = (now - cacheTime) < expiryMs

    if ((type === 'upcoming' || type === 'upcoming-schedule') && isTimeValid && cachedData.data) {
      const hasStartedEvents = this.hasEventsStarted(cachedData.data)
      
      if (hasStartedEvents) {
        console.log(`📅 ${type} cache invalid: Some events have started`)
        return false
      }
    }

    return isTimeValid
  }

  static hasEventsStarted(data) {
    if (!data) {
      return false
    }

    let itemsToCheck = []

    if (Array.isArray(data)) {
      itemsToCheck = data
    } else if (data.items && Array.isArray(data.items)) {
      itemsToCheck = data.items
    } else {
      return false
    }

    const now = Date.now()
    
    return itemsToCheck.some(item => {
      if (item?.liveStreamingDetails?.scheduledStartTime) {
        const scheduledTime = new Date(item.liveStreamingDetails.scheduledStartTime).getTime()
        return now >= scheduledTime
      }
      return false
    })
  }

  static async getCachedData(game, type, fetchFunction) {
    try {
      const cacheKey = this.getCacheKey(game, type, game)
      const docRef = doc(db, this.CACHE_COLLECTION, cacheKey)
      
      // 🛡️ Try to get cached data with timeout
      let docSnap
      try {
        docSnap = await Promise.race([
          getDoc(docRef),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Firebase timeout')), 5000)
          )
        ])
      } catch (firebaseError) {
        console.warn(`⚠️ Firebase blocked/timeout for ${game} ${type}, fetching fresh data`)
        console.warn('Firebase error:', firebaseError.message)
        
        // Firebase bị block → fetch fresh data trực tiếp
        const freshData = await fetchFunction()
        return freshData
      }

      let needsFetch = false

      if (docSnap.exists()) {
        const cachedData = docSnap.data()
        
        if (this.isCacheValid(cachedData, type)) {
          console.log(`✅ Using cached ${game} ${type} data (age: ${Math.round((Date.now() - cachedData.timestamp.toMillis()) / 1000 / 60)}m)`)
          return cachedData.data
        } else {
          needsFetch = true
        }
      } else {
        needsFetch = true
      }

      if (needsFetch) {
        console.log(`🔄 Fetching fresh ${game} ${type} data`)
        
        const freshData = await fetchFunction()
        
        if (freshData) {
          // 🛡️ Try to save to cache with fallback
          try {
            await this.setCachedData(game, type, game, freshData)
          } catch (cacheError) {
            console.warn(`⚠️ Could not cache ${game} ${type} data (Firebase blocked):`, cacheError.message)
            // Continue without caching
          }
          
          if (type === 'upcoming' || type === 'upcoming-schedule') {
            console.log(`🔄 ${type} refreshed → Invalidating live cache for ${game}`)
            try {
              await this.clearCache(game, 'live')
              await this.clearCache(game, 'live-stats')
            } catch (clearError) {
              console.warn(`⚠️ Could not clear cache (Firebase blocked):`, clearError.message)
            }
          }
          
          return freshData
        }
      }

      return null
    } catch (error) {
      console.error(`❌ Error in getCachedData for ${game} ${type}:`, error)
      return null
    }
  }

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

      // 🛡️ Try to save with timeout
      await Promise.race([
        setDoc(docRef, cacheData),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Firebase write timeout')), 5000)
        )
      ])
      
      console.log(`💾 Cached ${game} ${type} data (${data?.length || 0} items)`)
    } catch (error) {
      // Re-throw để caller xử lý
      throw new Error(`Firebase cache error: ${error.message}`)
    }
  }

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
}

export default YouTubeCacheService
