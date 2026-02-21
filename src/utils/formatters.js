// Utility functions for formatting dates and handling team names

export const toDate = (v) => (v instanceof Date ? v : new Date(v))

export const fmtTime = (date, opts = {}) => {
  const d = toDate(date)
  const now = new Date()
  
  // Check if match is today
  const isToday = now.getDate() === d.getDate() &&
    now.getMonth() === d.getMonth() &&
    now.getFullYear() === d.getFullYear()
    
  // Check if match is tomorrow
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const isTomorrow = tomorrow.getDate() === d.getDate() &&
    tomorrow.getMonth() === d.getMonth() &&
    tomorrow.getFullYear() === d.getFullYear()
    
  // Check if match is yesterday
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const isYesterday = yesterday.getDate() === d.getDate() &&
    yesterday.getMonth() === d.getMonth() &&
    yesterday.getFullYear() === d.getFullYear()
    
  const timeStr = new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit', minute: '2-digit', ...opts
  }).format(d);
  
  if (isToday) return `Hôm nay, ${timeStr}`;
  if (isTomorrow) return `Ngày mai, ${timeStr}`;
  if (isYesterday) return `Hôm qua, ${timeStr}`;
  
  // Format for other days
  const dateStr = new Intl.DateTimeFormat('vi-VN', { 
    day: '2-digit', month: '2-digit', ...opts 
  }).format(d);
  
  return `${dateStr}, ${timeStr}`;
}

export const fmtDay = (d) => new Intl.DateTimeFormat('vi-VN', { 
  weekday: 'long', day: '2-digit', month: 'long' 
}).format(toDate(d))

export const withinRange = (d, from, to) => {
  const t = toDate(d).getTime()
  return (!from || t >= toDate(from).getTime()) && (!to || t <= toDate(to).getTime())
}

