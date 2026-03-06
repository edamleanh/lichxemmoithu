// --- Team Logo Offline Dictionary & Fuzzy Search Service ---
// Uses Dice's Coefficient percentage matching

const VALORANT_LOGOS = {
  "sentinels": require('../../../public/logos/.svg'),
  "paper rex": require('../../../public/logos/.svg'),
  "prx": require('../../../public/logos/.svg'),
  "gen.g": require('../../../public/logos/.svg'),
  "geng": require('../../../public/logos/.svg'),
  "team heretics": require('../../../public/logos/.svg'),
  "heretics": require('../../../public/logos/.svg'),
  "fnatic": require('../../../public/logos/.svg'),
  "fnc": require('../../../public/logos/.svg'),
  "loud": require('../../../public/logos/.svg'),
  "karmine corp": require('../../../public/logos/.svg'),
  "kc": require('../../../public/logos/.svg'),
  "natus vincere": require('../../../public/logos/.svg'),
  "navi": require('../../../public/logos/.svg'),
  "drx": require('../../../public/logos/.svg'),
  "t1": require('../../../public/logos/.svg'),
  "100 thieves": require('../../../public/logos/.svg'),
  "nrg": require('../../../public/logos/.svg'),
  "nrg esports": require('../../../public/logos/.svg'),
  "cloud9": require('../../../public/logos/.svg'),
  "c9": require('../../../public/logos/.svg'),
  "leviatan": require('../../../public/logos/.svg'),
  "bilibili gaming": require('../../../public/logos/.svg'),
  "blg": require('../../../public/logos/.svg'),
  "edward gaming": require('../../../public/logos/.svg'),
  "edg": require('../../../public/logos/.svg'),
  "fpx": require('../../../public/logos/.svg'),
  "funplus phoenix": require('../../../public/logos/.svg'),
  "zeta division": require('../../../public/logos/.svg'),
  "zeta": require('../../../public/logos/.svg'),
  "team liquid": require('../../../public/logos/.svg'),
  "liquid": require('../../../public/logos/.svg'),
  "tl": require('../../../public/logos/.svg'),
  "kru esports": require('../../../public/logos/.svg'),
  "kru": require('../../../public/logos/.svg'),
  "team secret": require('../../../public/logos/.svg'),
  "secret": require('../../../public/logos/.svg'),
  "talon esports": require('../../../public/logos/.svg'),
  "talon": require('../../../public/logos/.svg'),
  "rex regum qeon": require('../../../public/logos/.svg'),
  "rrq": require('../../../public/logos/.svg'),
  "global esports": require('../../../public/logos/.svg'),
  "ge": require('../../../public/logos/.svg'),
  "bleed esports": require('../../../public/logos/.svg'),
  "bleed": require('../../../public/logos/.svg'),
  "detonation focusme": require('../../../public/logos/.svg'),
  "dfm": require('../../../public/logos/.svg'),
  "furia": require('../../../public/logos/.svg'),
  "mibr": require('../../../public/logos/.svg'),
  "evil geniuses": require('../../../public/logos/.svg'),
  "eg": require('../../../public/logos/.svg'),
  "g2 esports": require('../../../public/logos/.svg'),
  "g2": require('../../../public/logos/.svg'),
  "team vitality": require('../../../public/logos/.svg'),
  "vitality": require('../../../public/logos/.svg'),
  "vit": require('../../../public/logos/.svg'),
  "bbl esports": require('../../../public/logos/.svg'),
  "bbl": require('../../../public/logos/.svg'),
  "fut esports": require('../../../public/logos/.svg'),
  "fut": require('../../../public/logos/.svg'),
  "tbg": require('../../../public/logos/.svg'),
  "koi": require('../../../public/logos/.svg'),
  "trace esports": require('../../../public/logos/.svg'),
  "teg": require('../../../public/logos/.svg'),
  "nova esports": require('../../../public/logos/.svg'),
  "nova": require('../../../public/logos/.svg'),
  "wolves esports": require('../../../public/logos/.svg'),
  "jd gaming": require('../../../public/logos/.svg'),
  "jdg": require('../../../public/logos/.svg'),
  "all gamers": require('../../../public/logos/.svg'),
  "ag": require('../../../public/logos/.svg'),
  "titan esports club": require('../../../public/logos/.svg'),
  "tec": require('../../../public/logos/.svg'),
  "dragon ranger gaming": require('../../../public/logos/.svg'),
  "drg": require('../../../public/logos/.svg'),
  "gentle mates": require('../../../public/logos/.svg'),
  "m8": require('../../../public/logos/.svg'),
  "rogue": require('../../../public/logos/.svg')
}

