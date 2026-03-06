import { withinRange } from '../utils/formatters.js'
import { youtubeApiManager } from './youtube.js'
import YouTubeCacheService from './youtubeCacheService.js'

export const TftAdapter = {
  async fetch({ from, to }) {
    try {
      
      // TFT Esports channel ID (example - có thể thay đổi)
      const CHANNEL_ID = 'UCKxbHR8VG9AyXL-W07ocrWA' // Channel ID cho Riot Games hoặc kênh TFT chính thức
      
      let allMatches = []
      
      // 1. Fetch live streams (with cache)
      try {
        const liveResponse = await YouTubeCacheService.getCachedData(
          'tft',
          'live',
          () => youtubeApiManager.makeRequest(
            `https://www.googleapis.com/youtube/v3/search?` +
            `part=snippet&channelId=${CHANNEL_ID}&type=video&eventType=live&` +
            `maxResults=10&order=date`
          )
        )
        
        if (liveResponse) {
          const liveData = liveResponse
          
          // Get video IDs for additional details (view count, etc.)
          const videoIds = liveData.items?.map(item => item.id.videoId).join(',')
          
          let liveVideosWithStats = liveData.items || []
          
          // Fetch video statistics if we have video IDs
          if (videoIds) {
            try {
              const statsData = await YouTubeCacheService.getCachedData(
                'tft',
                'live-stats',
                () => youtubeApiManager.makeRequest(
                  `https://www.googleapis.com/youtube/v3/videos?` +
                  `part=statistics,liveStreamingDetails&id=${videoIds}`
                )
              )
              
              if (statsData) {
                
                // Merge statistics with video data
                liveVideosWithStats = liveData.items.map(video => {
                  const stats = statsData.items?.find(stat => stat.id === video.id.videoId)
                  return {
                    ...video,
                    statistics: stats?.statistics,
                    liveStreamingDetails: stats?.liveStreamingDetails
                  }
                })
                
                // Sort by view count (descending) - videos with more views first
                liveVideosWithStats.sort((a, b) => {
                  const viewsA = parseInt(a.statistics?.viewCount || '0')
                  const viewsB = parseInt(b.statistics?.viewCount || '0')
                  return viewsB - viewsA
                })
                
                liveVideosWithStats.forEach(video => {
                  const views = parseInt(video.statistics?.viewCount || '0')
                })
              }
            } catch (statsError) {
            }
          }
          
          const liveMatches = this.processLiveVideos(liveVideosWithStats)
          allMatches = [...allMatches, ...liveMatches]
        } else {
          // Handle API errors for TFT live streams
          if (liveResponse.status === 403) {
          }
        }
      } catch (error) {
      }
      
      // 2. Fetch upcoming streams (with cache)
      try {
        const upcomingResponse = await YouTubeCacheService.getCachedData(
          'tft',
          'upcoming',
          () => youtubeApiManager.makeRequest(
            `https://www.googleapis.com/youtube/v3/search?` +
            `part=snippet&channelId=${CHANNEL_ID}&type=video&eventType=upcoming&` +
            `maxResults=10&order=date`
          )
        )
        
        if (upcomingResponse) {
          const upcomingData = upcomingResponse
          
          // Filter out videos that are not truly upcoming
          const trulyUpcomingVideos = upcomingData.items?.filter(item => {
            // Only include videos with liveBroadcastContent: "upcoming"
            const isUpcoming = item.snippet.liveBroadcastContent === 'upcoming'
            
            return isUpcoming
          }) || []
          
          // Get video IDs for additional details (scheduled start time)
          const videoIds = trulyUpcomingVideos?.map(item => item.id.videoId).join(',')
          
          let upcomingVideosWithSchedule = trulyUpcomingVideos || []
          
          // Fetch scheduled start time if we have video IDs
          if (videoIds) {
            try {
              const scheduleData = await YouTubeCacheService.getCachedData(
                'tft',
                'upcoming-schedule',
                () => youtubeApiManager.makeRequest(
                  `https://www.googleapis.com/youtube/v3/videos?` +
                  `part=liveStreamingDetails&id=${videoIds}`
                )
              )
              
              if (scheduleData) {
                
                // Merge schedule details with video data
                upcomingVideosWithSchedule = trulyUpcomingVideos.map(video => {
                  const schedule = scheduleData.items?.find(sched => sched.id === video.id.videoId)
                  return {
                    ...video,
                    liveStreamingDetails: schedule?.liveStreamingDetails
                  }
                })
                
                upcomingVideosWithSchedule.forEach(video => {
                  const scheduledTime = video.liveStreamingDetails?.scheduledStartTime
                  if (scheduledTime) {
                    const startTime = new Date(scheduledTime)
                  } else {
                  }
                })
              }
            } catch (scheduleError) {
            }
          } else {
          }
          
          const upcomingMatches = this.processUpcomingVideos(upcomingVideosWithSchedule)
          allMatches = [...allMatches, ...upcomingMatches]
        } else {
          // Handle API errors for TFT upcoming streams
          if (upcomingResponse.status === 403) {
          }
        }
      } catch (error) {
      }
      
      // Filter by date range
      const filteredMatches = allMatches
        .filter(match => withinRange(match.start, from, to))
        .filter((match, index, self) => 
          index === self.findIndex(m => m.id === match.id)
        )
      
      // If no matches found, return empty array (don't show anything)
      if (filteredMatches.length === 0) {
        return []
      }
      
      // Sort matches: LIVE first (with view count priority), then by start time
      return filteredMatches.sort((a, b) => {
        const aPriority = a.status === 'live' ? 0 : 1
        const bPriority = b.status === 'live' ? 0 : 1
        
        if (aPriority === bPriority) {
          // If both are live, sort by view count (descending)
          if (a.status === 'live' && b.status === 'live') {
            const aViews = a.viewCount || 0
            const bViews = b.viewCount || 0
            if (aViews !== bViews) {
              return bViews - aViews // Higher view count first
            }
            // If view counts are same, try concurrent viewers
            const aConcurrent = a.concurrentViewers || 0
            const bConcurrent = b.concurrentViewers || 0
            if (aConcurrent !== bConcurrent) {
              return bConcurrent - aConcurrent // Higher concurrent viewers first
            }
          }
          return new Date(a.start) - new Date(b.start)
        }
        
        return aPriority - bPriority
      })
      
    } catch (error) {
      return [] // Return empty array instead of sample data
    }
  },

  // Process live videos - only return the one with highest view count
  processLiveVideos(items) {
    const liveMatches = items
      .map(item => ({
        id: `tft-live-${item.id.videoId}`,
        game: 'tft',
        league: this.extractLeague(item.snippet.title),
        stage: this.extractStage(item.snippet.title),
        title: item.snippet.title, // Full YouTube video title
        description: item.snippet.description, // Video description
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url, // Best quality thumbnail
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        // Add view count and live streaming details
        viewCount: item.statistics?.viewCount ? parseInt(item.statistics.viewCount) : 0,
        concurrentViewers: item.liveStreamingDetails?.concurrentViewers ? 
          parseInt(item.liveStreamingDetails.concurrentViewers) : null,
        actualStartTime: item.liveStreamingDetails?.actualStartTime,
        home: { 
          name: this.extractPlayer1(item.snippet.title),
          logo: null,
          score: undefined
        },
        away: { 
          name: this.extractPlayer2(item.snippet.title),
          logo: null,
          score: undefined
        },
        start: new Date(),
        region: 'Global',
        stream: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        venue: 'TFT Championship',
        status: 'live',
        videoId: item.id.videoId
      }))
    
    // Return only the video with highest view count
    if (liveMatches.length === 0) {
      return []
    }
    
    // Find the video with highest view count
    const topVideo = liveMatches.reduce((prev, current) => {
      const prevViews = prev.viewCount || 0
      const currentViews = current.viewCount || 0
      
      // If view counts are equal, prefer the one with more concurrent viewers
      if (prevViews === currentViews) {
        const prevConcurrent = prev.concurrentViewers || 0
        const currentConcurrent = current.concurrentViewers || 0
        return currentConcurrent > prevConcurrent ? current : prev
      }
      
      return currentViews > prevViews ? current : prev
    })
    
    
    return [topVideo] // Return array with only the top video
  },

  // Process upcoming videos - return all upcoming videos
  processUpcomingVideos(items) {
    const upcomingMatches = items.map(item => ({
      id: `tft-upcoming-${item.id.videoId}`,
      game: 'tft',
      league: this.extractLeague(item.snippet.title),
      stage: this.extractStage(item.snippet.title),
      title: item.snippet.title, // Full YouTube video title
      description: item.snippet.description, // Video description
      thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url, // Best quality thumbnail
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      // Use scheduled start time if available, otherwise fall back to publishedAt
      scheduledStartTime: item.liveStreamingDetails?.scheduledStartTime,
      home: { 
        name: this.extractPlayer1(item.snippet.title),
        logo: null,
        score: undefined
      },
      away: { 
        name: this.extractPlayer2(item.snippet.title),
        logo: null,
        score: undefined
      },
      start: item.liveStreamingDetails?.scheduledStartTime ? 
             new Date(item.liveStreamingDetails.scheduledStartTime) : 
             new Date(item.snippet.publishedAt),
      region: 'Global',
      stream: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      venue: 'TFT Championship',
      status: 'upcoming',
      videoId: item.id.videoId
    }))

    upcomingMatches.forEach(video => {
      const startTime = video.start
    })

    return upcomingMatches // Return all upcoming videos
  },

  // Helper: Extract league name from title
  extractLeague(title) {
    const leaguePatterns = [
      /TFT World Championship|TFT Worlds|Teamfight Tactics World Championship/i,
      /TFT Championship|Teamfight Tactics Championship/i,
      /TFT Set \d+ Championship|Set \d+ Championship/i,
      /TFT Regional|TFT Masters|TFT Challenger/i,
      /TFT Tournament|Teamfight Tactics Tournament/i,
      /TFT Set \d+|Set \d+/i,
      /Riot Games.*TFT|TFT.*Riot/i,
      /Teamfight Tactics/i
    ]
    
    for (const pattern of leaguePatterns) {
      const match = title.match(pattern)
      if (match) return match[0]
    }
    
    return 'TFT Esports'
  },

  // Helper: Extract stage from title
  extractStage(title) {
    const stagePatterns = [
      /Grand Final|Chung kết|Finals/i,
      /Semi.?Final|Bán kết|Semifinals/i,
      /Quarter.?Final|Tứ kết|Quarterfinals/i,
      /Group Stage|Vòng bảng|Groups/i,
      /Playoff|Loại trực tiếp|Playoffs/i,
      /Week \d+|Tuần \d+|W\d+/i,
      /Day \d+|Ngày \d+|D\d+/i,
      /Round \d+|Vòng \d+|R\d+/i,
      /Set \d+ Championship|Set \d+/i,
      /Regional|Masters|Challenger/i
    ]
    
    for (const pattern of stagePatterns) {
      const match = title.match(pattern)
      if (match) return match[0]
    }
    
    return 'Championship'
  },

  // Helper: Extract player names (TFT is individual players, not teams)
  extractPlayer1(title) {
    // Look for pattern: Player1 vs Player2
    const vsPattern = /(.+?)\s+(vs|VS|v\/s|against)\s+(.+)/i
    const match = title.match(vsPattern)
    
    if (match) {
      return match[1].trim().split(/\s+/).slice(-1).join(' ') // Get last word before 'vs'
    }
    
    return 'Player A'
  },

  extractPlayer2(title) {
    const vsPattern = /(.+?)\s+(vs|VS|v\/s|against)\s+(.+)/i
    const match = title.match(vsPattern)
    
    if (match) {
      return match[3].trim().split(/\s+/).slice(0, 1).join(' ') // Get first word after 'vs'
    }
    
    return 'Player B'
  }
}
