// --- Team Logo Offline Dictionary & Fuzzy Search Service ---
// Uses Dice's Coefficient percentage matching instead of Google Image Search

const VALORANT_LOGOS = {
  "sentinels": "https://owcdn.net/img/60cedbff184c0.png",
  "paper rex": "https://owcdn.net/img/620023ee45c71.png",
  "prx": "https://owcdn.net/img/620023ee45c71.png",
  "gen.g": "https://owcdn.net/img/63e1d163e79bd.png",
  "geng": "https://owcdn.net/img/63e1d163e79bd.png",
  "team heretics": "https://owcdn.net/img/63de5eedac14e.png",
  "heretics": "https://owcdn.net/img/63de5eedac14e.png",
  "fnatic": "https://owcdn.net/img/63d21ebdeeee4.png",
  "fnc": "https://owcdn.net/img/63d21ebdeeee4.png",
  "loud": "https://owcdn.net/img/6211cb73f1dcb.png",
  "karmine corp": "https://owcdn.net/img/63d414902ec28.png",
  "kc": "https://owcdn.net/img/63d414902ec28.png",
  "natus vincere": "https://owcdn.net/img/63de656f71d18.png",
  "navi": "https://owcdn.net/img/63de656f71d18.png",
  "drx": "https://owcdn.net/img/627fdb962ffab.png",
  "t1": "https://owcdn.net/img/63de801b65e9d.png",
  "100 thieves": "https://owcdn.net/img/6056d0bd192c7.png",
  "nrg": "https://owcdn.net/img/63def07de0044.png",
  "nrg esports": "https://owcdn.net/img/63def07de0044.png",
  "cloud9": "https://owcdn.net/img/5f480393f0b2f.png",
  "c9": "https://owcdn.net/img/5f480393f0b2f.png",
  "leviatan": "https://owcdn.net/img/61fc37c4d57fe.png",
  "bilibili gaming": "https://owcdn.net/img/64620f4ae91ca.png",
  "blg": "https://owcdn.net/img/64620f4ae91ca.png",
  "edward gaming": "https://owcdn.net/img/63def55938d87.png",
  "edg": "https://owcdn.net/img/63def55938d87.png",
  "fpx": "https://owcdn.net/img/663c780df2446.png",
  "funplus phoenix": "https://owcdn.net/img/663c780df2446.png",
  "zeta division": "https://owcdn.net/img/6122d21bc699b.png",
  "zeta": "https://owcdn.net/img/6122d21bc699b.png",
  "team liquid": "https://owcdn.net/img/63de5fc442971.png",
  "liquid": "https://owcdn.net/img/63de5fc442971.png",
  "tl": "https://owcdn.net/img/63de5fc442971.png",
  "kru esports": "https://owcdn.net/img/601878d65cfc1.png",
  "kru": "https://owcdn.net/img/601878d65cfc1.png",
  "team secret": "https://owcdn.net/img/613ba249f05ac.png",
  "secret": "https://owcdn.net/img/613ba249f05ac.png",
  "talon esports": "https://owcdn.net/img/64299b8206152.png",
  "talon": "https://owcdn.net/img/64299b8206152.png",
  "rex regum qeon": "https://owcdn.net/img/63de816db73cc.png",
  "rrq": "https://owcdn.net/img/63de816db73cc.png",
  "global esports": "https://owcdn.net/img/63de7f3b890a8.png",
  "ge": "https://owcdn.net/img/63de7f3b890a8.png",
  "bleed esports": "https://owcdn.net/img/63870e28d9c2f.png",
  "bleed": "https://owcdn.net/img/63870e28d9c2f.png",
  "detonation focusme": "https://owcdn.net/img/63def21a4f005.png",
  "dfm": "https://owcdn.net/img/63def21a4f005.png",
  "furia": "https://owcdn.net/img/63dbf1cdd7d29.png",
  "mibr": "https://owcdn.net/img/63deeda20efac.png",
  "evil geniuses": "https://owcdn.net/img/63deef898f7e2.png",
  "eg": "https://owcdn.net/img/63deef898f7e2.png",
  "g2 esports": "https://owcdn.net/img/656e1b6f0e9b9.png",
  "g2": "https://owcdn.net/img/656e1b6f0e9b9.png",
  "team vitality": "https://owcdn.net/img/63de60c0420df.png",
  "vitality": "https://owcdn.net/img/63de60c0420df.png",
  "vit": "https://owcdn.net/img/63de60c0420df.png",
  "bbl esports": "https://owcdn.net/img/60cf532788eeb.png",
  "bbl": "https://owcdn.net/img/60cf532788eeb.png",
  "fut esports": "https://owcdn.net/img/63de635fd4ab1.png",
  "fut": "https://owcdn.net/img/63de635fd4ab1.png",
  "tbg": "https://owcdn.net/img/63de64619b0ce.png",
  "koi": "https://owcdn.net/img/63df3cc77f394.png",
  "trace esports": "https://owcdn.net/img/66881bcdeb5b0.png",
  "teg": "https://owcdn.net/img/66881bcdeb5b0.png",
  "nova esports": "https://owcdn.net/img/651f8a7eacd45.png",
  "nova": "https://owcdn.net/img/651f8a7eacd45.png",
  "wolves esports": "https://owcdn.net/img/651f8a8bb231b.png",
  "jd gaming": "https://owcdn.net/img/6632f1737eaaa.png",
  "jdg": "https://owcdn.net/img/6632f1737eaaa.png",
  "all gamers": "https://owcdn.net/img/660c1844e13cd.png",
  "ag": "https://owcdn.net/img/660c1844e13cd.png",
  "titan esports club": "https://owcdn.net/img/660a9f0ee2d77.png",
  "tec": "https://owcdn.net/img/660a9f0ee2d77.png",
  "dragon ranger gaming": "https://owcdn.net/img/660c18544f8f4.png",
  "drg": "https://owcdn.net/img/660c18544f8f4.png",
  "gentle mates": "https://owcdn.net/img/6561dbba6e665.png",
  "m8": "https://owcdn.net/img/6561dbba6e665.png",
  "rogue": "https://owcdn.net/img/656cd61a8f9df.png",
}