const DEFAULT_SPORT_LOGOS = {
  valorant: require('../../../src/images/valorant.png'),
  lol: require('../../../src/images/lol.png'),
  cs2: require('../../../src/images/csgo-4.svg'),
  football: require('../../../src/images/football.png'),
  pubg: require('../../../src/images/pubg.png'),
  tft: require('../../../src/images/tft.png')
}

// Generate an array of 2-character pairs to compare similarity
function getBigrams(str) {
  const bigrams = []
  for (let i = 0; i < str.length - 1; i++) {
    bigrams.push(str.substring(i, i + 2))
  }
  return bigrams
}

// Dice's Coefficient calculating percentage of string similarity
function calculateSimilarity(s1, s2) {
  s1 = s1.toLowerCase().replace(/[^a-z0-9]/g, '')
  s2 = s2.toLowerCase().replace(/[^a-z0-9]/g, '')
  
  // Exact match
  if (s1 === s2) return 1.0
  
  if (s1.includes(s2) || s2.includes(s1)) return 0.8; 
  
  if (s1.length < 2 || s2.length < 2) return 0.0

  const bigrams1 = getBigrams(s1)
  const bigrams2 = getBigrams(s2)

  let intersection = 0
  const bigrams1Copy = [...bigrams1]
  
  for (const bigram of bigrams2) {
    const index = bigrams1Copy.indexOf(bigram)
    if (index !== -1) {
      intersection++
      bigrams1Copy.splice(index, 1)
    }
  }

  return (2.0 * intersection) / (bigrams1.length + bigrams2.length)
}

export const TeamLogoSearchService = {
  config: {
    enabled: true, 
    matchingThreshold: 0.55
  },
  
  async searchTeamLogo(teamName, sport) {
    if (!teamName || !this.config.enabled) return null
    
    if (sport === 'valorant') {
      let bestMatch = null
      let highestScore = 0
      
      const cleanTeamName = teamName
        .replace(/\s*(Gaming|Esports|E-sports|Team|Club|FC|United|Esport)$/i, '')
        .trim()
        
      for (const [dictName, logoRequire] of Object.entries(VALORANT_LOGOS)) {
        const score = calculateSimilarity(cleanTeamName, dictName)
        if (score > highestScore) {
          highestScore = score
          bestMatch = { logoRequire, dictName, score }
        }
      }
      
      if (highestScore >= this.config.matchingThreshold) {
        console.log(`[FuzzyMatch] '${teamName}' -> matched '${bestMatch.dictName}' (local target)`)
        return bestMatch.logoRequire
      }
    }
    
    return DEFAULT_SPORT_LOGOS[sport] || null
  },
  
  async enhanceTeamWithLogo(team, sport) {
    if (!this.config.enabled || !team || !team.name) {
      return team
    }
    
    // Skip if official API logo returned perfectly (and isn't owcdn net since it blocks us)
    if (team.logo && team.logo.length > 5 && !team.logo.includes('owcdn.net')) {
       return team
    }
    
    // Otherwise fallback to offline fuzzy match
    const localLogo = await this.searchTeamLogo(team.name, sport)
    
    return {
      ...team,
      logo: localLogo || team.logo
    }
  }
}
