import { adjustValorantTimezone, withinRange } from '../utils/formatters.js'
import { TeamLogoSearchService } from './teamLogoSearch.js'

export const ValorantAdapter = {
  // Helper function to check if a league should be included
  isValidLeague(leagueName) {
    if (!leagueName) return false
    
    const leagueLower = leagueName.toLowerCase()
    const validKeywords = ['champions', 'champion', 'masters','master', 'apac', 'on live', 'onlive', 'ovs', 'pacific']

    return validKeywords.some(keyword => leagueLower.includes(keyword))
  },

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
    if (!data.data?.segments) {
      return []
    }
    
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
      .map(match => {
        return {
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
        }
      })
    

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
    if (!data.data?.segments) {
      return []
    }
    
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
      .map(match => {
        return {
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
        }
      })
    

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
        const liveResponse = await fetch('/api/valorant/match?q=live_score')
        
        if (liveResponse.ok) {
          const liveData = await liveResponse.json()
          
          const liveMatches = await this.processLiveMatches(liveData)
          allMatches = [...allMatches, ...liveMatches]
        }
      } catch (error) {
        // console.error('❌ VALORANT LIVE API Error:', error)
      }

      // Fetch upcoming matches
      try {
        const upcomingResponse = await fetch('/api/valorant/match?q=upcoming')
        
        if (upcomingResponse.ok) {
          const upcomingData = await upcomingResponse.json()
          
          const upcomingMatches = await this.processUpcomingMatches(upcomingData)
          allMatches = [...allMatches, ...upcomingMatches]
        }
      } catch (error) {
        // console.error('❌ VALORANT UPCOMING API Error:', error)
      }

      // Fetch completed matches (results)
      try {
        const resultsResponse = await fetch('/api/valorant/match?q=results')
        
        if (resultsResponse.ok) {
          const resultsData = await resultsResponse.json()
          
          const completedMatches = await this.processCompletedMatches(resultsData)
          allMatches = [...allMatches, ...completedMatches]
        }
      } catch (error) {
        // console.error('❌ VALORANT RESULTS API Error:', error)
      }

      // Filter matches by date range and remove duplicates
      const filteredMatches = allMatches
        .filter(match => withinRange(match.start, from, to))
        .filter((match, index, self) => 
          index === self.findIndex(m => m.id === match.id)
        )
        .filter(match => this.isValidLeague(match.league)) // Only keep major tournaments

      // If no matches found, return empty array instead of sample data
      if (filteredMatches.length === 0) {
        return []
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
      return [] // Return empty array instead of sample data
    }
  },
}
