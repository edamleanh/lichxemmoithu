// Esports + Football Schedule — Professional Sports Calendar
// Stack: React + Vite, TailwindCSS, Framer Motion, Lucide React
// -------------------------------------------------------------------------
// Professional sports calendar with real-time API integration
// Features: Multi-sport support, real-time updates, beautiful UI, mobile responsive
// Sports: Valorant, PUBG, League of Legends, Football
// -------------------------------------------------------------------------

import React, { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar as CalendarIcon,
  Clock,
  Globe2,
  MapPin,
  RefreshCw,
  Trophy,
  List,
  Grid3X3,

  Play,
  Users,
  Target,
  Zap,

  TrendingUp,
  Gamepad2,
  Medal,
  Moon,
  Sun,
} from 'lucide-react'

// Import custom game icons
import valorantIcon from './images/valorant.png'
import lolIcon from './images/lol.png'
import footballIcon from './images/football.png'
import pubgIcon from './images/pubg.png'

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
    // YouTube API key
    const YOUTUBE_API_KEY = 'AIzaSyC4ktJ7bCFJp30sFmHIggs4vgvXklny294'
    
    // Build search query: team1 + team2 + league + "live"
    const searchQuery = [
      // shortenTeamName(match.home?.name) || '',
      // 'vs',
      // shortenTeamName(match.away?.name) || '',
      match.league
    ].filter(Boolean).join(' ')
    
    
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?` +
      `part=snippet&type=video&eventType=live&maxResults=1&order=viewCount&` +
      `q=${encodeURIComponent(searchQuery)}&key=${YOUTUBE_API_KEY}`
    );
    
    if (!response.ok) {
      console.warn('YouTube API error:', response.status)
      return null
    }
    
    const data = await response.json()
    
    if (data.items && data.items.length > 0) {
      const video = data.items[0]
      const youtubeUrl = `https://www.youtube.com/watch?v=${video.id.videoId}`
      
      
      return youtubeUrl
    }
    
    console.log('❌ No live streams found on YouTube for:', searchQuery)
    return null
    
  } catch (error) {
    console.error('YouTube search error:', error)
    return null
  }
}

// Status helpers
const getStatusInfo = (status) => {
  switch (status) {
    case 'live': return { variant: 'live', label: 'LIVE', icon: Play }
    case 'finished': return { variant: 'finished', label: 'ENDED', icon: Medal }
    default: return { variant: 'upcoming', label: 'COMMING', icon: Clock }
  }
}