// Esports Team Acronyms for Search
export const TEAM_ACRONYMS = {
  // LCK
  'Gen.G Esports': 'GEN',
  'Gen.G': 'GEN',
  'Hanwha Life Esports': 'HLE',
  'Dplus KIA': 'DK',
  'KT Rolster': 'KT',
  'Kwangdong Freecs': 'KDF',
  'DN SOOPers': 'SOOP',
  'SOOPers': 'SOOP',
  'FearX': 'FOX',
  'BNK FearX': 'FOX',
  'Nongshim RedForce': 'NS',
  'OKSavingsBank BRION': 'BRO',
  'Hanjin Brion': 'BRO',
  'T1': 'T1',
  'DRX': 'DRX',
  
  // VCS
  'GAM Esports': 'GAM',
  'Vikings Esports': 'VKE',
  'Team Whales': 'TW',
  'CERBERUS Esports': 'CES',
  'Team Secret': 'TS',
  'MGN Blue Esports': 'MBE',
  'Team Flash': 'TF',

  // LPL
  'Bilibili Gaming': 'BLG',
  'Top Esports': 'TES',
  'JD Gaming': 'JDG',
  'LNG Esports': 'LNG',
  'Weibo Gaming': 'WBG',
  'Ninjas in Pyjamas': 'NIP',
  'FunPlus Phoenix': 'FPX',
  'EDward Gaming': 'EDG',
  'Royal Never Give Up': 'RNG',
  'LGD Gaming': 'LGD',
  'Rare Atom': 'RA',
  'Anyone\'s Legend': 'AL',
  'Invictus Gaming': 'IG',
  'Team WE': 'WE',
  'ThunderTalk Gaming': 'TT',
  'Ultra Prime': 'UP',
  
  // LEC / LCS
  'G2 Esports': 'G2',
  'Fnatic': 'FNC',
  'Team Liquid': 'TL',
  'Cloud9': 'C9',
  'FlyQuest': 'FLY',
  '100 Thieves': '100T',
  'Team Heretics': 'TH',
  'Karmine Corp': 'KC',
  'Team Vitality': 'VIT',
  'MAD Lions KOI': 'MAD',
  'Rogue': 'RGE',
  'GiantX': 'GX',
  'Team BDS': 'BDS',
  'SK Gaming': 'SK',
  
  // VALORANT
  'Sentinels': 'SEN',
  'Paper Rex': 'PRX',
  'DRX': 'DRX',
  'Team Heretics': 'TH',
  'Gen.G': 'GEN',
  'T1': 'T1',
  'ZETA DIVISION': 'ZETA',
  'DetonatioN FocusMe': 'DFM',
  'Rex Regum Qeon': 'RRQ',
  'Global Esports': 'GE',
  'Talon Esports': 'TLN',
  'Team Secret': 'TS',
  'Bleed Esports': 'BLD',
  'EDward Gaming': 'EDG',
  'FunPlus Phoenix': 'FPX',
  'Bilibili Gaming': 'BLG',
  'Wolves Esports': 'WOL',
  'Trace Esports': 'TE',
  'JD Gaming': 'JDG',
  'Titan Esports Club': 'TEC',
  'Tyloo': 'TYL',
  'Nova Esports': 'NOVA',
  'Dragon Ranger Gaming': 'DRG',
  'All Gamers': 'AG',
  'LOUD': 'LOUD',
  'NRG Esports': 'NRG',
  'Evil Geniuses': 'EG',
  'KRÜ Esports': 'KRU',
  'Leviatán': 'LEV',
  'FURIA Esports': 'FUR',
  'MIBR': 'MIBR',
  'Cloud9': 'C9',
  '100 Thieves': '100T',
  'Natus Vincere': 'NAVI',
  
  // FOOTBALL (Premier League, LaLiga, Champions League)
  // Premier League
  'Arsenal FC': 'ARS',
  'Aston Villa FC': 'AVL',
  'Bournemouth AFC': 'BOU',
  'Brentford FC': 'BRE',
  'Brighton & Hove Albion FC': 'BHA',
  'Burnley FC': 'BUR',
  'Chelsea FC': 'CHE',
  'Crystal Palace FC': 'CRY',
  'Everton FC': 'EVE',
  'Fulham FC': 'FUL',
  'Liverpool FC': 'LIV',
  'Luton Town FC': 'LUT',
  'Manchester City FC': 'MCI',
  'Manchester United FC': 'MUN',
  'Newcastle United FC': 'NEW',
  'Nottingham Forest FC': 'NFO',
  'Sheffield United FC': 'SHU',
  'Tottenham Hotspur FC': 'TOT',
  'West Ham United FC': 'WHU',
  'Wolverhampton Wanderers FC': 'WOL',
  
  // LaLiga
  'Deportivo Alavés': 'ALA',
  'UD Almería': 'ALM',
  'Athletic Club': 'ATH',
  'Atlético de Madrid': 'ATM',
  'FC Barcelona': 'BAR',
  'Real Betis Balompié': 'BET',
  'Cádiz CF': 'CAD',
  'RC Celta de Vigo': 'CEL',
  'Getafe CF': 'GET',
  'Girona FC': 'GIR',
  'Granada CF': 'GRA',
  'UD Las Palmas': 'LPA',
  'RCD Mallorca': 'MLL',
  'CA Osasuna': 'OSA',
  'Rayo Vallecano de Madrid': 'RAY',
  'Real Madrid CF': 'RMA',
  'Real Sociedad de Fútbol': 'RSO',
  'Sevilla FC': 'SEV',
  'Valencia CF': 'VAL',
  'Villarreal CF': 'VIL',
  
  // Champions League (Other prominent teams)
  'FC Bayern München': 'BAY',
  'Borussia Dortmund': 'BVB',
  'Bayer 04 Leverkusen': 'B04',
  'RB Leipzig': 'RBL',
  'Paris Saint-Germain FC': 'PSG',
  'FC Internazionale Milano': 'INT',
  'AC Milan': 'ACM',
  'Juventus FC': 'JUV',
  'SSC Napoli': 'NAP',
  'AS Roma': 'ROM',
  'Sporting Clube de Portugal': 'SCP',
  'FC Porto': 'FCP',
  'SL Benfica': 'SLB',
  'PSV': 'PSV',
  'Feyenoord Rotterdam': 'FEY',
}

// Helper to get search-friendly name (Acronym > Shortened > Original)
export const getTeamSearchName = (teamName) => {
  if (!teamName) return ''
  
  // 1. Check exact match in Acronyms
  if (TEAM_ACRONYMS[teamName]) {
    return TEAM_ACRONYMS[teamName]
  }
  
  // 2. Check if name contains key parts of acronym keys (less strict)
  // E.g. "Gen.G" -> matches "Gen.G Esports" -> "GEN"
  const acronymEntries = Object.entries(TEAM_ACRONYMS)
  const foundEntry = acronymEntries.find(([key]) => key.includes(teamName) || teamName.includes(key))
  if (foundEntry) {
    return foundEntry[1]
  }

  // 3. Fallback to standard shortening logic
  return shortenTeamName(teamName).replace(/\s+/g, ' ').trim()
}


// Helper function to clean team names by removing unnecessary words
export const shortenTeamName = (teamName, maxLength = 25) => {
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
  
  // Truncate if too long (default 25 chars)
  if (cleanName.length > maxLength) {
    return cleanName.substring(0, maxLength - 3) + '...'
  }
  
  return cleanName
}

// Helper function to adjust Valorant API timezone (UTC to GMT+7)
export const adjustValorantTimezone = (timestamp) => {
  if (!timestamp) return new Date()
  // If timestamp is in seconds, convert to milliseconds
  const timestampMs = timestamp < 1e12 ? timestamp * 1000 : timestamp
  const date = new Date(timestampMs)
  // Add 7 hours to convert from UTC to Vietnam timezone
  return new Date(date.getTime() + 7 * 60 * 60 * 1000)
}
