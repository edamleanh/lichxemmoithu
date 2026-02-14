// Utility functions for formatting dates and handling team names

export const toDate = (v) => (v instanceof Date ? v : new Date(v))

export const fmtTime = (date, opts = {}) => {
  const d = toDate(date)
  if (isNaN(d.getTime())) return 'Invalid Date'
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
  }).format(d)
  
  if (isToday) return `Hôm nay, ${timeStr}`
  if (isTomorrow) return `Ngày mai, ${timeStr}`
  if (isYesterday) return `Hôm qua, ${timeStr}`
  
  // Default format for other days
  // If opts contains day/month overrides, use them, otherwise default to day/month
  const dateOpts = { day: '2-digit', month: '2-digit', ...opts }
  // Remove hour/minute from date part if they are already in timeStr (but here we want full string)
  
  // Actually, we want "DD/MM, HH:mm" for other days
  const dateStr = new Intl.DateTimeFormat('vi-VN', { 
    day: '2-digit', month: '2-digit' 
  }).format(d)
  
  return `${dateStr}, ${timeStr}`
}

export const fmtDay = (d) => {
  const date = toDate(d)
  if (isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('vi-VN', { 
    weekday: 'long', day: '2-digit', month: 'long' 
  }).format(date)
}

export const withinRange = (d, from, to) => {
  const t = toDate(d).getTime()
  return (!from || t >= toDate(from).getTime()) && (!to || t <= toDate(to).getTime())
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