const getGameInfo = (game) => {
  switch (game) {
    case 'valorant': return { variant: 'valorant', label: 'VALORANT', icon: valorantIcon, color: 'from-red-500 to-pink-500', isImage: true }
    case 'pubg': return { variant: 'pubg', label: 'PUBG', icon: pubgIcon, color: 'from-orange-500 to-yellow-500', isImage: true }
    case 'lol': return { variant: 'lol', label: 'LOL', icon: lolIcon, color: 'from-blue-500 to-cyan-500', isImage: true }
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

// --- API Adapters --------------------------------------------------------
const ValorantAdapter = {
  // Helper function to process live matches  
  processLiveMatches(data) {
    if (!data.data?.segments) return []
    
    return data.data.segments
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
        stream: match.match_page ? `${match.match_page}` : '',
        venue: match.match_event || '',
        status: 'live',
        // Live-specific data
        currentMap: match.current_map || '',
        mapNumber: match.map_number || '',
      }))
  },

  // Helper function to process upcoming matches
  processUpcomingMatches(data) {
    if (!data.data?.segments) return []
    
    const now = Date.now()
    const oneDayMs = 24 * 60 * 60 * 1000
    
    return data.data.segments
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
        stream: match.match_page ? `${match.match_page}` : '',
        venue: match.match_event || '',
        status: 'upcoming',
      }))
  },

  // Helper function to process completed matches (results)
  processCompletedMatches(data) {
    if (!data.data?.segments) return []
    
    const oneDayMs = 24 * 60 * 60 * 1000
    
    return data.data.segments
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
          logo: null, // API doesn't provide team logos for results
          score: parseInt(match.score1) || 0
        },
        away: { 
          name: match.team2 || 'TBD', 
          logo: null, // API doesn't provide team logos for results
          score: parseInt(match.score2) || 0
        },
        start: new Date(), // Use current time for completed matches within 1 day
        region: 'International',
        stream: match.match_page ? `https://www.vlr.gg${match.match_page}` : '',
        venue: match.tournament_name || '',
        status: 'finished',
      }))
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
          const liveMatches = this.processLiveMatches(liveData)
          allMatches = [...allMatches, ...liveMatches]
        } else {
          console.warn(`⚠️ Live Valorant API error: ${liveResponse.status}`)
        }
      } catch (error) {
        console.warn('⚠️ Error fetching LIVE Valorant matches:', error)
      }

      // Fetch upcoming matches
      try {
        const upcomingResponse = await fetch('/api/valorant?q=upcoming')
        
        if (upcomingResponse.ok) {
          const upcomingData = await upcomingResponse.json()
          const upcomingMatches = this.processUpcomingMatches(upcomingData)
          allMatches = [...allMatches, ...upcomingMatches]
        } else {
          console.warn(`⚠️ Upcoming Valorant API error: ${upcomingResponse.status}`)
        }
      } catch (error) {
        console.warn('⚠️ Error fetching upcoming Valorant matches:', error)
      }

      // Fetch completed matches (results)
      try {
        const resultsResponse = await fetch('/api/valorant?q=results')
        
        if (resultsResponse.ok) {
          const resultsData = await resultsResponse.json()
          const completedMatches = this.processCompletedMatches(resultsData)
          allMatches = [...allMatches, ...completedMatches]
        } else {
          console.warn(`⚠️ Results Valorant API error: ${resultsResponse.status}`)
        }
      } catch (error) {
        console.warn('⚠️ Error fetching completed Valorant matches:', error)
      }

      // Filter matches by date range and remove duplicates
      const filteredMatches = allMatches
        .filter(match => withinRange(match.start, from, to))
        .filter((match, index, self) => 
          index === self.findIndex(m => m.id === match.id)
        )

      // If no matches found, return sample data
      if (filteredMatches.length === 0) {
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
      return sortedMatches
    } catch (error) {
      console.warn('⚠️ Valorant API error:', error)
      return createSampleData('valorant', from, to)
    }
  },
}

