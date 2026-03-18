import { withinRange } from '../utils/formatters.js'
import { youtubeApiManager } from './youtube.js'
import YouTubeCacheService from './youtubeCacheService.js'

export const PubgAdapter = {
  async fetch({ from, to }) {
    try {
      
      // PUBG BATTLEGROUNDS VIETNAM channel ID
      const CHANNEL_ID = 'UCeX2iXaH63w3BZ8Wae_JdEA' // Channel ID cho @PUBGBATTLEGROUNDSVIETNAM
      
      let allMatches = []
      
      // 1. Fetch live streams (with cache)
      try {
        const liveResponse = await YouTubeCacheService.getCachedData(
          'pubg',
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
                'pubg',
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
                
              }
            } catch (statsError) {
            }
          }
          
          const liveMatches = this.processLiveVideos(liveVideosWithStats)
          allMatches = [...allMatches, ...liveMatches]
        } else {
        }
      } catch (error) {
      }
      
      // 2. Fetch upcoming streams (with cache)
      try {
        const upcomingResponse = await YouTubeCacheService.getCachedData(
          'pubg',
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
                'pubg',
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
          // Handle API errors for upcoming streams
          if (upcomingResponse.status === 403) {
          }
        }
      } catch (error) {
      }
      
      // Filter by date range
      const filteredMatches = allMatches
        .filter(match => withinRange(match.start, from, to))
        .filter((match, index, self) => 
          index === self.findIndex(m => m.videoId === match.videoId)
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
        id: `pubg-live-${item.id.videoId}`,
        game: 'pubg',
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
          name: this.extractTeam1(item.snippet.title),
          logo: null,
          score: undefined
        },
        away: { 
          name: this.extractTeam2(item.snippet.title),
          logo: null,
          score: undefined
        },
        start: new Date(),
        region: 'Vietnam',
        stream: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        venue: 'PUBG BATTLEGROUNDS VIETNAM',
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
      id: `pubg-upcoming-${item.id.videoId}`,
      game: 'pubg',
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
        name: this.extractTeam1(item.snippet.title),
        logo: null,
        score: undefined
      },
      away: { 
        name: this.extractTeam2(item.snippet.title),
        logo: null,
        score: undefined
      },
      start: item.liveStreamingDetails?.scheduledStartTime ? 
             new Date(item.liveStreamingDetails.scheduledStartTime) : 
             new Date(item.snippet.publishedAt),
      region: 'Vietnam',
      stream: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      venue: 'PUBG BATTLEGROUNDS VIETNAM',
      status: 'upcoming',
      videoId: item.id.videoId
    }))

    upcomingMatches.forEach(video => {
      const startTime = video.start
    })

    return upcomingMatches // Return all upcoming videos
  },

  // Helper: Check if video title is a PUBG match
  isPUBGMatch(title) {
    const matchKeywords = [
      'vs', 'VS', 'v/s', 'đấu với', 'gặp',
      'final', 'finale', 'chung kết',
      'semi', 'bán kết', 'playoff',
      'match', 'trận', 'game',
      'tournament', 'giải đấu', 'championship'
    ]
    
    const lowerTitle = title.toLowerCase()
    return matchKeywords.some(keyword => lowerTitle.includes(keyword.toLowerCase()))
  },

  // Helper: Extract league name from title
  extractLeague(title) {
    const leaguePatterns = [
      /PMPL|PML|PMC|PGS|PUBG Mobile Pro League/i,
      /Vietnam Championship|VN Championship|Việt Nam/i,
      /Southeast Asia|SEA|Đông Nam Á/i,
      /Global Championship|World|Thế giới/i
    ]
    
    for (const pattern of leaguePatterns) {
      const match = title.match(pattern)
      if (match) return match[0]
    }
    
    return 'PUBG Tournament'
  },

  // Helper: Extract stage from title
  extractStage(title) {
    const stagePatterns = [
      /Grand Final|Chung kết/i,
      /Semi.?Final|Bán kết/i,
      /Quarter.?Final|Tứ kết/i,
      /Group Stage|Vòng bảng/i,
      /Playoff|Loại trực tiếp/i,
      /Week \d+|Tuần \d+/i,
      /Day \d+|Ngày \d+/i,
      /Round \d+|Vòng \d+/i
    ]
    
    for (const pattern of stagePatterns) {
      const match = title.match(pattern)
      if (match) return match[0]
    }
    
    return 'Tournament Match'
  },

  // Helper: Extract team names (basic implementation)
  extractTeam1(title) {
    // Look for pattern: Team1 vs Team2 or Team1 đấu với Team2
    const vsPattern = /(.+?)\s+(vs|VS|v\/s|đấu với|gặp)\s+(.+)/i
    const match = title.match(vsPattern)
    
    if (match) {
      return match[1].trim().split(/\s+/).slice(-2).join(' ') // Get last 2 words before 'vs'
    }
    
    return 'Team A'
  },

  extractTeam2(title) {
    const vsPattern = /(.+?)\s+(vs|VS|v\/s|đấu với|gặp)\s+(.+)/i
    const match = title.match(vsPattern)
    
    if (match) {
      return match[3].trim().split(/\s+/).slice(0, 2).join(' ') // Get first 2 words after 'vs'
    }
    
    return 'Team B'
  }
}
