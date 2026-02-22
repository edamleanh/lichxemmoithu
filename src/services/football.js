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
      
      // Format dates for API
      const formatDate = (date) => {
        return date.toISOString().split('T')[0]
      }
      
      const dateFrom = formatDate(from || new Date())
      const dateTo = formatDate(to || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
      
      // Fetch matches from football-data.org in parallel
      const leaguePromises = leagues.map(async (league) => {
        try {
          // Use proxy endpoint with correct URL structure
          const response = await fetch(
            `/api/football/competitions/${league.id}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`
          )
          
          if (!response.ok) {
            return []
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
                stream: 'https://www.xaycon.live', // Hardcoded stream link
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
            
            return enhancedMatches
          }
          return []
        } catch (err) {
          return []
        }
      })
      
      const results = await Promise.all(leaguePromises)
      allMatches = results.flat()
      
      // Remove duplicates
      const uniqueMatches = allMatches.filter((match, index, self) => 
        index === self.findIndex(m => m.id === match.id)
      )
      
      const filteredMatches = uniqueMatches
        .filter(match => withinRange(match.start, from, to))
      
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