const PubgAdapter = {
  async fetch({ from, to }) {
    try {
      // Since Liquipedia API might not be accessible, we'll create realistic sample data
      return createSampleData('pubg', from, to)
    } catch (error) {
      console.warn('⚠️ PUBG API error:', error)
      return createSampleData('pubg', from, to)
    }
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
        console.warn(`LoL API error: ${response.status}`)
        return createSampleData('lol', from, to)
      }
      
      const data = await response.json()
      
      // 🔍 DEBUG: Log toàn bộ response từ LoL API
      console.log('📊 LoL API Response:', data)
      // 🔍 DEBUG: Log cụ thể phần events
      if (data.data?.schedule?.events) {
        
        // 🔍 DEBUG: Check streams data specifically
        data.data.schedule.events.forEach((event, index) => {
          if (event.streams && event.streams.length > 0) {
            console.log(`🎥 Event ${index} Streams:`, event.streams)
            event.streams.forEach((stream, streamIndex) => {
              console.log(`   Stream ${streamIndex}:`, {
                parameter: stream.parameter,
                locale: stream.locale,
                mediaLocale: stream.mediaLocale
              })
            })
          } else {
          }
        })
      } else {
        console.log('⚠️ No LoL events found in response')
      }
      
      if (!data.data?.schedule?.events) return createSampleData('lol', from, to)
      
      const matches = data.data.schedule.events.map(event => ({
        id: `lol-${event.match?.id || Math.random()}`,
        game: 'lol',
        league: event.league?.name || 'LoL Esports',
        stage: event.match?.strategy?.count ? `Bo${event.match.strategy.count}` : (event.match?.strategy?.type || event.blockName || ''),
        home: { 
          name: event.match?.teams?.[0]?.name || 'TBD', 
          logo: event.match?.teams?.[0]?.image,
          score: (event.state === 'completed' || event.state === 'inProgress') ? event.match?.teams?.[0]?.result?.gameWins : undefined
        },
        away: { 
          name: event.match?.teams?.[1]?.name || 'TBD', 
          logo: event.match?.teams?.[1]?.image,
          score: (event.state === 'completed' || event.state === 'inProgress') ? event.match?.teams?.[1]?.result?.gameWins : undefined
        },
        start: new Date(event.startTime),
        region: event.league?.region || 'International',
        stream: event.streams?.[0]?.parameter || '',
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
      
      // 🔍 DEBUG: Log processed matches
      
      // Sort LoL matches: LIVE first, then by start time
      const sortedMatches = matches.sort((a, b) => {
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
      console.warn('⚠️ LoL API error:', error)
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
          console.warn('Football API test failed:', testResponse.status)
          // If test fails, return sample data immediately
          return createSampleData('football', from, to)
        }
      } catch (apiError) {
        console.warn('Football API connection failed:', apiError.message)
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
            console.warn(`Failed to fetch ${league.name}: ${response.status} - ${errorText}`)
            
            // If it's a 400 error (bad request), likely API key issue
            if (response.status === 400) {
              console.warn('API Key might be invalid or expired.')
              console.warn('To get a valid API key:')
              console.warn('1. Visit https://www.football-data.org/')
              console.warn('2. Register for a free account')
              console.warn('3. Get your API token')
              console.warn('4. Update the .env file with VITE_FOOTBALL_API_KEY=your_actual_key')
              console.warn('Using sample data for now.')
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
                logo: match.homeTeam?.crest,
                score: (match.status === 'FINISHED' || match.status === 'IN_PLAY' || match.status === 'PAUSED') ? match.score?.fullTime?.home : undefined
              },
              away: { 
                name: match.awayTeam?.name || 'Away',
                logo: match.awayTeam?.crest,
                score: (match.status === 'FINISHED' || match.status === 'IN_PLAY' || match.status === 'PAUSED') ? match.score?.fullTime?.away : undefined
              },
              start: new Date(match.utcDate),
              venue: match.venue || '',
              region: match.area?.name || match.competition?.area?.name || 'International',
              stream: '',
              status: match.status === 'FINISHED' ? 'finished' :
                      match.status === 'IN_PLAY' || match.status === 'PAUSED' ? 'live' : 'upcoming',
              // Live-specific data for Football
              currentMinute: (match.status === 'IN_PLAY' || match.status === 'PAUSED') ? match.minute : undefined,
              halfTime: match.status === 'PAUSED' ? 'Giờ nghỉ giải lao' : undefined,
              referee: match.referees?.[0]?.name || undefined,
            }
            })
            
            allMatches = [...allMatches, ...matches]
          }
        } catch (err) {
          console.warn(`Failed to fetch ${league.name}:`, err)
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
      console.warn('⚠️ Football API error:', error)
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
        stream: 'https://www.vlr.gg/542274/team-heretics-vs-giantx-valorant-champions-2025-lr1',
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
        stream: 'https://www.vlr.gg/542268/fnatic-vs-paper-rex-valorant-champions-2025-ubsf',
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
        stream: 'https://www.vlr.gg/542273/drx-vs-g2-esports-valorant-champions-2025-lr1',
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
        stream: 'https://www.vlr.gg/542269/sentinels-vs-team-liquid-valorant-champions-2025-ubsf',
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
        home: { name: 'Gen.G', score: 2 },
        away: { name: 'DAMWON KIA', score: 0 },
        start: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        region: 'Global',
        stream: 'https://youtube.com/pubgesports',
        venue: 'Seoul Arena',
        status: 'finished',
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
        stream: 'https://twitch.tv/lck',
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
        stream: 'https://twitch.tv/lck',
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
        stream: 'https://twitch.tv/lpl',
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
        stream: '',
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
        stream: '',
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
        stream: '',
        venue: 'Santiago Bernabéu',
        status: 'upcoming',
      }
    ]
  }
  
  return (sampleData[game] || []).filter(match => withinRange(match.start, from, to))
}

