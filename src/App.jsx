// Esports + Football Schedule — Professional Sports Calendar
// Stack: React + Vite, TailwindCSS, Framer Motion, Lucide React
// -------------------------------------------------------------------------
// Professional sports calendar with real-time API integration
// Features: Multi-sport support, real-time updates, beautiful UI, mobile responsive
// Sports: Valorant, PUBG, League of Legends, Football
// -------------------------------------------------------------------------

import React, { useEffect, useMemo, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Import mobile layout and hooks
import MobileLayout from './components/MobileLayout'
import { useIsMobile } from './hooks/useIsMobile'

import {
  Calendar as CalendarIcon,
  Clock,
  Globe2,
  MapPin,
  RefreshCw,
  Trophy,
  Eye,
  Play,
  Users,
  Target,
  Zap,

  TrendingUp,
  Gamepad2,
  Medal,
  Moon,
  Sun,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

// Import custom game icons
import valorantIcon from './images/valorant.png'
import lolIcon from './images/lol.png'
import footballIcon from './images/football.png'
import pubgIcon from './images/pubg.png'
import tftIcon from './images/tft.png'

// --- Styled Components ---------------------------------------------------
const Button = ({ className = '', children, variant = 'default', size = 'default', isDarkMode = false, ...props }) => {
  const variants = {
    default: isDarkMode 
      ? 'bg-gray-700/80 hover:bg-gray-600/80 border border-gray-600 text-gray-200 hover:text-white'
      : 'bg-white/80 hover:bg-white border border-gray-200 text-gray-700 hover:text-gray-900',
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0',
    secondary: isDarkMode
      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600'
      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200',
    outline: 'border-2 border-current bg-transparent hover:bg-current/10',
    ghost: isDarkMode
      ? 'bg-transparent hover:bg-gray-700/50 text-gray-300'
      : 'bg-transparent hover:bg-gray-100 text-gray-700',
    danger: 'bg-red-500 hover:bg-red-600 text-white border-0',
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    default: 'px-4 py-2 text-sm rounded-xl',
    lg: 'px-6 py-3 text-base rounded-xl',
  }

  return (
    <button
      {...props}
      className={`inline-flex items-center gap-2 font-medium shadow-sm outline-none transition-all duration-200 active:scale-95 ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  )
}

const Input = ({ className = '', ...props }) => (
  <input
    {...props}
    className={`w-full rounded-xl border border-gray-200 bg-white/50 backdrop-blur px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 ${className}`}
  />
)

const Select = ({ className = '', children, ...props }) => (
  <select
    {...props}
    className={`w-full rounded-xl border border-gray-200 bg-white/50 backdrop-blur px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 ${className}`}
  >
    {children}
  </select>
)

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    live: 'bg-red-50 text-red-700 border border-red-200 animate-pulse',
    upcoming: 'bg-blue-50 text-blue-700 border border-blue-200',
    finished: 'bg-green-50 text-green-700 border border-green-200',
    valorant: 'bg-red-50 text-red-700 border border-red-200',
    pubg: 'bg-orange-50 text-orange-700 border border-orange-200',
    lol: 'bg-blue-50 text-blue-700 border border-blue-200',
    tft: 'bg-purple-50 text-purple-700 border border-purple-200',
    football: 'bg-green-50 text-green-700 border border-green-200',
  }
  
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

// --- Utility Functions ---------------------------------------------------
const toDate = (v) => (v instanceof Date ? v : new Date(v))
const fmtTime = (d, opts = {}) => new Intl.DateTimeFormat('vi-VN', {
  hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'numeric', ...opts,
}).format(toDate(d))
const fmtDay = (d) => new Intl.DateTimeFormat('vi-VN', { 
  weekday: 'long', day: '2-digit', month: 'long' 
}).format(toDate(d))
const withinRange = (d, from, to) => {
  const t = toDate(d).getTime()
  return (!from || t >= toDate(from).getTime()) && (!to || t <= toDate(to).getTime())
}

// Helper function to clean team names by removing unnecessary words
const shortenTeamName = (teamName) => {
  if (!teamName || teamName === 'TBD') return teamName
  
  // Words to remove from team names
  const wordsToRemove = [
    'FC', 'CF', 'AC', 'SC', 'AS', 'RC', 'CD', 'CD.', 'C.D.',
    'Esports', 'Esport', 'E-sports', 'Gaming', 'Team',
    'Club', 'Football Club', 'Soccer Club',
     'Athletic', 'Atletico',
     'Town', 'County', 'Sport', 'de', 'Fútbol', 'Fútbol', 'Fútbol Club', 'F.C.', 'C.F.', 'A.C.', 'S.C.', 'A.S.', 'R.C.', 'C.D.', 'C.D',
  ]
  
  // Split team name into words
  let words = teamName.split(' ')
  
  // Remove unnecessary words (case insensitive)
  words = words.filter(word => {
    const wordLower = word.toLowerCase().replace(/[.,]/g, '')
    return !wordsToRemove.some(removeWord => 
      removeWord.toLowerCase() === wordLower
    )
  })
  
  // If all words were removed, return original name
  if (words.length === 0) {
    return teamName
  }
  
  // Join remaining words
  let cleanName = words.join(' ')
  
  // Special cases for common abbreviations
  const specialCases = {
    'Manchester Utd': 'Manchester United',
    'Man Utd': 'Manchester United',
    'Barcelona': 'Barça',
    'Bayern München': 'Bayern Munich',
    'Inter Milan': 'Inter',
    'AC Milan': 'Milan'
  }
  
  // Check if cleaned name matches any special case
  for (const [key, value] of Object.entries(specialCases)) {
    if (cleanName === key) {
      return value
    }
  }
  
  return cleanName
}

// Helper function to search for live streams on YouTube
const searchYouTubeLiveStream = async (match) => {
  try {
    // Build search query: team1 + team2 + league + "live"
    const searchQuery = [
      shortenTeamName(match.home?.name) || '',
      'vs',
      shortenTeamName(match.away?.name) || '',
      match.league,
      'live'
    ].filter(Boolean).join(' ')
    
    
    const data = await youtubeApiManager.makeRequest(
      `https://www.googleapis.com/youtube/v3/search?` +
      `part=snippet&type=video&eventType=live&maxResults=3&order=viewCount&` +
      `q=${encodeURIComponent(searchQuery)}`
    );
    
    if (!data) {
      return null
    }
    
    if (data.items && data.items.length > 0) {
      const video = data.items[0]
      const youtubeUrl = `https://www.youtube.com/watch?v=${video.id.videoId}`
      
      return youtubeUrl
    }
    
    return null
    
  } catch (error) {
    return null
  }
}

// Status helpers
const getStatusInfo = (status) => {
  switch (status) {
    case 'live': return { variant: 'live', label: 'LIVE', icon: Play }
    case 'finished': return { variant: 'finished', label: 'ENDED', icon: Medal }
    default: return { variant: 'upcoming', label: 'UPCOMING', icon: Clock }
  }
}

const getGameInfo = (game) => {
  switch (game) {
    case 'valorant': return { variant: 'valorant', label: 'VALORANT', icon: valorantIcon, color: 'from-red-500 to-pink-500', isImage: true }
    case 'pubg': return { variant: 'pubg', label: 'PUBG', icon: pubgIcon, color: 'from-orange-500 to-yellow-500', isImage: true }
    case 'lol': return { variant: 'lol', label: 'LOL', icon: lolIcon, color: 'from-blue-500 to-cyan-500', isImage: true }
    case 'tft': return { variant: 'tft', label: 'TFT', icon: tftIcon, color: 'from-purple-500 to-indigo-500', isImage: true }
    case 'football': return { variant: 'football', label: 'BÓNG ĐÁ', icon: footballIcon, color: 'from-green-500 to-emerald-500', isImage: true }
    default: return { variant: 'default', label: game.toUpperCase(), icon: Gamepad2, color: 'from-gray-500 to-gray-600', isImage: false }
  }
}

// Helper function to adjust Valorant API timezone (UTC to GMT+7)
const adjustValorantTimezone = (timestamp) => {
  if (!timestamp) return new Date()
  // If timestamp is in seconds, convert to milliseconds
  const timestampMs = timestamp < 1e12 ? timestamp * 1000 : timestamp
  const date = new Date(timestampMs)
  // Add 7 hours to convert from UTC to Vietnam timezone
  return new Date(date.getTime() + 7 * 60 * 60 * 1000)
}

// --- Team Logo Search Service --------------------------------------------
const TeamLogoSearchService = {
  // Cache to store team logo search results to avoid repeated API calls
  cache: new Map(),
  
  // Configuration
  config: {
    enabled: false, // TẮT tính năng tìm logo tạm thời
    maxCacheSize: 100, // Maximum number of cached results
    searchTimeout: 10000, // 10 seconds timeout for search requests
  },
  
  // Search for team logo using Google Custom Search API
  async searchTeamLogo(teamName, sport) {
    if (!teamName || !this.config.enabled) return null
    
    // Create cache key
    const cacheKey = `${sport}-${teamName.toLowerCase().trim()}`
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cachedResult = this.cache.get(cacheKey)
      return cachedResult
    }
    
    try {
      
      // Clean team name for better search results
      const cleanTeamName = teamName
        .replace(/\s*(Gaming|Esports|E-sports|Team|Club|FC|United)$/i, '')
        .trim()
      
      // Call our image search API with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.config.searchTimeout)
      
      const response = await fetch(`/api/image-search?teamName=${encodeURIComponent(cleanTeamName)}&sport=${encodeURIComponent(sport)}`, {
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`Search API error: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Extract the best logo URL from search results
      let logoUrl = null
      if (data.images && data.images.length > 0) {
        // Prefer images with smaller dimensions (likely logos) and from official sources
        const bestImage = data.images.find(img => {
          const domain = img.displayLink?.toLowerCase() || ''
          const isOfficialSource = domain.includes('liquipedia') || 
                                 domain.includes('vlr.gg') || 
                                 domain.includes('leaguepedia') ||
                                 domain.includes('lolesports') ||
                                 domain.includes('valorant') ||
                                 domain.includes('riotgames') ||
                                 domain.includes('fifa.com') ||
                                 domain.includes('uefa.com')
          
          const hasGoodDimensions = img.width && img.height && 
                                  img.width >= 64 && img.height >= 64 &&
                                  img.width <= 512 && img.height <= 512
          
          return isOfficialSource || hasGoodDimensions
        }) || data.images[0] // Fall back to first result
        
        logoUrl = bestImage.url
      }
      
      // Cache the result (even if null to avoid repeated failed searches)
      this.addToCache(cacheKey, logoUrl)
      
      return logoUrl
      
    } catch (error) {
      
      // Cache null result to avoid repeated failed searches
      this.addToCache(cacheKey, null)
      return null
    }
  },
  
  // Enhanced cache management with size limit
  addToCache(key, value) {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.config.maxCacheSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    
    this.cache.set(key, value)
  },
  
  // Enhance team object with logo if missing
  async enhanceTeamWithLogo(team, sport) {
    if (!team || !team.name || team.logo) {
      return team // Already has logo or no team name
    }
    
    const logoUrl = await this.searchTeamLogo(team.name, sport)
    return {
      ...team,
      logo: logoUrl || team.logo
    }
  },
  
  // Clear cache (useful for testing or memory management)
  clearCache() {
    this.cache.clear()
  },
  
  // Get cache statistics
  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.config.maxCacheSize,
      enabled: this.config.enabled
    }
  }
}

// --- API Adapters --------------------------------------------------------
const ValorantAdapter = {
  // Helper function to process live matches  
  async processLiveMatches(data) {
    if (!data.data?.segments) return []
    
    const matches = data.data.segments
      .filter(match => match.time_until_match === 'LIVE')
      .filter(match => match.team1 && match.team1 !== 'TBD' && match.team2 && match.team2 !== 'TBD') // Filter out TBD teams for LIVE matches
      .map(match => ({
        id: `val-live-${match.match_page?.split('/')[1] || Math.random()}`,
        game: 'valorant',
        league: match.match_event || 'VCT',
        stage: match.match_series || '',
        home: { 
          name: match.team1 || 'TBD', 
          logo: match.team1_logo || null,
          score: parseInt(match.score1) || 0,
          // Additional live data
          roundsCT: match.team1_round_ct !== 'N/A' ? parseInt(match.team1_round_ct) || 0 : null,
          roundsT: match.team1_round_t !== 'N/A' ? parseInt(match.team1_round_t) || 0 : null,
        },
        away: { 
          name: match.team2 || 'TBD', 
          logo: match.team2_logo || null,
          score: parseInt(match.score2) || 0,
          // Additional live data
          roundsCT: match.team2_round_ct !== 'N/A' ? parseInt(match.team2_round_ct) || 0 : null,
          roundsT: match.team2_round_t !== 'N/A' ? parseInt(match.team2_round_t) || 0 : null,
        },
        start: new Date(), // Live matches show current time
        region: 'International',
        stream: '', // Use YouTube search instead of API stream
        venue: match.match_event || '',
        status: 'live',
        // Live-specific data
        currentMap: match.current_map || '',
        mapNumber: match.map_number || '',
      }))

    // Enhance matches with team logos for teams that don't have logos
    const enhancedMatches = await Promise.all(
      matches.map(async (match) => {
        try {
          // Only search for logos if they're missing
          const enhancedHome = match.home.logo ? match.home : await TeamLogoSearchService.enhanceTeamWithLogo(match.home, 'valorant')
          const enhancedAway = match.away.logo ? match.away : await TeamLogoSearchService.enhanceTeamWithLogo(match.away, 'valorant')
          
          return {
            ...match,
            home: enhancedHome,
            away: enhancedAway
          }
        } catch (error) {
          return match // Return original match if enhancement fails
        }
      })
    )

    return enhancedMatches
  },

  // Helper function to process upcoming matches
  async processUpcomingMatches(data) {
    if (!data.data?.segments) return []
    
    const now = Date.now()
    const oneDayMs = 24 * 60 * 60 * 1000
    
    const matches = data.data.segments
      .filter(match => {
        // Only include matches within 1 day
        if (match.time_until_match) {
          const timeUntilMs = this.parseTimeUntil(match.time_until_match)
          return timeUntilMs <= oneDayMs
        }
        return true // Include if no time info
      })
      .map(match => ({
        id: `val-upcoming-${match.match_page?.split('/')[1] || Math.random()}`,
        game: 'valorant',
        league: match.match_event || 'VCT',
        stage: match.match_series || '',
        home: { 
          name: match.team1 || 'TBD', 
          logo: match.team1_logo || null,
          score: undefined // upcoming matches don't have scores
        },
        away: { 
          name: match.team2 || 'TBD', 
          logo: match.team2_logo || null,
          score: undefined // upcoming matches don't have scores
        },
        start: match.unix_timestamp ? adjustValorantTimezone(match.unix_timestamp) : new Date(Date.now() + Math.random() * 86400000),
        region: 'International',
        stream: '', // Use YouTube search instead of API stream
        venue: match.match_event || '',
        status: 'upcoming',
      }))

    // Enhance matches with team logos for teams that don't have logos
    const enhancedMatches = await Promise.all(
      matches.map(async (match) => {
        try {
          // Only search for logos if they're missing
          const enhancedHome = match.home.logo ? match.home : await TeamLogoSearchService.enhanceTeamWithLogo(match.home, 'valorant')
          const enhancedAway = match.away.logo ? match.away : await TeamLogoSearchService.enhanceTeamWithLogo(match.away, 'valorant')
          
          return {
            ...match,
            home: enhancedHome,
            away: enhancedAway
          }
        } catch (error) {
          return match // Return original match if enhancement fails
        }
      })
    )

    return enhancedMatches
  },

  // Helper function to process completed matches (results)
  async processCompletedMatches(data) {
    if (!data.data?.segments) return []
    
    const oneDayMs = 24 * 60 * 60 * 1000
    
    const matches = data.data.segments
      .filter(match => {
        // Only include matches completed within 1 day
        if (match.time_completed) {
          const timeCompletedMs = this.parseTimeAgo(match.time_completed)
          const withinOneDay = timeCompletedMs <= oneDayMs
          
          return withinOneDay
        }
        return true // Include if no time info
      })
      .map(match => ({
        id: `val-completed-${match.match_page?.split('/')[1] || Math.random()}`,
        game: 'valorant',
        league: match.tournament_name || 'VCT',
        stage: match.round_info || '',
        home: { 
          name: match.team1 || 'TBD', 
          logo: null, // Will be enhanced with logo search
          score: parseInt(match.score1) || 0
        },
        away: { 
          name: match.team2 || 'TBD', 
          logo: null, // Will be enhanced with logo search
          score: parseInt(match.score2) || 0
        },
        start: new Date(), // Use current time for completed matches within 1 day
        region: 'International',
        stream: '', // Use YouTube search instead of API stream
        venue: match.tournament_name || '',
        status: 'finished',
      }))

    // Enhance matches with team logos asynchronously
    const enhancedMatches = await Promise.all(
      matches.map(async (match) => {
        try {
          // Search for team logos if missing
          const [enhancedHome, enhancedAway] = await Promise.all([
            TeamLogoSearchService.enhanceTeamWithLogo(match.home, 'valorant'),
            TeamLogoSearchService.enhanceTeamWithLogo(match.away, 'valorant')
          ])
          
          return {
            ...match,
            home: enhancedHome,
            away: enhancedAway
          }
        } catch (error) {
          return match // Return original match if enhancement fails
        }
      })
    )

    return enhancedMatches
  },

  // Helper function to parse "4h 7m ago" or "2w 0d ago" format into milliseconds
  parseTimeAgo(timeString) {
    if (!timeString) return 0
    
    const regex = /(\d+)([wdhm])/g
    let totalMs = 0
    let match
    
    while ((match = regex.exec(timeString)) !== null) {
      const value = parseInt(match[1])
      const unit = match[2]
      
      switch (unit) {
        case 'w': totalMs += value * 7 * 24 * 60 * 60 * 1000; break  // weeks
        case 'd': totalMs += value * 24 * 60 * 60 * 1000; break      // days
        case 'h': totalMs += value * 60 * 60 * 1000; break          // hours
        case 'm': totalMs += value * 60 * 1000; break               // minutes
      }
    }
    
    return totalMs
  },

  // Helper function to parse "20h 0m from now" or "1w 2d from now" format into milliseconds
  parseTimeUntil(timeString) {
    if (!timeString) return 0
    
    const regex = /(\d+)([wdhm])/g
    let totalMs = 0
    let match
    
    while ((match = regex.exec(timeString)) !== null) {
      const value = parseInt(match[1])
      const unit = match[2]
      
      switch (unit) {
        case 'w': totalMs += value * 7 * 24 * 60 * 60 * 1000; break  // weeks
        case 'd': totalMs += value * 24 * 60 * 60 * 1000; break      // days
        case 'h': totalMs += value * 60 * 60 * 1000; break          // hours
        case 'm': totalMs += value * 60 * 1000; break               // minutes
      }
    }
    
    return totalMs
  },

  async fetch({ from, to }) {
    try {
      let allMatches = []

      // Fetch LIVE matches first (highest priority)
      try {
        const liveResponse = await fetch('/api/valorant?q=live_score')
        
        if (liveResponse.ok) {
          const liveData = await liveResponse.json()
          console.log('🔴 VALORANT LIVE API Response:', liveData)
          console.log('🔴 VALORANT LIVE Segments Count:', liveData.data?.segments?.length || 0)
          
          const liveMatches = await this.processLiveMatches(liveData)
          console.log('🔴 VALORANT LIVE Processed Matches:', liveMatches)
          allMatches = [...allMatches, ...liveMatches]
        } else {
          console.error('❌ VALORANT LIVE API Error - Response not OK:', liveResponse.status)
        }
      } catch (error) {
        console.error('❌ VALORANT LIVE API Error:', error)
      }

      // Fetch upcoming matches
      try {
        const upcomingResponse = await fetch('/api/valorant?q=upcoming')
        
        if (upcomingResponse.ok) {
          const upcomingData = await upcomingResponse.json()
          console.log('🔵 VALORANT UPCOMING API Response:', upcomingData)
          console.log('🔵 VALORANT UPCOMING Segments Count:', upcomingData.data?.segments?.length || 0)
          
          const upcomingMatches = await this.processUpcomingMatches(upcomingData)
          console.log('🔵 VALORANT UPCOMING Processed Matches:', upcomingMatches)
          allMatches = [...allMatches, ...upcomingMatches]
        } else {
          console.error('❌ VALORANT UPCOMING API Error - Response not OK:', upcomingResponse.status)
        }
      } catch (error) {
        console.error('❌ VALORANT UPCOMING API Error:', error)
      }

      // Fetch completed matches (results)
      try {
        const resultsResponse = await fetch('/api/valorant?q=results')
        
        if (resultsResponse.ok) {
          const resultsData = await resultsResponse.json()
          console.log('🟢 VALORANT RESULTS API Response:', resultsData)
          console.log('🟢 VALORANT RESULTS Segments Count:', resultsData.data?.segments?.length || 0)
          
          const completedMatches = await this.processCompletedMatches(resultsData)
          console.log('🟢 VALORANT RESULTS Processed Matches:', completedMatches)
          allMatches = [...allMatches, ...completedMatches]
        } else {
          console.error('❌ VALORANT RESULTS API Error - Response not OK:', resultsResponse.status)
        }
      } catch (error) {
        console.error('❌ VALORANT RESULTS API Error:', error)
      }

      // Filter matches by date range and remove duplicates
      const filteredMatches = allMatches
        .filter(match => withinRange(match.start, from, to))
        .filter((match, index, self) => 
          index === self.findIndex(m => m.id === match.id)
        )

      console.log('📊 VALORANT All Matches Count:', allMatches.length)
      console.log('📊 VALORANT Filtered Matches Count:', filteredMatches.length)
      console.log('📊 VALORANT Filtered Matches:', filteredMatches)

      // If no matches found, return sample data
      if (filteredMatches.length === 0) {
        console.log('⚠️ VALORANT No matches found, returning sample data')
        return createSampleData('valorant', from, to)
      }

      const sortedMatches = filteredMatches.sort((a, b) => {
        // LIVE matches get highest priority
        const aPriority = a.status === 'live' ? 0 : 1
        const bPriority = b.status === 'live' ? 0 : 1
        
        if (aPriority === bPriority) {
          return new Date(a.start) - new Date(b.start)
        }
        
        return aPriority - bPriority
      })
      
      console.log('✅ VALORANT Final Sorted Matches:', sortedMatches)
      console.log('✅ VALORANT Final Match Count:', sortedMatches.length)
      
      return sortedMatches
    } catch (error) {
      console.error('💥 VALORANT Adapter Fatal Error:', error)
      return createSampleData('valorant', from, to)
    }
  },
}

// Helper function to check YouTube API health and provide debugging info
const checkYouTubeAPIHealth = async (apiKey) => {
  try {
    const testResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?` +
      `part=snippet&q=test&type=video&maxResults=1&key=${apiKey}`
    )
    
    if (testResponse.ok) {
      return true
    } else {
      const errorData = await testResponse.json()
      
      if (testResponse.status === 403) {
      }
      return false
    }
  } catch (error) {
    return false
  }
}

// YouTube API Key Manager with fallback support
const YouTubeAPIManager = {
  // Array of API keys - add your API keys here
  apiKeys: [
    'AIzaSyC4ktJ7bCFJp30sFmHIggs4vgvXklny294', // Primary key
    'AIzaSyCHmBLPsIMhKJpxuOVGWK5OSHrwsIvRQbI', // Backup key 1
    'AIzaSyBd8I64KQA5fS_eQEDh5kpMM4416R3arrc', // Backup key 2
    // 'YOUR_BACKUP_API_KEY_3',
  ],
  
  currentKeyIndex: 0,
  
  // Get current active API key
  getCurrentKey() {
    return this.apiKeys[this.currentKeyIndex]
  },
  
  // Switch to next available API key
  switchToNextKey() {
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length
    const newKey = this.getCurrentKey()
    return newKey
  },
  
  // Check if we've tried all keys
  hasMoreKeys() {
    return this.currentKeyIndex < this.apiKeys.length - 1
  },
  
  // Reset to first key
  resetToFirstKey() {
    this.currentKeyIndex = 0
  },
  
  // Make request with fallback to other keys
  async makeRequest(url, retryCount = 0) {
    const currentKey = this.getCurrentKey()
    const fullUrl = url.includes('key=') ? url : `${url}&key=${currentKey}`
    
    try {
      const response = await fetch(fullUrl)
      
      if (response.ok) {
        const data = await response.json()
        return data
      } else if (response.status === 403 && this.hasMoreKeys() && retryCount < this.apiKeys.length) {
        this.switchToNextKey()
        return this.makeRequest(url, retryCount + 1)
      } else {
        return null // Return null for failed requests
      }
    } catch (error) {
      if (this.hasMoreKeys() && retryCount < this.apiKeys.length) {
        this.switchToNextKey()
        return this.makeRequest(url, retryCount + 1)
      } else {
        return null
      }
    }
  }
}

// Create alias for easier access
const youtubeApiManager = YouTubeAPIManager

const PubgAdapter = {
  async fetch({ from, to }) {
    try {
      
      // PUBG BATTLEGROUNDS VIETNAM channel ID
      const CHANNEL_ID = 'UCeX2iXaH63w3BZ8Wae_JdEA' // Channel ID cho @PUBGBATTLEGROUNDSVIETNAM
      
      let allMatches = []
      
      // 1. Fetch live streams
      try {
        const liveResponse = await youtubeApiManager.makeRequest(
          `https://www.googleapis.com/youtube/v3/search?` +
          `part=snippet&channelId=${CHANNEL_ID}&type=video&eventType=live&` +
          `maxResults=10&order=date`
        )
        
        if (liveResponse) {
          const liveData = liveResponse
          
          // Get video IDs for additional details (view count, etc.)
          const videoIds = liveData.items?.map(item => item.id.videoId).join(',')
          
          let liveVideosWithStats = liveData.items || []
          
          // Fetch video statistics if we have video IDs
          if (videoIds) {
            try {
              const statsData = await youtubeApiManager.makeRequest(
                `https://www.googleapis.com/youtube/v3/videos?` +
                `part=statistics,liveStreamingDetails&id=${videoIds}`
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
      
      // 2. Fetch upcoming streams
      try {
        const upcomingResponse = await youtubeApiManager.makeRequest(
          `https://www.googleapis.com/youtube/v3/search?` +
          `part=snippet&channelId=${CHANNEL_ID}&type=video&eventType=upcoming&` +
          `maxResults=10&order=date`
        )
        
        if (upcomingResponse) {
          const upcomingData = upcomingResponse
          
          // Filter out videos that are not truly upcoming
          const trulyUpcomingVideos = upcomingData.items?.filter(item => {
            // Only include videos with liveBroadcastContent: "upcoming"
            const isUpcoming = item.snippet.liveBroadcastContent === 'upcoming'
            
            if (!isUpcoming) {
            }
            
            return isUpcoming
          }) || []
          
          // Get video IDs for additional details (scheduled start time)
          const videoIds = trulyUpcomingVideos?.map(item => item.id.videoId).join(',')
          
          let upcomingVideosWithSchedule = trulyUpcomingVideos || []
          
          // Fetch scheduled start time if we have video IDs
          if (videoIds) {
            try {
              const scheduleData = await youtubeApiManager.makeRequest(
                `https://www.googleapis.com/youtube/v3/videos?` +
                `part=liveStreamingDetails&id=${videoIds}`
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
          const errorText = await upcomingResponse.text()
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
    
  }
}

const TftAdapter = {
  async fetch({ from, to }) {
    try {
      
      // TFT Esports channel ID (example - có thể thay đổi)
      const CHANNEL_ID = 'UCKxbHR8VG9AyXL-W07ocrWA' // Channel ID cho Riot Games hoặc kênh TFT chính thức
      
      let allMatches = []
      
      // 1. Fetch live streams
      try {
        const liveResponse = await youtubeApiManager.makeRequest(
          `https://www.googleapis.com/youtube/v3/search?` +
          `part=snippet&channelId=${CHANNEL_ID}&type=video&eventType=live&` +
          `maxResults=10&order=date`
        )
        
        if (liveResponse) {
          const liveData = liveResponse
          
          // Get video IDs for additional details (view count, etc.)
          const videoIds = liveData.items?.map(item => item.id.videoId).join(',')
          
          let liveVideosWithStats = liveData.items || []
          
          // Fetch video statistics if we have video IDs
          if (videoIds) {
            try {
              const statsData = await youtubeApiManager.makeRequest(
                `https://www.googleapis.com/youtube/v3/videos?` +
                `part=statistics,liveStreamingDetails&id=${videoIds}`
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
          const errorText = await liveResponse.text()
          if (liveResponse.status === 403) {
          }
        }
      } catch (error) {
      }
      
      // 2. Fetch upcoming streams
      try {
        const upcomingResponse = await youtubeApiManager.makeRequest(
          `https://www.googleapis.com/youtube/v3/search?` +
          `part=snippet&channelId=${CHANNEL_ID}&type=video&eventType=upcoming&` +
          `maxResults=10&order=date`
        )
        
        if (upcomingResponse) {
          const upcomingData = upcomingResponse
          
          // Filter out videos that are not truly upcoming
          const trulyUpcomingVideos = upcomingData.items?.filter(item => {
            // Only include videos with liveBroadcastContent: "upcoming"
            const isUpcoming = item.snippet.liveBroadcastContent === 'upcoming'
            
            if (!isUpcoming) {
            }
            
            return isUpcoming
          }) || []
          
          // Get video IDs for additional details (scheduled start time)
          const videoIds = trulyUpcomingVideos?.map(item => item.id.videoId).join(',')
          
          let upcomingVideosWithSchedule = trulyUpcomingVideos || []
          
          // Fetch scheduled start time if we have video IDs
          if (videoIds) {
            try {
              const scheduleData = await youtubeApiManager.makeRequest(
                `https://www.googleapis.com/youtube/v3/videos?` +
                `part=liveStreamingDetails&id=${videoIds}`
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
          const errorText = await upcomingResponse.text()
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

const LolAdapter = {
  async fetch({ from, to }) {
    try {
      // Add timeout for LoL API
      const controller = new AbortController()
      setTimeout(() => controller.abort(), 8000) // 8 second timeout
      
      const response = await fetch('/api/lol', {
        signal: controller.signal
      })
      
      if (!response.ok) {
        return createSampleData('lol', from, to)
      }
      
      const data = await response.json()
      
      // DEBUG: Log toàn bộ response từ LoL API
      // DEBUG: Log cụ thể phần events
      if (data.data?.schedule?.events) {
        
        // DEBUG: Check streams data specifically
        data.data.schedule.events.forEach((event, index) => {
          if (event.streams && event.streams.length > 0) {
            event.streams.forEach((stream, streamIndex) => {
            })
          } else {
          }
        })
      } else {
      }
      
      if (!data.data?.schedule?.events) return createSampleData('lol', from, to)
      
      const matches = data.data.schedule.events.map(event => ({
        id: `lol-${event.match?.id || Math.random()}`,
        game: 'lol',
        league: event.league?.name || 'LoL Esports',
        stage: event.match?.strategy?.count ? `Bo${event.match.strategy.count}` : (event.match?.strategy?.type || event.blockName || ''),
        home: { 
          name: event.match?.teams?.[0]?.name || 'TBD', 
          logo: event.match?.teams?.[0]?.image || null, // Will be enhanced if null
          score: (event.state === 'completed' || event.state === 'inProgress') ? event.match?.teams?.[0]?.result?.gameWins : undefined
        },
        away: { 
          name: event.match?.teams?.[1]?.name || 'TBD', 
          logo: event.match?.teams?.[1]?.image || null, // Will be enhanced if null
          score: (event.state === 'completed' || event.state === 'inProgress') ? event.match?.teams?.[1]?.result?.gameWins : undefined
        },
        start: new Date(event.startTime),
        region: event.league?.region || 'International',
        stream: '', // Use YouTube search instead of API stream
        venue: event.league?.name || '',
        status: event.state === 'inProgress' ? 'live' :
                event.state === 'completed' ? 'finished' : 'upcoming',
        // Live-specific data for LoL
        currentGame: event.state === 'inProgress' ? (event.match?.games?.find(game => game.state === 'inProgress')?.number || '') : undefined,
        bestOf: event.match?.strategy?.count || undefined,
        liveGameState: event.state === 'inProgress' ? 'In Progress' : undefined,
      })).filter(match => withinRange(match.start, from, to))
        .filter(match => {
          // Filter out EMEA Masters league
          if (match.league === 'EMEA Masters') {
            return false
          }
          return true
        })
        .filter(match => {
          if (match.status === 'live') {
            return match.home?.name !== 'TBD' && match.away?.name !== 'TBD'
          }
          return true // Keep all non-live matches
        })

      // Enhance matches with team logos for teams that don't have logos
      const enhancedMatches = await Promise.all(
        matches.map(async (match) => {
          try {
            // Only search for logos if they're missing
            const enhancedHome = match.home.logo ? match.home : await TeamLogoSearchService.enhanceTeamWithLogo(match.home, 'lol')
            const enhancedAway = match.away.logo ? match.away : await TeamLogoSearchService.enhanceTeamWithLogo(match.away, 'lol')
            
            return {
              ...match,
              home: enhancedHome,
              away: enhancedAway
            }
          } catch (error) {
            return match // Return original match if enhancement fails
          }
        })
      )
      
      // DEBUG: Log processed matches
      
      // Sort LoL matches: LIVE first, then by start time
      const sortedMatches = enhancedMatches.sort((a, b) => {
        const aPriority = a.status === 'live' ? 0 : 1
        const bPriority = b.status === 'live' ? 0 : 1
        
        if (aPriority === bPriority) {
          return new Date(a.start) - new Date(b.start)
        }
        
        return aPriority - bPriority
      })
      
      // 🔍 DEBUG: Log final sorted matches
      
      return sortedMatches
    } catch (error) {
      return createSampleData('lol', from, to)
    }
  }
}

const FootballAdapter = {
  async fetch({ from, to }) {
    try {
      // Use Vite proxy instead of direct API calls
      const baseURL = '/api/football'
      
      // Test API connection first with timeout
      try {
        const controller = new AbortController()
        setTimeout(() => controller.abort(), 5000) // 5 second timeout
        
        const testResponse = await fetch('/api/football/competitions', {
          signal: controller.signal
        })
        if (!testResponse.ok) {
          // If test fails, return sample data immediately
          return createSampleData('football', from, to)
        }
      } catch (apiError) {
        // If API fails, return sample data immediately
        return createSampleData('football', from, to)
      }
      
      // Major league IDs on football-data.org (reduced list to avoid rate limits)
      const leagues = [
        { id: 'PL', name: 'Premier League' },
        { id: 'PD', name: 'LaLiga' },
        { id: 'CL', name: 'Champions League' },
      ]
      
      let allMatches = []
      
      // Format dates for API
      const formatDate = (date) => {
        return date.toISOString().split('T')[0]
      }
      
      const dateFrom = formatDate(from || new Date())
      const dateTo = formatDate(to || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
      
      for (const league of leagues) {
        try {
          // Use proxy endpoint with correct URL structure
          const response = await fetch(
            `/api/football/competitions/${league.id}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`
          )
          
          if (!response.ok) {
            const errorText = await response.text()
            
            // If it's a 400 error (bad request), likely API key issue
            if (response.status === 400) {
              return createSampleData('football', from, to)
            }
            continue
          }
          
          const data = await response.json()
          
          if (data.matches) {
            const matches = data.matches.map(match => {
              // Map competition names to preferred display names
              const leagueNameMap = {
                'Primera Division': 'LaLiga',
                'Primera División': 'LaLiga',
                'Premier League': 'Premier League',
                'UEFA Champions League': 'Champions League'
              }
              
              const displayLeagueName = leagueNameMap[match.competition?.name] || match.competition?.name || league.name
              
              return {
                id: `foot-${match.id}`,
                game: 'football',
                league: displayLeagueName,
              stage: match.stage === 'REGULAR_SEASON' ? 
                `Vòng ${match.matchday || ''}` : 
                match.stage?.replace('_', ' ') || '',
              home: { 
                name: match.homeTeam?.name || 'Home',
                logo: match.homeTeam?.crest || null, // Will be enhanced if null
                score: (match.status === 'FINISHED' || match.status === 'IN_PLAY' || match.status === 'PAUSED') ? match.score?.fullTime?.home : undefined
              },
              away: { 
                name: match.awayTeam?.name || 'Away',
                logo: match.awayTeam?.crest || null, // Will be enhanced if null
                score: (match.status === 'FINISHED' || match.status === 'IN_PLAY' || match.status === 'PAUSED') ? match.score?.fullTime?.away : undefined
              },
              start: new Date(match.utcDate),
              venue: match.venue || '',
              region: match.area?.name || match.competition?.area?.name || 'International',
              stream: '', // Use YouTube search instead of API stream
              status: match.status === 'FINISHED' ? 'finished' :
                      match.status === 'IN_PLAY' || match.status === 'PAUSED' ? 'live' : 'upcoming',
              // Live-specific data for Football
              currentMinute: (match.status === 'IN_PLAY' || match.status === 'PAUSED') ? match.minute : undefined,
              halfTime: match.status === 'PAUSED' ? 'Giờ nghỉ giải lao' : undefined,
              referee: match.referees?.[0]?.name || undefined,
            }
            })
            
            // Enhance matches with team logos for teams that don't have logos
            const enhancedMatches = await Promise.all(
              matches.map(async (match) => {
                try {
                  // Only search for logos if they're missing
                  const enhancedHome = match.home.logo ? match.home : await TeamLogoSearchService.enhanceTeamWithLogo(match.home, 'football')
                  const enhancedAway = match.away.logo ? match.away : await TeamLogoSearchService.enhanceTeamWithLogo(match.away, 'football')
                  
                  return {
                    ...match,
                    home: enhancedHome,
                    away: enhancedAway
                  }
                } catch (error) {
                  return match // Return original match if enhancement fails
                }
              })
            )
            
            allMatches = [...allMatches, ...enhancedMatches]
          }
        } catch (err) {
        }
      }
      
      // Remove duplicates
      const uniqueMatches = allMatches.filter((match, index, self) => 
        index === self.findIndex(m => m.id === match.id)
      )
      
      const filteredMatches = uniqueMatches
        .filter(match => withinRange(match.start, from, to))
        .filter(match => {
          // Filter out LIVE matches with TBD teams
          if (match.status === 'live') {
            return match.home?.name !== 'TBD' && match.away?.name !== 'TBD' && 
                   match.home?.name !== 'Home' && match.away?.name !== 'Away'
          }
          return true // Keep all non-live matches
        })
      
      if (filteredMatches.length === 0) {
        return createSampleData('football', from, to)
      }
      
      // Sort Football matches: LIVE first, then by start time
      return filteredMatches.sort((a, b) => {
        const aPriority = a.status === 'live' ? 0 : 1
        const bPriority = b.status === 'live' ? 0 : 1
        
        if (aPriority === bPriority) {
          return new Date(a.start) - new Date(b.start)
        }
        
        return aPriority - bPriority
      })
    } catch (error) {
      return createSampleData('football', from, to)
    }
  }
}

// Sample data generator for fallback
function createSampleData(game, from, to) {
  const now = new Date()
  const sampleData = {
    valorant: [
      {
        id: `val-sample-live`,
        game: 'valorant',
        league: 'Valorant Champions 2025',
        stage: 'Playoffs: Lower Round 1',
        home: { 
          name: 'Team Heretics', 
          score: 1,
          roundsCT: null,
          roundsT: 3,
          logo: 'https://owcdn.net/img/637b755224c12.png'
        },
        away: { 
          name: 'GIANTX', 
          score: 0,
          roundsCT: 12,
          roundsT: null,
          logo: 'https://owcdn.net/img/657b2f3fcd199.png'
        },
        start: new Date(),
        region: 'International',
        stream: '', // Use YouTube search instead of hardcoded stream
        venue: 'Valorant Champions 2025',
        status: 'live',
        currentMap: 'Lotus',
        mapNumber: '2',
      },
      {
        id: `val-sample-1`,
        game: 'valorant',
        league: 'Valorant Champions 2025',
        stage: 'Playoffs: Upper Semifinals',
        home: { name: 'FNATIC', score: 2 },
        away: { name: 'Paper Rex', score: 1 },
        start: new Date(now.getTime() - 3 * 60 * 60 * 1000),
        region: 'International',
        stream: '', // Use YouTube search instead of hardcoded stream
        venue: 'Valorant Champions 2025',
        status: 'finished',
      },
      {
        id: `val-sample-2`,
        game: 'valorant',
        league: 'Valorant Champions 2025',
        stage: 'Playoffs: Lower Round 1',
        home: { name: 'DRX', score: 2 },
        away: { name: 'G2 Esports', score: 1 },
        start: new Date(now.getTime() - 4 * 60 * 60 * 1000),
        region: 'International',
        stream: '', // Use YouTube search instead of hardcoded stream
        venue: 'Valorant Champions 2025',
        status: 'finished',
      },
      {
        id: `val-sample-3`,
        game: 'valorant',
        league: 'Valorant Champions 2025',
        stage: 'Playoffs: Upper Semifinals',
        home: { name: 'Sentinels' },
        away: { name: 'Team Liquid' },
        start: new Date(now.getTime() + 20 * 60 * 60 * 1000),
        region: 'International',
        stream: '', // Use YouTube search instead of hardcoded stream
        venue: 'Valorant Champions 2025',
        status: 'upcoming',
      }
    ],
    pubg: [
      {
        id: `pubg-sample-1`,
        game: 'pubg',
        league: 'PGS Championships',
        stage: 'Grand Finals',
        title: 'PUBG Global Championship 2025 - Grand Finals: Gen.G vs DAMWON KIA',
        description: 'Trận chung kết gay cấn nhất PGS 2025 giữa hai đội tuyển hàng đầu. Ai sẽ trở thành nhà vô địch?',
        thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        channelTitle: 'PUBG BATTLEGROUNDS VIETNAM',
        home: { name: 'Gen.G', score: 2 },
        away: { name: 'DAMWON KIA', score: 0 },
        start: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        region: 'Global',
        stream: '', // Use YouTube search instead of hardcoded stream
        venue: 'Seoul Arena',
        status: 'finished',
        videoId: 'sample123'
      },
      {
        id: `pubg-sample-live`,
        game: 'pubg',
        league: 'PMPL Vietnam',
        stage: 'Week 3',
        title: '[LIVE] PMPL Vietnam Season 5 - Team Flash vs Divine Esports',
        description: 'Trực tiếp trận đấu PMPL Vietnam giữa Team Flash và Divine Esports. Đây là trận đấu quyết định vị trí đầu bảng!',
        thumbnail: 'https://i.ytimg.com/vi/live_stream/maxresdefault_live.jpg',
        channelTitle: 'PUBG BATTLEGROUNDS VIETNAM',
        viewCount: 15420,
        concurrentViewers: 8750,
        home: { name: 'Team Flash', score: 1 },
        away: { name: 'Divine Esports', score: 0 },
        start: new Date(),
        region: 'Vietnam',
        stream: '', // Use YouTube search instead of hardcoded stream
        venue: 'PUBG BATTLEGROUNDS VIETNAM',
        status: 'live',
        videoId: 'live456'
      }
    ],
    tft: [
      {
        id: `tft-sample-live`,
        game: 'tft',
        league: 'TFT World Championship',
        stage: 'Grand Finals',
        title: '[LIVE] TFT World Championship 2025 - dishsoap vs Socks',
        description: 'Trận chung kết TFT World Championship 2025 giữa dishsoap và Socks. Ai sẽ trở thành nhà vô địch thế giới?',
        thumbnail: 'https://i.ytimg.com/vi/tft_live/maxresdefault_live.jpg',
        channelTitle: 'Riot Games',
        viewCount: 45230,
        concurrentViewers: 28500,
        home: { name: 'dishsoap', score: 2 },
        away: { name: 'Socks', score: 1 },
        start: new Date(),
        region: 'Global',
        stream: '', // Use YouTube search instead of hardcoded stream
        venue: 'TFT Championship',
        status: 'live',
        videoId: 'tft_live123'
      },
      {
        id: `tft-sample-1`,
        game: 'tft',
        league: 'TFT World Championship',
        stage: 'Semi Finals',
        title: 'TFT World Championship 2025 - Milk vs spaceball',
        description: 'Trận bán kết căng thẳng giữa Milk và spaceball tại TFT World Championship 2025.',
        thumbnail: 'https://i.ytimg.com/vi/tft_finished/maxresdefault.jpg',
        channelTitle: 'Riot Games',
        home: { name: 'Milk', score: 3 },
        away: { name: 'spaceball', score: 2 },
        start: new Date(now.getTime() - 3 * 60 * 60 * 1000),
        region: 'Global',
        stream: '', // Use YouTube search instead of hardcoded stream
        venue: 'TFT Championship',
        status: 'finished',
        videoId: 'tft_finished456'
      },
      {
        id: `tft-sample-2`,
        game: 'tft',
        league: 'TFT Set 12 Tournament',
        stage: 'Round 1',
        title: 'TFT Set 12 Championship - kurumx vs aespa',
        description: 'Upcoming match trong TFT Set 12 Championship giữa kurumx và aespa.',
        thumbnail: 'https://i.ytimg.com/vi/tft_upcoming/maxresdefault.jpg',
        channelTitle: 'Riot Games',
        home: { name: 'kurumx' },
        away: { name: 'aespa' },
        start: new Date(now.getTime() + 8 * 60 * 60 * 1000),
        region: 'Global',
        stream: '', // Use YouTube search instead of hardcoded stream
        venue: 'TFT Championship',
        status: 'upcoming',
        videoId: 'tft_upcoming789'
      }
    ],
    lol: [
      {
        id: `lol-sample-live`,
        game: 'lol',
        league: 'LCK',
        stage: 'Spring Playoffs',
        home: { name: 'T1', score: 1 },
        away: { name: 'Gen.G', score: 0 },
        start: new Date(),
        region: 'Korea',
        stream: '', // Use YouTube search instead of hardcoded stream
        venue: 'LoL Park',
        status: 'live',
        currentGame: 'Game 2',
        bestOf: 5,
        liveGameState: 'In Progress',
      },
      {
        id: `lol-sample-1`,
        game: 'lol',
        league: 'LCK',
        stage: 'Spring Playoffs',
        home: { name: 'DRX', score: 3 },
        away: { name: 'KT Rolster', score: 1 },
        start: new Date(now.getTime() - 4 * 60 * 60 * 1000),
        region: 'Korea',
        stream: '', // Use YouTube search instead of hardcoded stream
        venue: 'LoL Park',
        status: 'finished',
      },
      {
        id: `lol-sample-2`,
        game: 'lol',
        league: 'LPL',
        stage: 'Regular Season',
        home: { name: 'JDG' },
        away: { name: 'BLG' },
        start: new Date(now.getTime() + 26 * 60 * 60 * 1000),
        region: 'China',
        stream: '', // Use YouTube search instead of hardcoded stream
        venue: 'LPL Arena',
        status: 'upcoming',
      }
    ],
    football: [
      {
        id: `foot-sample-live`,
        game: 'football',
        league: 'Premier League',
        stage: 'Vòng 8',
        home: { name: 'Manchester United', score: 1 },
        away: { name: 'Liverpool', score: 1 },
        start: new Date(),
        region: 'England',
        stream: '', // Use YouTube search instead of hardcoded stream
        venue: 'Old Trafford',
        status: 'live',
        currentMinute: 67,
        referee: 'Michael Oliver',
      },
      {
        id: `foot-sample-1`,
        game: 'football',
        league: 'Premier League',
        stage: 'Vòng 8',
        home: { name: 'Manchester City', score: 2 },
        away: { name: 'Arsenal', score: 1 },
        start: new Date(now.getTime() - 5 * 60 * 60 * 1000),
        region: 'England',
        stream: '', // Use YouTube search instead of hardcoded stream
        venue: 'Etihad Stadium',
        status: 'finished',
      },
      {
        id: `foot-sample-2`,
        game: 'football',
        league: 'LaLiga',
        stage: 'Vòng 9',
        home: { name: 'Real Madrid' },
        away: { name: 'Barcelona' },
        start: new Date(now.getTime() + 72 * 60 * 60 * 1000),
        region: 'Spain',
        stream: '', // Use YouTube search instead of hardcoded stream
        venue: 'Santiago Bernabéu',
        status: 'upcoming',
      }
    ]
  }
  
  return (sampleData[game] || []).filter(match => withinRange(match.start, from, to))
}

const adapters = {
  valorant: ValorantAdapter,
  pubg: PubgAdapter,
  tft: TftAdapter,
  lol: LolAdapter,
  football: FootballAdapter,
}

// --- Sport Categories -----------------------------------------------------
const sports = [
  { id: 'all', label: 'Tất cả', icon: TrendingUp, color: 'from-purple-500 to-pink-500', isImage: false },
  { id: 'valorant', label: 'Valorant', icon: valorantIcon, color: 'from-red-500 to-pink-500', isImage: true },
  { id: 'pubg', label: 'PUBG', icon: pubgIcon, color: 'from-orange-500 to-yellow-500', isImage: true },
  { id: 'tft', label: 'TFT', icon: tftIcon, color: 'from-purple-500 to-indigo-500', isImage: true },
  { id: 'lol', label: 'LOL', icon: lolIcon, color: 'from-blue-500 to-cyan-500', isImage: true },
  { id: 'football', label: 'Bóng Đá', icon: footballIcon, color: 'from-green-500 to-emerald-500', isImage: true },
]

// --- Custom Hook for Schedule Data ---------------------------------------
function useSchedule({ activeSport, from, to }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true
    
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        let allMatches = []
        
        if (activeSport === 'all') {
          // For "all" mode, use different time ranges for different game types
          const now = new Date()
          
          // Extended time range for PUBG/TFT (30 days future)
          const extendedFrom = new Date(now.getTime() - 1 * 60 * 60 * 1000) // 1 hour ago
          const extendedTo = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days
          
          // Standard time range for other sports (48 hours)
          const standardFrom = from // Use the passed from parameter (24 hours ago)
          const standardTo = to // Use the passed to parameter (48 hours)
          
          // Fetch from all adapters with appropriate time ranges
          const results = await Promise.allSettled([
            adapters.valorant.fetch({ from: standardFrom, to: standardTo }),
            adapters.pubg.fetch({ from: extendedFrom, to: extendedTo }),
            adapters.tft.fetch({ from: extendedFrom, to: extendedTo }),
            adapters.lol.fetch({ from: standardFrom, to: standardTo }),
            adapters.football.fetch({ from: standardFrom, to: standardTo }),
          ])
          
          results.forEach((result, index) => {
            const adapterNames = ['valorant', 'pubg', 'tft', 'lol', 'football']
            if (result.status === 'fulfilled') {
              allMatches = [...allMatches, ...result.value]
            } else {
            }
          })
        } else {
          // Fetch from specific adapter
          const adapter = adapters[activeSport]
          if (adapter) {
            allMatches = await adapter.fetch({ from, to })
          } else {
          }
        }
        
        if (isMounted) {
          // Sort matches: LIVE first, then by start time
          const sortedMatches = allMatches.sort((a, b) => {
            // LIVE matches get highest priority (0)
            const aPriority = a.status === 'live' ? 0 : 1
            const bPriority = b.status === 'live' ? 0 : 1
            
            // If both have same priority, sort by start time
            if (aPriority === bPriority) {
              return new Date(a.start) - new Date(b.start)
            }
            
            // Otherwise, sort by priority (LIVE first)
            return aPriority - bPriority
          })
          
          setData(sortedMatches)
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Không thể tải dữ liệu')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchData()
    
    return () => {
      isMounted = false
    }
  }, [activeSport, from?.toString(), to?.toString()])

  return { data, loading, error, refetch: () => window.location.reload() }
}

// --- Watch Live Button Component ------------------------------------------
function WatchLiveButton({ match }) {
  const [isSearching, setIsSearching] = useState(false)
  const [foundStream, setFoundStream] = useState(null)
  
  const handleWatchLive = async () => {
    // If match already has stream, use it
    if (match.stream) {
      window.open(match.stream, '_blank')
      return
    }
    
    // If we already found a stream, use it
    if (foundStream) {
      window.open(foundStream, '_blank')
      return
    }
    
    // Special handling for football matches
    if (match.game === 'football') {
      window.open('https://bit.ly/tiengruoi', '_blank')
      return
    }
    
    // Search for YouTube live stream for other sports
    setIsSearching(true)
    try {
      const youtubeUrl = await searchYouTubeLiveStream(match)
      if (youtubeUrl) {
        setFoundStream(youtubeUrl)
        window.open(youtubeUrl, '_blank')
      } else {
        alert('Không tìm thấy live stream cho trận đấu này trên YouTube')
      }
    } catch (error) {
      alert('Lỗi khi tìm kiếm live stream')
    } finally {
      setIsSearching(false)
    }
  }
  
  return (
    <Button
      variant="danger"
      size="sm"
      onClick={handleWatchLive}
      className="animate-pulse"
      disabled={isSearching}
    >
      <Play className="h-3 w-3" />
      {isSearching ? 'Đang tìm...' : 'Xem Live'}
    </Button>
  )
}

// --- Match Card Component -------------------------------------------------
function MatchCard({ match, isDarkMode }) {
  const statusInfo = getStatusInfo(match.status)
  const gameInfo = getGameInfo(match.game)
  const StatusIcon = statusInfo.icon
  const GameIcon = gameInfo.icon

  // Special layout for PUBG (YouTube-based)
  if (match.game === 'pubg') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ y: -4 }}
        className={`group relative overflow-hidden rounded-2xl backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 ${
          isDarkMode 
            ? 'bg-gray-800/95 border border-gray-600/60 hover:bg-gray-700/95' 
            : 'bg-gray-200/95 border border-gray-400/60 hover:bg-gray-100/95'
        } p-6`}
      >
        {/* Background Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gameInfo.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
        
        {/* PUBG YouTube Video Layout */}
        <div className="space-y-4">
          {/* Header - Same format as other cards */}
          <div className="grid grid-cols-3 items-center mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${gameInfo.color}`}>
                {gameInfo.isImage ? (
                  <img src={gameInfo.icon} alt={gameInfo.label} className="h-4 w-4 object-contain" />
                ) : (
                  <GameIcon className="h-4 w-4 text-white" />
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-center">

              <Badge variant={statusInfo.variant}>
                <StatusIcon className="h-3 w-3" />
                {statusInfo.label}
              </Badge>
            </div>
            
            <div className={`flex items-center gap-2 text-sm justify-end ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <Clock className="h-4 w-4" />
              {fmtTime(match.start)}
            </div>
          </div>

          {/* Video Thumbnail - Only show for live videos, not upcoming */}
          {match.thumbnail && match.status !== 'upcoming' && (
            <div 
              className="relative rounded-lg overflow-hidden aspect-video bg-gray-900 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => {
                if (match.stream) {
                  window.open(match.stream, '_blank')
                } else {
                  // Fallback to YouTube search if no direct stream URL
                  const searchQuery = `${match.title || match.league} live stream`
                  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`
                  window.open(youtubeSearchUrl, '_blank')
                }
              }}
            >
              <img 
                src={match.thumbnail} 
                alt={match.title}
                className="w-full h-full object-cover"
              />
              {/* Play overlay for live streams */}
              {match.status === 'live' && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 animate-pulse">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    LIVE
                  </div>
                </div>
              )}
              {/* Click hint overlay */}
              <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                <div className="bg-black/60 text-white px-4 py-2 rounded-lg text-sm font-medium">
                  Click để xem
                </div>
              </div>
            </div>
          )}

          {/* Video Title */}
          <div>
            <h3 className={`font-semibold text-lg leading-tight line-clamp-2 ${
              isDarkMode ? 'text-gray-100' : 'text-gray-900'
            }`}>
              {match.title || match.league || 'PUBG Tournament'}
            </h3>
            
            {/* View count and live viewers info */}
            <div className={`flex items-center gap-4 mt-2 text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {match.status === 'live' && match.concurrentViewers && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">
                    {match.concurrentViewers.toLocaleString()} đang xem
                  </span>
                </div>
              )}
              
              {match.viewCount > 0 && (
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{match.viewCount.toLocaleString()} lượt xem</span>
                </div>
              )}
            </div>
          </div>

          {/* Live match info for PUBG */}
          {/* {match.status === 'live' && (
            <div className={`p-3 rounded-lg ${
              isDarkMode 
                ? 'bg-gray-700/80 border border-gray-600/60' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className={`font-semibold ${
                    isDarkMode ? 'text-red-300' : 'text-red-800'
                  }`}>
                    Đang phát trực tiếp
                  </span>
                </div>
                
                <WatchLiveButton match={match} />
              </div>
            </div>
          )} */}
        </div>
      </motion.div>
    )
  }

  // Special layout for TFT (YouTube-based, similar to PUBG)
  if (match.game === 'tft') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ y: -4 }}
        className={`group relative overflow-hidden rounded-2xl backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 ${
          isDarkMode 
            ? 'bg-gray-800/95 border border-gray-600/60 hover:bg-gray-700/95' 
            : 'bg-gray-200/95 border border-gray-400/60 hover:bg-gray-100/95'
        } p-6`}
      >
        {/* Background Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gameInfo.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
        
        {/* TFT YouTube Video Layout */}
        <div className="space-y-4">
          {/* Header - Same format as PUBG cards */}
          <div className="grid grid-cols-3 items-center mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${gameInfo.color}`}>
                {gameInfo.isImage ? (
                  <img src={gameInfo.icon} alt={gameInfo.label} className="h-4 w-4 object-contain" />
                ) : (
                  <GameIcon className="h-4 w-4 text-white" />
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <Badge variant={statusInfo.variant}>
                <StatusIcon className="h-3 w-3" />
                {statusInfo.label}
              </Badge>
            </div>
            
            <div className={`flex items-center gap-2 text-sm justify-end ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <Clock className="h-4 w-4" />
              {fmtTime(match.start)}
            </div>
          </div>

          {/* Video Title */}
          <div>
            <h3 className={`font-semibold text-lg leading-tight line-clamp-2 ${
              isDarkMode ? 'text-gray-100' : 'text-gray-900'
            }`}>
              {match.title || match.league || 'TFT Tournament'}
            </h3>
            
            {/* View count and live viewers info */}
            <div className={`flex items-center gap-4 mt-2 text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {match.status === 'live' && match.concurrentViewers && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">
                    {match.concurrentViewers.toLocaleString()} đang xem
                  </span>
                </div>
              )}
              
              {match.viewCount > 0 && (
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{match.viewCount.toLocaleString()} lượt xem</span>
                </div>
              )}
            </div>
          </div>

          {/* Players info and actions */}
          <div className="space-y-3">

            {/* Actions */}
            <div className="flex justify-end">
              <div className="flex gap-2">
                {match.status === 'live' && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => window.open(match.stream, '_blank')}
                    className="animate-pulse"
                  >
                    <Play className="h-3 w-3" />
                    Xem Live
                  </Button>
                )}
                
                {match.status === 'upcoming' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      // Open YouTube video directly using videoId
                      if (match.videoId) {
                        const youtubeUrl = `https://www.youtube.com/watch?v=${match.videoId}`
                        window.open(youtubeUrl, '_blank')
                      } else if (match.stream) {
                        // Fallback to stream URL if available
                        window.open(match.stream, '_blank')
                      } else {
                        alert('Không có link video cho trận đấu này')
                      }
                    }}
                  >
                    <Clock className="h-3 w-3" />
                    Đặt nhắc nhở
                  </Button>
                )}
                
                {match.status === 'finished' && match.stream && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(match.stream, '_blank')}
                  >
                    <Play className="h-3 w-3" />
                    Xem lại
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  // Default layout for other games
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      className={`group relative overflow-hidden rounded-2xl backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 ${
        isDarkMode 
          ? 'bg-gray-800/95 border border-gray-600/60 hover:bg-gray-700/95' 
          : 'bg-gray-200/95 border border-gray-400/60 hover:bg-gray-100/95'
      } p-6`}
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gameInfo.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
      
      {/* Header */}
      <div className="grid grid-cols-3 items-center mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${gameInfo.color}`}>
            {gameInfo.isImage ? (
              <img src={gameInfo.icon} alt={gameInfo.label} className="h-4 w-4 object-contain" />
            ) : (
              <GameIcon className="h-4 w-4 text-white" />
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-center">
          <Badge variant={statusInfo.variant}>
            <StatusIcon className="h-3 w-3" />
            {statusInfo.label}
          </Badge>
        </div>
        
        <div className={`flex items-center gap-2 text-sm justify-end ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <Clock className="h-4 w-4" />
          {fmtTime(match.start)}
        </div>
      </div>

      {/* Teams */}
      <div className="mb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {match.home?.logo && (
              <img src={match.home.logo} alt={match.home.name} className="h-8 w-8 rounded-lg object-cover flex-shrink-0 mt-1" />
            )}
            <span className={`font-semibold break-words leading-tight ${
              isDarkMode ? 'text-gray-100' : 'text-gray-900'
            }`}>{shortenTeamName(match.home?.name) || 'TBD'}</span>
          </div>
          
          <div className="flex items-center gap-3 min-w-0">
            {(match.status === 'finished' || match.status === 'live') && (match.home?.score !== undefined || match.away?.score !== undefined) ? (
              <>
                <span className={`px-2 py-1 rounded-lg text-sm font-bold ${
                  match.status === 'live' 
                    ? 'bg-red-100 text-red-800 animate-pulse' 
                    : (match.home?.score > (match.away?.score || 0)) 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                }`}>
                  {match.home?.score || 0}
                </span>
                <span className={`text-lg font-bold ${match.status === 'live' ? 'text-red-600' : 'text-gray-600'}`}>-</span>
                <span className={`px-2 py-1 rounded-lg text-sm font-bold ${
                  match.status === 'live' 
                    ? 'bg-red-100 text-red-800 animate-pulse' 
                    : (match.away?.score > (match.home?.score || 0)) 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                }`}>
                  {match.away?.score || 0}
                </span>
              </>
            ) : (
              <span className="text-gray-400 font-medium">VS</span>
            )}
          </div>
          
          <div className="flex items-start gap-3 flex-1 justify-end min-w-0">
            <span className={`font-semibold break-words leading-tight text-right ${
              isDarkMode ? 'text-gray-100' : 'text-gray-900'
            }`}>{shortenTeamName(match.away?.name) || 'TBD'}</span>
            {match.away?.logo && (
              <img src={match.away.logo} alt={match.away.name} className="h-8 w-8 rounded-lg object-cover flex-shrink-0 mt-1" />
            )}
          </div>
        </div>

        {/* Live Match Additional Info */}
        {match.status === 'live' && (
          <div className={`mt-3 p-3 rounded-lg ${
            isDarkMode 
              ? 'bg-gray-700/80 border border-gray-600/60' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                
                {/* Valorant LIVE info */}
                {match.game === 'valorant' && match.currentMap && (
                  <span className={`font-semibold ${
                    isDarkMode ? 'text-red-300' : 'text-red-800'
                  }`}>
                    Map {match.mapNumber}: {match.currentMap}
                  </span>
                )}
                
                {/* LoL LIVE info */}
                {match.game === 'lol' && (
                  <span className={`font-semibold ${
                    isDarkMode ? 'text-red-300' : 'text-red-800'
                  }`}>
                    {match.currentGame && `${match.currentGame}`}
                    {match.liveGameState && `${match.liveGameState}`}
                  </span>
                )}
                
                {/* Football LIVE info */}
                {match.game === 'football' && (
                  <span className={`font-semibold ${
                    isDarkMode ? 'text-red-300' : 'text-red-800'
                  }`}>
                    {match.currentMinute ? `${match.currentMinute}'` : ''}
                    {match.halfTime ? match.halfTime : 'Đang thi đấu'}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                
                {/* Watch Live Button */}
                <WatchLiveButton match={match} />
              </div>
            </div>
            
            {/* Valorant Round scores */}
            {match.game === 'valorant' && (match.home?.roundsCT !== null || match.home?.roundsT !== null) && (
              <div className="mt-2 grid grid-cols-2 gap-4 text-xs">
                <div className="text-center">
                  <div className={`font-medium ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>{match.home?.name}</div>
                  <div className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                    {match.home?.roundsCT !== null && `CT: ${match.home.roundsCT}`}
                    {match.home?.roundsT !== null && ` T: ${match.home.roundsT}`}
                  </div>
                </div>
                <div className="text-center">
                  <div className={`font-medium ${
                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                  }`}>{match.away?.name}</div>
                  <div className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                    {match.away?.roundsCT !== null && `CT: ${match.away.roundsCT}`}
                    {match.away?.roundsT !== null && ` T: ${match.away.roundsT}`}
                  </div>
                </div>
              </div>
            )}
            
            {/* LoL Additional Info */}
            {match.game === 'lol' && (
              <div className="mt-2 text-xs text-center">
                <div className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                  {match.bestOf && `Best of ${match.bestOf} series`}
                </div>
              </div>
            )}
            
            {/* Football Additional Info */}
            {match.game === 'football' && (
              <div className="mt-2 text-xs text-center">
                <div className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                  {match.referee && `Trọng tài: ${match.referee}`}
                  {match.venue && match.referee && ' • '}
                  {match.venue && `Sân: ${match.venue}`}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Match Info */}
      <div className="mb-4 space-y-2">
        {match.league && (
          <div className={`flex items-center gap-2 text-sm ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            <Trophy className="h-4 w-4" />
            <span className="font-medium">{match.league}</span>
            {match.stage && <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>• {match.stage}</span>}
          </div>
        )}
        
        <div className={`flex items-center gap-4 text-sm ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
        </div>
      </div>

    </motion.div>
  )
}

// --- Main App Component ---------------------------------------------------
export default function App() {
  // State management
  const [activeSport, setActiveSport] = useState('all')
  const [collapsedSections, setCollapsedSections] = useState({}) // Track collapsed sections
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : false
  })

  // Mobile detection
  const isMobile = useIsMobile()

  // Toggle section collapse state
  const toggleSectionCollapse = (sectionKey) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }))
  }

  // Refs for section navigation
  const liveRef = useRef(null)
  const upcomingRef = useRef(null)
  const finishedRef = useRef(null)

  // Function to scroll to specific section
  const scrollToSection = (sectionType) => {
    const refs = {
      live: liveRef,
      upcoming: upcomingRef,
      finished: finishedRef
    }
    
    const targetRef = refs[sectionType]
    if (targetRef?.current) {
      // Calculate offset to account for sticky header
      const headerHeight = isMobile ? 64 : 120 // Smaller header on mobile
      const elementPosition = targetRef.current.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  // Save dark mode preference to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode))
  }, [isDarkMode])

  
  // Time range with different filters for different game types
  const dateFrom = useMemo(() => {
    const now = new Date()
    // For PUBG and TFT: show events from current time (no past events)
    if (activeSport === 'pubg' || activeSport === 'tft') {
      return new Date(now.getTime() - 1 * 60 * 60 * 1000) // 1 hour ago to catch recently started events
    }
    // For "all" mode and other sports: 24 hours ago to include recent matches
    return new Date(now.getTime() - 24 * 60 * 60 * 1000) // 24 hours ago
  }, [activeSport])
  
  const dateTo = useMemo(() => {
    const now = new Date()
    // For PUBG and TFT only: show all upcoming events (30 days)
    if (activeSport === 'pubg' || activeSport === 'tft') {
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    }
    // For "all" mode: 24 hours to include Football/Valorant/LoL upcoming matches
    if (activeSport === 'all') {
      return new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 hours from now
    }
    // For other individual sports: 24 hours from now
    return new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 hours from now
  }, [activeSport])

  // Fetch data
  const { data, loading, error, refetch } = useSchedule({ 
    activeSport, 
    from: dateFrom, 
    to: dateTo 
  })

  // No additional filtering needed - just use the data as is
  const filteredData = data

  // Group by status: Live, Upcoming, Finished
  const groupedData = useMemo(() => {
    const groups = {
      live: [],
      upcoming: [],
      finished: []
    }
    
    filteredData.forEach(match => {
      if (match.status === 'live') {
        groups.live.push(match)
      } else if (match.status === 'upcoming') {
        groups.upcoming.push(match)
      } else if (match.status === 'finished') {
        groups.finished.push(match)
      }
    })
    
    // Sort matches within each group by start time
    groups.live.sort((a, b) => new Date(a.start) - new Date(b.start))
    groups.upcoming.sort((a, b) => new Date(a.start) - new Date(b.start))
    groups.finished.sort((a, b) => new Date(b.start) - new Date(a.start)) // Finished: newest first
    
    // Create result array with non-empty groups in priority order
    const result = []
    
    if (groups.live.length > 0) {
      result.push(['live', groups.live])
    }
    
    if (groups.upcoming.length > 0) {
      result.push(['upcoming', groups.upcoming])
    }
    
    if (groups.finished.length > 0) {
      result.push(['finished', groups.finished])
    }
    
    return result
  }, [filteredData])

  // Use mobile layout for mobile devices
  if (isMobile) {
    return (
      <MobileLayout
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        activeSport={activeSport}
        setActiveSport={setActiveSport}
        groupedData={groupedData}
        loading={loading}
        error={error}
        refetch={refetch}
        collapsedSections={collapsedSections}
        toggleSectionCollapse={toggleSectionCollapse}
        scrollToSection={scrollToSection}
        liveRef={liveRef}
        upcomingRef={upcomingRef}
        finishedRef={finishedRef}
      />
    )
  }

  // Desktop layout (existing code)
  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-lg border-b transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gray-800/80 border-gray-700/50' 
          : 'bg-white/80 border-gray-200/50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                🏆 Lịch Thi Đấu Esports
              </h1>
              <p className={`mt-1 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Theo dõi lịch thi đấu Valorant, PUBG, Liên Minh Huyền Thoại và Bóng đá
              </p>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap justify-end">
              {/* Quick Navigation Buttons - Only show when data is available */}
              {!loading && !error && groupedData.length > 0 && (
                <>
                  {groupedData.map(([status, matches]) => {
                    const sectionConfig = {
                      live: {
                        label: 'LIVE',
                        icon: Play,
                        bgColor: isDarkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600',
                        textColor: 'text-white',
                        badgeBg: isDarkMode ? 'bg-red-800' : 'bg-red-400',
                        badgeText: 'text-white',
                        animate: 'animate-pulse'
                      },
                      upcoming: {
                        label: 'Sắp tới',
                        icon: Clock,
                        bgColor: isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600',
                        textColor: 'text-white',
                        badgeBg: isDarkMode ? 'bg-blue-800' : 'bg-blue-400',
                        badgeText: 'text-white',
                        animate: ''
                      },
                      finished: {
                        label: 'Diễn ra rồi',
                        icon: Trophy,
                        bgColor: isDarkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600',
                        textColor: 'text-white',
                        badgeBg: isDarkMode ? 'bg-green-800' : 'bg-green-400',
                        badgeText: 'text-white',
                        animate: ''
                      }
                    }
                    
                    const config = sectionConfig[status]
                    if (!config) return null
                    
                    const SectionIcon = config.icon
                    
                    return (
                      <button
                        key={status}
                        onClick={() => scrollToSection(status)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:shadow-md ${
                          config.bgColor
                        } ${config.textColor} ${config.animate}`}
                        title={`Nhảy đến ${config.label}`}
                      >
                        <SectionIcon className="h-4 w-4" />
                        <span className="hidden sm:inline text-sm">{config.label}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                          config.badgeBg
                        } ${config.badgeText}`}>
                          {matches.length}
                        </span>
                      </button>
                    )
                  })}
                  
                  {/* Separator */}
                  <div className={`w-px h-6 ${
                    isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                  }`} />
                </>
              )}
              
              <Button
                variant="ghost"
                isDarkMode={isDarkMode}
                onClick={() => setIsDarkMode(!isDarkMode)}
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                {isDarkMode ? 'Sáng' : 'Tối'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Sport Categories */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {sports.map((sport) => {
              const SportIcon = sport.icon
              return (
                <Button
                  key={sport.id}
                  variant={activeSport === sport.id ? 'primary' : 'default'}
                  isDarkMode={isDarkMode}
                  onClick={() => setActiveSport(sport.id)}
                  className={activeSport === sport.id ? '' : isDarkMode 
                    ? 'hover:bg-gradient-to-r hover:from-gray-600 hover:to-gray-700' 
                    : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100'}
                >
                  {sport.isImage ? (
                    <img src={sport.icon} alt={sport.label} className="h-5 w-5 object-contain" />
                  ) : (
                    <SportIcon className="h-5 w-5" />
                  )}
                  {sport.label}
                </Button>
              )
            })}
          </div>
        </div>



        {/* Content */}
        <div className="space-y-8">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Đang tải dữ liệu...</p>
              </div>
            </div>
          )}

          {error && (
            <div className={`rounded-2xl border p-6 text-center ${
              isDarkMode 
                ? 'border-red-600/60 bg-red-900/30' 
                : 'border-red-200 bg-red-50'
            }`}>
              <p className={isDarkMode ? 'text-red-300' : 'text-red-600'}>{error}</p>
              <Button variant="outline" isDarkMode={isDarkMode} onClick={refetch} className="mt-4">
                Thử lại
              </Button>
            </div>
          )}

          {!loading && !error && groupedData.length === 0 && (
            <div className={`rounded-2xl border p-12 text-center ${
              isDarkMode 
                ? 'border-gray-600 bg-gray-800/50' 
                : 'border-gray-200 bg-gray-50'
            }`}>
              <Gamepad2 className={`h-16 w-16 mx-auto mb-4 ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <h3 className={`text-xl font-semibold mb-2 ${
                isDarkMode ? 'text-gray-100' : 'text-gray-900'
              }`}>Không có trận đấu</h3>
              <p className={`mb-4 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>Không tìm thấy trận đấu nào trong khoảng thời gian này.</p>
              <Button variant="primary" isDarkMode={isDarkMode} onClick={refetch}>
                <RefreshCw className="h-4 w-4" />
                Làm mới dữ liệu
              </Button>
            </div>
          )}

          {/* Match Groups by Status */}
          {groupedData.map(([status, matches]) => {
            // Define status-specific styling and labels
            const statusConfig = {
              live: {
                title: '🔴 Đang LIVE',
                gradient: 'from-red-500 to-red-600',
                bgColor: 'bg-red-50',
                borderColor: 'border-red-200',
                textColor: 'text-red-800',
                icon: '🔴',
                description: 'Các trận đấu đang diễn ra'
              },
              upcoming: {
                title: '📅 Sắp tới',
                gradient: 'from-blue-500 to-blue-600',
                bgColor: 'bg-blue-50',
                borderColor: 'border-blue-200',
                textColor: 'text-blue-800',
                icon: '🕒',
                description: 'Các trận đấu sắp diễn ra'
              },
              finished: {
                title: '🏆 Diễn ra rồi',
                gradient: 'from-green-500 to-green-600',
                bgColor: 'bg-green-50',
                borderColor: 'border-green-200',
                textColor: 'text-green-800',
                icon: '✅',
                description: 'Các trận đấu đã kết thúc'
              }
            }
            
            const config = statusConfig[status]
            const isCollapsed = collapsedSections[status]
            
            // Get appropriate ref for this section
            const getSectionRef = (status) => {
              switch(status) {
                case 'live': return liveRef
                case 'upcoming': return upcomingRef
                case 'finished': return finishedRef
                default: return null
              }
            }
            
            return (
              <motion.section
                key={status}
                ref={getSectionRef(status)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-600/60' : `${config.bgColor} ${config.borderColor}`} border rounded-2xl p-4`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`bg-gradient-to-r ${config.gradient} text-white rounded-xl px-4 py-2 ${status === 'live' ? 'animate-pulse' : ''}`}>
                        <h2 className="text-lg font-bold">
                          {config.title}
                        </h2>
                      </div>
                      <span className={`text-sm font-medium ${
                        isDarkMode ? 'text-gray-300' : config.textColor
                      }`}>
                        {config.description}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold px-3 py-1 rounded-full border ${
                        isDarkMode 
                          ? 'bg-gray-700/80 border-gray-500/60 text-gray-200' 
                          : `${config.textColor} ${config.bgColor} ${config.borderColor}`
                      }`}>
                        {matches.length} trận đấu
                      </span>
                      
                      {/* Collapse/Expand Button */}
                      <button
                        onClick={() => toggleSectionCollapse(status)}
                        className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                          isDarkMode 
                            ? 'bg-gray-700/60 hover:bg-gray-600/80 text-gray-300 border border-gray-600/60' 
                            : `${config.bgColor} hover:bg-opacity-80 ${config.textColor} ${config.borderColor} border`
                        }`}
                        title={isCollapsed ? 'Mở rộng' : 'Thu nhỏ'}
                      >
                        {isCollapsed ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronUp className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Content with collapse animation */}
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                          <AnimatePresence>
                            {matches.map((match) => (
                              <MatchCard
                                key={match.id}
                                match={match}
                                isDarkMode={isDarkMode}
                              />
                            ))}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.section>
            )
          })}
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500">
              <p>© 2025 Esports Calendar. Dữ liệu từ các API chính thức.</p>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Nguồn dữ liệu:</span>
              <Badge variant="valorant">VLR.gg</Badge>
              <Badge variant="lol">LoL Esports</Badge>
              <Badge variant="football">Football-data.org</Badge>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
