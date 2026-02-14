import { withinRange } from '../utils/formatters.js'
import { TeamLogoSearchService } from './teamLogoSearch.js'

export const LolAdapter = {
  async fetch({ from, to }) {
    try {
      // Add timeout for LoL API
      const controller = new AbortController()
      setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      const leagues = [
        { id: '98767991332355509', name: 'VCS' }, // Vietnam
        { id: '98767991310872058', name: 'LCK' }, // Korea
        { id: '98767991314006698', name: 'LPL' }, // China
        { id: '113476371197627891', name: 'LCP' }, // Pacific
        { id: '98767991302996019', name: 'LEC' }, // EMEA
        { id: '98767991299243165', name: 'LCS' }, // Americas
        { id: '98767991325878492', name: 'MSI' }, 
        { id: '98767975604023819', name: 'Worlds' }
      ]

      const fetchLeagueSchedule = async (league) => {
        try {
          const response = await fetch(`/api/lol/persisted/gw/getSchedule?hl=vi-VN&leagueId=${league.id}`, {
            signal: controller.signal
          })
          
          if (!response.ok) return []
          
          const data = await response.json()
          return data.data?.schedule?.events || []
        } catch (error) {
          console.warn(`Failed to fetch LoL schedule for ${league.name}`, error)
          return []
        }
      }

      const results = await Promise.all(leagues.map(fetchLeagueSchedule))
      const allEvents = results.flat()
      
      if (allEvents.length === 0) return []
      
      const matches = allEvents.map(event => ({
        id: `lol-${event.match?.id || Math.random()}`,
        game: 'lol',
        league: event.league?.name || 'LoL Esports',
        stage: event.match?.strategy?.count ? `Bo${event.match.strategy.count}` : (event.match?.strategy?.type || event.blockName || ''),
        home: { 
          name: event.match?.teams?.[0]?.name || 'TBD', 
          logo: event.match?.teams?.[0]?.image || null,
          score: (event.state === 'completed' || event.state === 'inProgress') ? event.match?.teams?.[0]?.result?.gameWins : undefined
        },
        away: { 
          name: event.match?.teams?.[1]?.name || 'TBD', 
          logo: event.match?.teams?.[1]?.image || null,
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
      
      // Sort LoL matches: LIVE first, then by start time
      const sortedMatches = enhancedMatches.sort((a, b) => {
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
  }
}
