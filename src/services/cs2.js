import { TeamLogoSearchService } from './teamLogoSearch.js'

export const Cs2Adapter = {
  isValidLeague(tier) {
    if (!tier) return false
    // PandaScore tiers: 's', 'a', 'b', 'c', 'd', 'unranked'
    return ['s', 'a'].includes(tier.toLowerCase())
  },

  async fetch({ from, to }) {
    try {
      const fromStr = from.toISOString()
      const toStr = to.toISOString()
      
      // Fetch matches from PandaScore API via our proxy
      const response = await fetch(`/api/cs2?sort=begin_at&range[begin_at]=${fromStr},${toStr}&per_page=50`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch CS2 matches')
      }

      const data = await response.json()
      
      if (!Array.isArray(data)) {
        return []
      }

      // Process and map the matches
      const matches = data.map(match => {
        // Extract teams
        const homeTeam = match.opponents?.[0]?.opponent || {}
        const awayTeam = match.opponents?.[1]?.opponent || {}
        
        // Extract scores
        const homeScore = match.results?.find(r => r.team_id === homeTeam.id)?.score || 0
        const awayScore = match.results?.find(r => r.team_id === awayTeam.id)?.score || 0

        // Determine league name
        let leagueName = match.league?.name || 'CS2'
        if (match.tournament?.name && !match.tournament.name.toLowerCase().includes('group')) {
           leagueName = `${leagueName} - ${match.tournament.name}`
        }

        return {
          id: `cs2-${match.id}`,
          game: 'cs2',
          league: leagueName,
          tier: match.tournament?.tier || match.serie?.tier || '',
          stage: match.name || '', // e.g. "FaZe vs G2"
          home: {
            name: homeTeam.name || 'TBD',
            logo: homeTeam.image_url || null,
            score: homeScore
          },
          away: {
            name: awayTeam.name || 'TBD',
            logo: awayTeam.image_url || null,
            score: awayScore
          },
          start: match.begin_at ? new Date(match.begin_at) : new Date(),
          status: match.status === 'running' ? 'live' 
                : match.status === 'finished' ? 'finished' 
                : 'upcoming',
          stream: match.official_stream_url || '',
        }
      })

      // Try to filter for major tournaments (S and A tier)
      // If a match doesn't have a tier but looks important, we might miss it.
      // Alternatively, we can just return all matches if filtering by tier returns nothing.
      const sAndATierMatches = matches.filter(match => this.isValidLeague(match.tier))
      
      // Fallback: If no S/A tier matches found in this timeframe, maybe show B tier
      let filteredMatches = sAndATierMatches.length > 0 ? sAndATierMatches : matches

      // Enhance matches with team logos if missing
      const enhancedMatches = await Promise.all(
        filteredMatches.map(async (match) => {
          try {
            const enhancedHome = match.home.logo ? match.home : await TeamLogoSearchService.enhanceTeamWithLogo(match.home, 'csgo')
            const enhancedAway = match.away.logo ? match.away : await TeamLogoSearchService.enhanceTeamWithLogo(match.away, 'csgo')
            return {
              ...match,
              home: enhancedHome,
              away: enhancedAway
            }
          } catch (error) {
            return match
          }
        })
      )

      return enhancedMatches
    } catch (error) {
      console.error('Error fetching CS2 data:', error)
      return []
    }
  }
}
