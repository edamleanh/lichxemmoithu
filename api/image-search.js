export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { teamName, sport } = req.query

  if (!teamName) {
    return res.status(400).json({ error: 'Team name is required' })
  }

  try {
    // Google Custom Search API configuration - sử dụng trực tiếp API keys
    const API_KEY = 'AIzaSyC4ktJ7bCFJp30sFmHIggs4vgvXklny294'
    const SEARCH_ENGINE_ID = '514a4c5a5eb164ff0'

    // Build search query based on sport and team name
    let searchQuery = `${teamName} logo`
    
    // Add sport-specific terms to improve search accuracy
    switch (sport?.toLowerCase()) {
      case 'valorant':
        searchQuery += ' valorant esports team'
        break
      case 'lol':
        searchQuery += ' league of legends esports team'
        break
      case 'football':
        searchQuery += ' football club soccer'
        break
      case 'pubg':
        searchQuery += ' pubg esports team'
        break
      default:
        searchQuery += ' esports team'
    }

    // Google Custom Search API parameters
    const params = new URLSearchParams({
      key: API_KEY,
      cx: SEARCH_ENGINE_ID,
      q: searchQuery,
      searchType: 'image',
      num: '3', // Get top 3 results
      imgType: 'photo',
      imgSize: 'medium',
      safe: 'active',
      fileType: 'png,jpg,jpeg', // Prefer common image formats
    })

    const searchUrl = `https://www.googleapis.com/customsearch/v1?${params}`
    
    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      timeout: 10000
    })

    if (!response.ok) {
      throw new Error(`Google Search API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('Google Search API response:', data)

    // Extract image results
    const images = []
    if (data.items && Array.isArray(data.items)) {
      for (const item of data.items) {
        if (item.link && item.image) {
          images.push({
            url: item.link,
            title: item.title,
            displayLink: item.displayLink,
            width: item.image.width,
            height: item.image.height,
            thumbnailUrl: item.image.thumbnailLink,
            thumbnailWidth: item.image.thumbnailWidth,
            thumbnailHeight: item.image.thumbnailHeight
          })
        }
      }
    }

    // Return the results
    return res.status(200).json({
      teamName,
      sport,
      searchQuery,
      images,
      totalResults: data.searchInformation?.totalResults || 0
    })

  } catch (error) {
    console.error('Google Search API error:', error)
    
    // Return fallback response
    return res.status(500).json({
      error: 'Failed to search for team logo',
      teamName,
      sport,
      images: []
    })
  }
}