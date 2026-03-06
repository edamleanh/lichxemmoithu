// --- Team Logo Offline Dictionary & Fuzzy Search Service ---
// Uses Dice's Coefficient percentage matching

const VALORANT_LOGOS = {
  "sentinels": "/logos/60cedbff184c0.png",
  "paper rex": "/logos/620023ee45c71.png",
  "prx": "/logos/620023ee45c71.png",
  "gen.g": "/logos/63e1d163e79bd.png",
  "geng": "/logos/63e1d163e79bd.png",
  "team heretics": "/logos/63de5eedac14e.png",
  "heretics": "/logos/63de5eedac14e.png",
  "fnatic": "/logos/63d21ebdeeee4.png",
  "fnc": "/logos/63d21ebdeeee4.png",
  "loud": "/logos/6211cb73f1dcb.png",
  "karmine corp": "/logos/63d414902ec28.png",
  "kc": "/logos/63d414902ec28.png",
  "natus vincere": "/logos/63de656f71d18.png",
  "navi": "/logos/63de656f71d18.png",
  "drx": "/logos/627fdb962ffab.png",
  "t1": "/logos/63de801b65e9d.png",
  "100 thieves": "/logos/6056d0bd192c7.png",
  "nrg": "/logos/63def07de0044.png",
  "nrg esports": "/logos/63def07de0044.png",
  "cloud9": "/logos/5f480393f0b2f.png",
  "c9": "/logos/5f480393f0b2f.png",
  "leviatan": "/logos/61fc37c4d57fe.png",
  "bilibili gaming": "/logos/64620f4ae91ca.png",
  "blg": "/logos/64620f4ae91ca.png",
  "edward gaming": "/logos/63def55938d87.png",
  "edg": "/logos/63def55938d87.png",
  "fpx": "/logos/663c780df2446.png",
  "funplus phoenix": "/logos/663c780df2446.png",
  "zeta division": "/logos/6122d21bc699b.png",
  "zeta": "/logos/6122d21bc699b.png",
  "team liquid": "/logos/63de5fc442971.png",
  "liquid": "/logos/63de5fc442971.png",
  "tl": "/logos/63de5fc442971.png",
  "kru esports": "/logos/601878d65cfc1.png",
  "kru": "/logos/601878d65cfc1.png",
  "team secret": "/logos/613ba249f05ac.png",
  "secret": "/logos/613ba249f05ac.png",
  "talon esports": "/logos/64299b8206152.png",
  "talon": "/logos/64299b8206152.png",
  "rex regum qeon": "/logos/63de816db73cc.png",
  "rrq": "/logos/63de816db73cc.png",
  "global esports": "/logos/63de7f3b890a8.png",
  "ge": "/logos/63de7f3b890a8.png",
  "bleed esports": "/logos/63870e28d9c2f.png",
  "bleed": "/logos/63870e28d9c2f.png",
  "detonation focusme": "/logos/63def21a4f005.png",
  "dfm": "/logos/63def21a4f005.png",
  "furia": "/logos/63dbf1cdd7d29.png",
  "mibr": "/logos/63deeda20efac.png",
  "evil geniuses": "/logos/63deef898f7e2.png",
  "eg": "/logos/63deef898f7e2.png",
  "g2 esports": "/logos/656e1b6f0e9b9.png",
  "g2": "/logos/656e1b6f0e9b9.png",
  "team vitality": "/logos/63de60c0420df.png",
  "vitality": "/logos/63de60c0420df.png",
  "vit": "/logos/63de60c0420df.png",
  "bbl esports": "/logos/60cf532788eeb.png",
  "bbl": "/logos/60cf532788eeb.png",
  "fut esports": "/logos/63de635fd4ab1.png",
  "fut": "/logos/63de635fd4ab1.png",
  "tbg": "/logos/63de64619b0ce.png",
  "koi": "/logos/63df3cc77f394.png",
  "trace esports": "/logos/66881bcdeb5b0.png",
  "teg": "/logos/66881bcdeb5b0.png",
  "nova esports": "/logos/651f8a7eacd45.png",
  "nova": "/logos/651f8a7eacd45.png",
  "wolves esports": "/logos/651f8a8bb231b.png",
  "jd gaming": "/logos/6632f1737eaaa.png",
  "jdg": "/logos/6632f1737eaaa.png",
  "all gamers": "/logos/660c1844e13cd.png",
  "ag": "/logos/660c1844e13cd.png",
  "titan esports club": "/logos/660a9f0ee2d77.png",
  "tec": "/logos/660a9f0ee2d77.png",
  "dragon ranger gaming": "/logos/660c18544f8f4.png",
  "drg": "/logos/660c18544f8f4.png",
  "gentle mates": "/logos/6561dbba6e665.png",
  "m8": "/logos/6561dbba6e665.png",
  "rogue": "/logos/656cd61a8f9df.png",
  "nongshim redforce": "/logos/nongshim-redforce.png",
  "ns": "/logos/nongshim-redforce.png"
}

const DEFAULT_SPORT_LOGOS = {
  valorant: '/images/valorant.png',
  lol: '/images/lol.png',
  cs2: '/images/csgo-4.png',
  football: '/images/football.png',
  pubg: '/images/pubg.png',
  tft: '/images/tft.png'
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
        
      for (const [dictName, logoUrl] of Object.entries(VALORANT_LOGOS)) {
        const score = calculateSimilarity(cleanTeamName, dictName)
        if (score > highestScore) {
          highestScore = score
          bestMatch = { logoUrl, dictName, score }
        }
      }
      
      if (highestScore >= this.config.matchingThreshold) {
        console.log(`[FuzzyMatch] '${teamName}' -> matched '${bestMatch.dictName}' (local target)`)
        return bestMatch.logoUrl
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