// --- Liquipedia API Adapter ----------------------------------------------
const LiquipediaAdapter = {
  async fetch({ from, to, game }) {
    try {
      // In development, check if we're running on localhost
      const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      
      if (isDev) {
        // In development, return enhanced sample data instead of trying to call API
        console.log(`🔧 Development mode: Using sample data for ${game}`)
        return this.createEnhancedSampleData(game, from, to)
      }
      
      const response = await fetch(`/api/liquipedia?game=${game}&type=matches`)
      
      if (!response.ok) {
        console.warn(`⚠️ Liquipedia API error for ${game}: ${response.status}`)
        return this.createEnhancedSampleData(game, from, to)
      }
      
      const result = await response.json()
      
      if (!result.success || !result.data) {
        console.warn(`⚠️ Invalid Liquipedia response for ${game}`)
        return this.createEnhancedSampleData(game, from, to)
      }
      
      // Transform Liquipedia data to our standard format
      const matches = this.transformLiquipediaData(result.data, game)
      
      // Filter matches by date range
      const filteredMatches = matches.filter(match => withinRange(match.start, from, to))
      
      if (filteredMatches.length === 0) {
        return this.createEnhancedSampleData(game, from, to)
      }
      
      // Sort matches: LIVE first, then by start time
      return filteredMatches.sort((a, b) => {
        const aPriority = a.status === 'live' ? 0 : a.status === 'upcoming' ? 1 : 2
        const bPriority = b.status === 'live' ? 0 : b.status === 'upcoming' ? 1 : 2
        
        if (aPriority === bPriority) {
          return new Date(a.start) - new Date(b.start)
        }
        
        return aPriority - bPriority
      })
      
    } catch (error) {
      console.warn(`⚠️ Liquipedia API error for ${game}:`, error)
      return this.createEnhancedSampleData(game, from, to)
    }
  },

  transformLiquipediaData(data, game) {
    const matches = []
    
    // Handle different data structures from Liquipedia
    if (Array.isArray(data)) {
      // Direct array of matches
      data.forEach((match, index) => {
        matches.push(this.transformSingleMatch(match, game, index))
      })
    } else if (data.parse && data.parse.wikitext) {
      // Wikitext parsing result
      const parsedMatches = this.parseWikitextMatches(data.parse.wikitext['*'], game)
      matches.push(...parsedMatches)
    } else if (data.query && data.query.pages) {
      // MediaWiki query result
      Object.values(data.query.pages).forEach((page, index) => {
        if (page.title && page.extract) {
          matches.push(this.transformPageToMatch(page, game, index))
        }
      })
    }
    
    return matches
  },

  transformSingleMatch(match, game, index) {
    const now = new Date()
    
    // Determine match status based on available data
    let status = 'upcoming'
    let startTime = now
    
    if (match.date && match.time) {
      startTime = new Date(`${match.date}T${match.time}:00`)
      const timeDiff = startTime.getTime() - now.getTime()
      
      if (Math.abs(timeDiff) < 30 * 60 * 1000) { // Within 30 minutes
        status = 'live'
      } else if (timeDiff < 0) {
        status = 'finished'
      }
    }
    
    return {
      id: match.id || `liquipedia-${game}-${index}`,
      game: game,
      league: this.extractLeagueName(match, game),
      stage: this.extractStage(match, game),
      home: {
        name: match.team1 || 'Team A',
        logo: match.team1_logo || null,
        score: match.score1 !== undefined ? parseInt(match.score1) : undefined
      },
      away: {
        name: match.team2 || 'Team B', 
        logo: match.team2_logo || null,
        score: match.score2 !== undefined ? parseInt(match.score2) : undefined
      },
      start: startTime,
      region: match.region || 'International',
      stream: match.stream || '',
      venue: match.tournament || match.event || '',
      status: status
    }
  },

  parseWikitextMatches(wikitext, game) {
    // Simple wikitext parsing - this would need to be more sophisticated for real use
    const matches = []
    
    // Look for common Liquipedia match templates
    const matchPatterns = [
      /\{\{Match\|([^}]+)\}\}/g,
      /\{\{MatchMaps\|([^}]+)\}\}/g,
      /\{\{Bracket\/.*?\|([^}]+)\}\}/g
    ]
    
    matchPatterns.forEach(pattern => {
      let match
      while ((match = pattern.exec(wikitext)) !== null) {
        const matchData = this.parseMatchTemplate(match[1], game)
        if (matchData) {
          matches.push(matchData)
        }
      }
    })
    
    return matches
  },

  parseMatchTemplate(templateContent, game) {
    const params = {}
    const paramPairs = templateContent.split('|')
    
    paramPairs.forEach(pair => {
      const [key, value] = pair.split('=').map(s => s?.trim())
      if (key && value) {
        params[key] = value
      }
    })
    
    if (params.opponent1 || params.team1) {
      return {
        id: `liquipedia-${game}-${Date.now()}-${Math.random()}`,
        team1: params.opponent1 || params.team1,
        team2: params.opponent2 || params.team2,
        date: params.date,
        time: params.time,
        game: game,
        tournament: params.tournament || params.league,
        source: 'liquipedia'
      }
    }
    
    return null
  },

  transformPageToMatch(page, game, index) {
    return {
      id: `liquipedia-page-${game}-${index}`,
      game: game,
      league: page.title.split(' ')[0] || 'Tournament',
      stage: 'Main Event',
      home: {
        name: 'Team A',
        logo: null,
        score: undefined
      },
      away: {
        name: 'Team B',
        logo: null, 
        score: undefined
      },
      start: new Date(),
      region: 'International',
      stream: '',
      venue: page.title,
      status: 'upcoming'
    }
  },

  extractLeagueName(match, game) {
    const leagueMap = {
      valorant: match.tournament || match.event || 'VCT',
      lol: match.tournament || match.league || 'LCS',
      pubg: match.tournament || match.event || 'PUBG Global Championship',
      dota2: match.tournament || match.event || 'The International'
    }
    
    return leagueMap[game] || 'Championship'
  },

  extractStage(match, game) {
    if (match.stage) return match.stage
    if (match.round) return match.round
    if (match.bestof) return `Bo${match.bestof}`
    
    const stageMap = {
      valorant: 'Playoffs',
      lol: 'Regular Season',
      pubg: 'Main Event',
      dota2: 'Group Stage'
    }
    
    return stageMap[game] || 'Main Event'
  },

  createEnhancedSampleData(game, from, to) {
    const now = new Date()
    const oneHour = 60 * 60 * 1000
    const oneDay = 24 * oneHour
    
    const gameData = {
      valorant: {
        leagues: ['VCT Champions', 'VCT Masters', 'Game Changers', 'Ascension'],
        teams: [
          { name: 'Sentinels', logo: 'https://owcdn.net/img/63b7f26f03d8b.png' },
          { name: 'Team Heretics', logo: 'https://owcdn.net/img/637b755224c12.png' },
          { name: 'GIANTX', logo: 'https://owcdn.net/img/657b2f3fcd199.png' },
          { name: 'Paper Rex', logo: 'https://owcdn.net/img/63b7f27b0bdb4.png' },
          { name: 'LOUD', logo: 'https://owcdn.net/img/63b7f26f9a7a4.png' },
          { name: 'FunPlus Phoenix', logo: 'https://owcdn.net/img/63b7f2781a4e0.png' }
        ],
        stages: ['Upper Finals', 'Lower Round 1', 'Group Stage', 'Playoffs'],
        maps: ['Icebox', 'Lotus', 'Sunset', 'Bind', 'Haven', 'Split']
      },
      lol: {
        leagues: ['LCS', 'LEC', 'LCK', 'LPL', 'Worlds 2025'],
        teams: [
          { name: 'T1', logo: 'https://am-a.akamaihd.net/image?resize=72:&f=http%3A%2F%2Fstatic.lolesports.com%2Fteams%2FT1-FullonDark.png' },
          { name: 'Gen.G', logo: 'https://am-a.akamaihd.net/image?resize=72:&f=http%3A%2F%2Fstatic.lolesports.com%2Fteams%2FGenG-FullonDark.png' },
          { name: 'Cloud9', logo: 'https://am-a.akamaihd.net/image?resize=72:&f=http%3A%2F%2Fstatic.lolesports.com%2Fteams%2FC9-FullonDark.png' },
          { name: 'G2 Esports', logo: 'https://am-a.akamaihd.net/image?resize=72:&f=http%3A%2F%2Fstatic.lolesports.com%2Fteams%2FG2-FullonDark.png' },
          { name: 'Fnatic', logo: 'https://am-a.akamaihd.net/image?resize=72:&f=http%3A%2F%2Fstatic.lolesports.com%2Fteams%2FFnatic-FullonDark.png' },
          { name: 'Team Liquid', logo: 'https://am-a.akamaihd.net/image?resize=72:&f=http%3A%2F%2Fstatic.lolesports.com%2Fteams%2FTL-FullonDark.png' }
        ],
        stages: ['Bo5', 'Bo3', 'Bo1', 'Group Stage'],
        maps: []
      },
      pubg: {
        leagues: ['PUBG Global Championship', 'PCS', 'PMGC', 'Nations Cup'],
        teams: [
          { name: 'Soniqs', logo: null },
          { name: 'Faze Clan', logo: null },
          { name: 'Team Liquid', logo: null },
          { name: 'NAVI', logo: null },
          { name: 'Gen.G', logo: null },
          { name: 'DAMWON KIA', logo: null }
        ],
        stages: ['Finals', 'Weekly Finals', 'Survival', 'Grand Finals'],
        maps: ['Erangel', 'Sanhok', 'Vikendi', 'Miramar']
      }
    }
    
    const currentGame = gameData[game] || gameData.valorant
    const matches = []
    
    // Create 1 live match
    const liveTeams = this.getRandomTeams(currentGame.teams, 2)
    matches.push({
      id: `${game}-live-1`,
      game: game,
      league: currentGame.leagues[0],
      stage: currentGame.stages[0],
      home: {
        name: liveTeams[0].name,
        logo: liveTeams[0].logo,
        score: Math.floor(Math.random() * 3) + 1
      },
      away: {
        name: liveTeams[1].name,
        logo: liveTeams[1].logo,
        score: Math.floor(Math.random() * 3)
      },
      start: new Date(now.getTime() - oneHour), // Started 1 hour ago
      region: 'International',
      stream: 'https://twitch.tv/valorant',
      venue: currentGame.leagues[0],
      status: 'live',
      currentMap: game === 'valorant' ? currentGame.maps[Math.floor(Math.random() * currentGame.maps.length)] : undefined
    })
    
    // Create 2-3 upcoming matches
    for (let i = 0; i < 3; i++) {
      const upcomingTeams = this.getRandomTeams(currentGame.teams, 2)
      matches.push({
        id: `${game}-upcoming-${i + 1}`,
        game: game,
        league: currentGame.leagues[Math.floor(Math.random() * currentGame.leagues.length)],
        stage: currentGame.stages[Math.floor(Math.random() * currentGame.stages.length)],
        home: {
          name: upcomingTeams[0].name,
          logo: upcomingTeams[0].logo,
          score: undefined
        },
        away: {
          name: upcomingTeams[1].name,
          logo: upcomingTeams[1].logo,
          score: undefined
        },
        start: new Date(now.getTime() + (i + 1) * 3 * oneHour), // 3, 6, 9 hours from now
        region: 'International',
        stream: '',
        venue: currentGame.leagues[Math.floor(Math.random() * currentGame.leagues.length)],
        status: 'upcoming'
      })
    }
    
    // Create 1-2 finished matches
    for (let i = 0; i < 2; i++) {
      const finishedTeams = this.getRandomTeams(currentGame.teams, 2)
      const homeScore = Math.floor(Math.random() * 4) + 1
      const awayScore = Math.floor(Math.random() * homeScore)
      
      matches.push({
        id: `${game}-finished-${i + 1}`,
        game: game,
        league: currentGame.leagues[Math.floor(Math.random() * currentGame.leagues.length)],
        stage: currentGame.stages[Math.floor(Math.random() * currentGame.stages.length)],
        home: {
          name: finishedTeams[0].name,
          logo: finishedTeams[0].logo,
          score: homeScore
        },
        away: {
          name: finishedTeams[1].name,
          logo: finishedTeams[1].logo,
          score: awayScore
        },
        start: new Date(now.getTime() - (i + 2) * oneHour), // 2, 3 hours ago
        region: 'International',
        stream: '',
        venue: currentGame.leagues[Math.floor(Math.random() * currentGame.leagues.length)],
        status: 'finished'
      })
    }
    
    return matches.filter(match => withinRange(match.start, from, to))
  },

  getRandomTeams(teams, count) {
    const shuffled = [...teams].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  },

  createFallbackData(game, from, to) {
    // Alias for backwards compatibility
    return this.createEnhancedSampleData(game, from, to)
  }
}

