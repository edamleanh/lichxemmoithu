import { withinRange } from '../utils/formatters.js'
import { TeamLogoSearchService } from './teamLogoSearch.js'

export const FootballAdapter = {
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
          // If test fails, return empty array immediately
          return []
        }
      } catch (apiError) {
        // If API fails, return empty array immediately
        return []
      }
      
      // Major league IDs on football-data.org (reduced list to avoid rate limits)
      const leagues = [
        { id: 'PL', name: 'Premier League' },
        { id: 'PD', name: 'LaLiga' },
        { id: 'CL', name: 'Champions League' },
      ]
      
      let allMatches = []
      let liveMatches = []
      
      // 🔴 STEP 1: Fetch Live Matches từ API mới
      try {
        const liveResponse = await fetch('https://apibongda.onrender.com/api/matches/live', {
          signal: AbortSignal.timeout(8000) // 8 second timeout
        })
        
        if (liveResponse.ok) {
          const liveData = await liveResponse.json()
          
          if (liveData.success && liveData.data && liveData.data.length > 0) {
            // Map live data to our format
            liveMatches = liveData.data.map((match, index) => {
              // Parse score from rawText
              const scoreMatch = match.rawText?.match(/(\d+)\s*-\s*(\d+)/)
              const homeScore = scoreMatch ? parseInt(scoreMatch[1]) : undefined
              const awayScore = scoreMatch ? parseInt(scoreMatch[2]) : undefined
              
              // Parse minute from rawText
              const minuteMatch = match.rawText?.match(/(\d+)'/)
              const currentMinute = minuteMatch ? parseInt(minuteMatch[1]) : undefined
              
              // Check for Half Time status in rawText
              const isHalfTime = match.rawText?.includes('HT') || match.rawText?.includes('Half Time')
              
              // Parse date and time
              let matchDate = new Date()
              if (match.time) {
                const [datePart, timePart] = match.time.split(' ')
                const [day, month] = datePart.split('/')
                const [hour, minute] = timePart.split(':')
                matchDate = new Date(2025, parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute))
              }
              
              return {
                id: `live-${match.homeTeam}-${match.awayTeam}-${index}`.replace(/\s/g, '-'),
                game: 'football',
                league: match.league || 'Live Match',
                stage: 'LIVE',
                home: {
                  name: match.homeTeam,
                  logo: match.homeTeamLogo || null,
                  score: homeScore
                },
                away: {
                  name: match.awayTeam,
                  logo: match.awayTeamLogo || null,
                  score: awayScore
                },
                start: matchDate,
                venue: match.source || 'Live Stream',
                region: 'Live',
                stream: match.link || '',
                status: 'live',
                currentMinute: currentMinute,
                halfTime: isHalfTime ? 'HT' : undefined,
                commentator: match.blv,
                source: match.source
              }
            })
            
            console.log(`✅ Loaded ${liveMatches.length} live matches from apibongda.onrender.com`)
          }
        }
      } catch (liveError) {
        console.warn(`⚠️ Live API failed, will fallback to football-data.org IN_PLAY:`, liveError.message)
      }
      
      // Format dates for API
      const formatDate = (date) => {
        return date.toISOString().split('T')[0]
      }
      
      const dateFrom = formatDate(from || new Date())
      const dateTo = formatDate(to || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
      
      // 📅 STEP 2: Fetch SCHEDULED & FINISHED matches từ football-data.org
      for (const league of leagues) {
        try {
          // Use proxy endpoint with correct URL structure
          const response = await fetch(
            `/api/football/competitions/${league.id}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`
          )
          
          if (!response.ok) {
            // If it's a 400 error (bad request), likely API key issue
            if (response.status === 400) {
              return [] // Return empty array instead of sample data
            }
            continue
          }
          
          const data = await response.json()
          
          if (data.matches) {
            // 🎯 Filter: Chỉ lấy SCHEDULED và FINISHED
            // Nếu có live data từ API mới → skip IN_PLAY
            // Nếu không có live data → fallback lấy IN_PLAY
            const shouldIncludeLive = liveMatches.length === 0
            
            const filteredMatches = data.matches.filter(match => {
              if (match.status === 'SCHEDULED' || match.status === 'FINISHED') {
                return true
              }
              // Fallback: Chỉ lấy IN_PLAY nếu live API failed
              if (shouldIncludeLive && (match.status === 'IN_PLAY' || match.status === 'PAUSED')) {
                return true
              }
              return false
            })
            
            const matches = filteredMatches.map(match => {
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
              currentMinute: match.status === 'IN_PLAY' ? match.minute : undefined,
              halfTime: match.status === 'PAUSED' ? 'HT' : undefined,
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
      
      // 🔗 STEP 3: Merge live matches với scheduled/finished matches
      const combinedMatches = [...liveMatches, ...allMatches]
      
      // Remove duplicates
      const uniqueMatches = combinedMatches.filter((match, index, self) => 
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
        return [] // Return empty array instead of sample data
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
      return [] // Return empty array instead of sample data
    }
  }
}