const DEFAULT_SPORT_LOGOS = {
  valorant: 'https://seeklogo.com/images/V/valorant-logo-FAB2CA0E55-seeklogo.com.png',
  lol: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/League_of_Legends_2019_vector.svg/1200px-League_of_Legends_2019_vector.svg.png',
  cs2: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Counter-Strike_2_logo.svg/1200px-Counter-Strike_2_logo.svg.png',
  football: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Football_%28soccer_ball%29.svg/1024px-Football_%28soccer_ball%29.svg.png',
  pubg: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/52/PUBG_Battlegrounds_logo.svg/1200px-PUBG_Battlegrounds_logo.svg.png',
  tft: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f3/Teamfight_Tactics_logo.svg/1200px-Teamfight_Tactics_logo.svg.png'
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
  
  // High confidence if one string perfectly contains the other 
  // e.g. "geng" inside "gengesports"
  if (s1.includes(s2) || s2.includes(s1)) {
     return 0.8; 
  }
  
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

  // Returns score between 0.0 and 1.0
  return (2.0 * intersection) / (bigrams1.length + bigrams2.length)
}

export const TeamLogoSearchService = {
  config: {
    enabled: true, 
    matchingThreshold: 0.55 // Accept logos with >= 55% similarity
  },
  
  async searchTeamLogo(teamName, sport) {
    if (!teamName || !this.config.enabled) return null
    
    // Only apply the dictionary for Valorant
    if (sport === 'valorant') {
      let bestMatch = null
      let highestScore = 0
      
      // Clean noise keywords from the API provided name
      const cleanTeamName = teamName
        .replace(/\s*(Gaming|Esports|E-sports|Team|Club|FC|United|Esport)$/i, '')
        .trim()
        
      // Loop through our hardcoded dictionary
      for (const [dictName, logoUrl] of Object.entries(VALORANT_LOGOS)) {
        const score = calculateSimilarity(cleanTeamName, dictName)
        if (score > highestScore) {
          highestScore = score
          bestMatch = { logoUrl, dictName, score }
        }
      }
      
      // If we found a match above 55% threshold, return its logo
      if (highestScore >= this.config.matchingThreshold) {
        console.log(`[FuzzyMatch] '${teamName}' -> matched '${bestMatch.dictName}'`)
        
        // Fix hotlink 403 Forbidden errors from owcdn.net by using an image proxy
        const proxiedUrl = bestMatch.logoUrl.includes('owcdn.net') 
          ? `https://wsrv.nl/?url=${bestMatch.logoUrl.replace('https://', '')}` 
          : bestMatch.logoUrl;
          
        return proxiedUrl
      } else {
        console.log(`[FuzzyMatch] '${teamName}' -> No strong match (best was ${Math.round(highestScore*100)}%). Using Fallback.`)
      }
    }
    
    // Return a default logo placeholder instead of broken image
    return DEFAULT_SPORT_LOGOS[sport] || null
  },
  
  async enhanceTeamWithLogo(team, sport) {
    if (!this.config.enabled || !team || !team.name) {
      return team
    }
    
    // Always use the official logo from API if it exists and is a valid URL length
    if (team.logo && team.logo.length > 5) {
       return team
    }
    
    // Fallback offline fuzzy matching dictionary
    const logoUrl = await this.searchTeamLogo(team.name, sport)
    
    return {
      ...team,
      logo: logoUrl || team.logo
    }
  }
}
