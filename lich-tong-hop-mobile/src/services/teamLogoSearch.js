// --- Team Logo Offline Dictionary & Fuzzy Search Service ---
// Uses Dice's Coefficient percentage matching

const VALORANT_LOGOS = {
  "sentinels": require('../../assets/logos/60cedbff184c0.svg'),
  "paper rex": require('../../assets/logos/620023ee45c71.svg'),
  "prx": require('../../assets/logos/620023ee45c71.svg'),
  "gen.g": require('../../assets/logos/63e1d163e79bd.svg'),
  "geng": require('../../assets/logos/63e1d163e79bd.svg'),
  "team heretics": require('../../assets/logos/63de5eedac14e.svg'),
  "heretics": require('../../assets/logos/63de5eedac14e.svg'),
  "fnatic": require('../../assets/logos/63d21ebdeeee4.svg'),
  "fnc": require('../../assets/logos/63d21ebdeeee4.svg'),
  "loud": require('../../assets/logos/6211cb73f1dcb.svg'),
  "karmine corp": require('../../assets/logos/63d414902ec28.svg'),
  "kc": require('../../assets/logos/63d414902ec28.svg'),
  "natus vincere": require('../../assets/logos/63de656f71d18.svg'),
  "navi": require('../../assets/logos/63de656f71d18.svg'),
  "drx": require('../../assets/logos/627fdb962ffab.svg'),
  "t1": require('../../assets/logos/63de801b65e9d.svg'),
  "100 thieves": require('../../assets/logos/6056d0bd192c7.svg'),
  "nrg": require('../../assets/logos/63def07de0044.svg'),
  "nrg esports": require('../../assets/logos/63def07de0044.svg'),
  "cloud9": require('../../assets/logos/5f480393f0b2f.svg'),
  "c9": require('../../assets/logos/5f480393f0b2f.svg'),
  "leviatan": require('../../assets/logos/61fc37c4d57fe.svg'),
  "bilibili gaming": require('../../assets/logos/64620f4ae91ca.svg'),
  "blg": require('../../assets/logos/64620f4ae91ca.svg'),
  "edward gaming": require('../../assets/logos/63def55938d87.svg'),
  "edg": require('../../assets/logos/63def55938d87.svg'),
  "fpx": require('../../assets/logos/663c780df2446.svg'),
  "funplus phoenix": require('../../assets/logos/663c780df2446.svg'),
  "zeta division": require('../../assets/logos/6122d21bc699b.svg'),
  "zeta": require('../../assets/logos/6122d21bc699b.svg'),
  "team liquid": require('../../assets/logos/63de5fc442971.svg'),
  "liquid": require('../../assets/logos/63de5fc442971.svg'),
  "tl": require('../../assets/logos/63de5fc442971.svg'),
  "kru esports": require('../../assets/logos/601878d65cfc1.svg'),
  "kru": require('../../assets/logos/601878d65cfc1.svg'),
  "team secret": require('../../assets/logos/613ba249f05ac.svg'),
  "secret": require('../../assets/logos/613ba249f05ac.svg'),
  "talon esports": require('../../assets/logos/64299b8206152.svg'),
  "talon": require('../../assets/logos/64299b8206152.svg'),
  "rex regum qeon": require('../../assets/logos/63de816db73cc.svg'),
  "rrq": require('../../assets/logos/63de816db73cc.svg'),
  "global esports": require('../../assets/logos/63de7f3b890a8.svg'),
  "ge": require('../../assets/logos/63de7f3b890a8.svg'),
  "bleed esports": require('../../assets/logos/63870e28d9c2f.svg'),
  "bleed": require('../../assets/logos/63870e28d9c2f.svg'),
  "detonation focusme": require('../../assets/logos/63def21a4f005.svg'),
  "dfm": require('../../assets/logos/63def21a4f005.svg'),
  "furia": require('../../assets/logos/63dbf1cdd7d29.svg'),
  "mibr": require('../../assets/logos/63deeda20efac.svg'),
  "evil geniuses": require('../../assets/logos/63deef898f7e2.svg'),
  "eg": require('../../assets/logos/63deef898f7e2.svg'),
  "g2 esports": require('../../assets/logos/656e1b6f0e9b9.svg'),
  "g2": require('../../assets/logos/656e1b6f0e9b9.svg'),
  "team vitality": require('../../assets/logos/63de60c0420df.svg'),
  "vitality": require('../../assets/logos/63de60c0420df.svg'),
  "vit": require('../../assets/logos/63de60c0420df.svg'),
  "bbl esports": require('../../assets/logos/60cf532788eeb.svg'),
  "bbl": require('../../assets/logos/60cf532788eeb.svg'),
  "fut esports": require('../../assets/logos/63de635fd4ab1.svg'),
  "fut": require('../../assets/logos/63de635fd4ab1.svg'),
  "tbg": require('../../assets/logos/63de64619b0ce.svg'),
  "koi": require('../../assets/logos/63df3cc77f394.svg'),
  "trace esports": require('../../assets/logos/66881bcdeb5b0.svg'),
  "teg": require('../../assets/logos/66881bcdeb5b0.svg'),
  "nova esports": require('../../assets/logos/651f8a7eacd45.svg'),
  "nova": require('../../assets/logos/651f8a7eacd45.svg'),
  "wolves esports": require('../../assets/logos/651f8a8bb231b.svg'),
  "jd gaming": require('../../assets/logos/6632f1737eaaa.svg'),
  "jdg": require('../../assets/logos/6632f1737eaaa.svg'),
  "all gamers": require('../../assets/logos/660c1844e13cd.svg'),
  "ag": require('../../assets/logos/660c1844e13cd.svg'),
  "titan esports club": require('../../assets/logos/660a9f0ee2d77.svg'),
  "tec": require('../../assets/logos/660a9f0ee2d77.svg'),
  "dragon ranger gaming": require('../../assets/logos/660c18544f8f4.svg'),
  "drg": require('../../assets/logos/660c18544f8f4.svg'),
  "gentle mates": require('../../assets/logos/6561dbba6e665.svg'),
  "m8": require('../../assets/logos/6561dbba6e665.svg'),
  "rogue": require('../../assets/logos/656cd61a8f9df.svg')
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