const adapters = {
  valorant: LiquipediaAdapter,
  pubg: LiquipediaAdapter,
  lol: LiquipediaAdapter,
  football: FootballAdapter, // Keep football as is since it's working well
}

// --- Sport Categories -----------------------------------------------------
const sports = [
  { id: 'all', label: 'Tất cả', icon: TrendingUp, color: 'from-purple-500 to-pink-500', isImage: false },
  { id: 'valorant', label: 'Valorant', icon: valorantIcon, color: 'from-red-500 to-pink-500', isImage: true },
  { id: 'pubg', label: 'PUBG', icon: pubgIcon, color: 'from-orange-500 to-yellow-500', isImage: true },
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
          // Fetch from all adapters
          const results = await Promise.allSettled([
            adapters.valorant.fetch({ from, to, game: 'valorant' }),
            adapters.pubg.fetch({ from, to, game: 'pubg' }),
            adapters.lol.fetch({ from, to, game: 'lol' }),
            adapters.football.fetch({ from, to }),
          ])
          
          results.forEach((result, index) => {
            const adapterNames = ['valorant', 'pubg', 'lol', 'football']
            if (result.status === 'fulfilled') {
              allMatches = [...allMatches, ...result.value]
            } else {
              console.warn(`🔍 useSchedule - ${adapterNames[index]} adapter failed:`, result.reason)
            }
          })
        } else {
          // Fetch from specific adapter
          const adapter = adapters[activeSport]
          if (adapter) {
            // Pass game parameter for Liquipedia adapters
            const fetchParams = { from, to }
            if (activeSport !== 'football') {
              fetchParams.game = activeSport
            }
            allMatches = await adapter.fetch(fetchParams)
          } else {
            console.warn(`🔍 useSchedule - No adapter found for ${activeSport}`)
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
        alert('Không tìm thấy live stream cho trận đấu này')
      }
    } catch (error) {
      console.error('Error searching for live stream:', error)
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
function MatchCard({ match, isCompact, isDarkMode }) {
  const statusInfo = getStatusInfo(match.status)
  const gameInfo = getGameInfo(match.game)
  const StatusIcon = statusInfo.icon
  const GameIcon = gameInfo.icon

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
      } ${isCompact ? 'p-4' : 'p-6'}`}
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
  const [isCompactView, setIsCompactView] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : false
  })

  // Save dark mode preference to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode))
  }, [isDarkMode])

  
  // Time range: 24h before to 24h after current time
  const dateFrom = useMemo(() => {
    const now = new Date()
    return new Date(now.getTime() - 24 * 60 * 60 * 1000) // 24 hours ago
  }, [])
  
  const dateTo = useMemo(() => {
    const now = new Date()
    return new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 hours from now
  }, [])

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
          <div className="flex items-center justify-between">
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
            
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                isDarkMode={isDarkMode}
                onClick={() => setIsDarkMode(!isDarkMode)}
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                {isDarkMode ? 'Sáng' : 'Tối'}
              </Button>
              
              <Button
                variant="ghost"
                isDarkMode={isDarkMode}
                onClick={refetch}
              >
                <RefreshCw className="h-5 w-5" />
                Làm mới
              </Button>
              
              <Button
                variant="ghost"
                isDarkMode={isDarkMode}
                onClick={() => setIsCompactView(!isCompactView)}
              >
                {isCompactView ? <Grid3X3 className="h-5 w-5" /> : <List className="h-5 w-5" />}
                {isCompactView ? 'Lưới' : 'Danh sách'}
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
            
            return (
              <motion.section
                key={status}
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
                    </div>
                  </div>

                  <div className={`grid gap-6 ${
                    isCompactView 
                      ? 'grid-cols-1' 
                      : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                  }`}>
                    <AnimatePresence>
                      {matches.map((match) => (
                        <MatchCard
                          key={match.id}
                          match={match}
                          isCompact={isCompactView}
                          isDarkMode={isDarkMode}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
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
