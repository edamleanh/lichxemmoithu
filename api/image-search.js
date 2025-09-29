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
    // Static logo mappings for popular teams as fallback
    const staticLogoMappings = {
      // Valorant teams
      'valorant': {
        'fnatic': 'https://owcdn.net/img/5f2b8a6b0c7f1.png',
        'sentinels': 'https://owcdn.net/img/6061ff0b3d3d8.png',
        'team liquid': 'https://owcdn.net/img/5f25b9b6a23b1.png',
        'nrg': 'https://owcdn.net/img/63f8c4e8e9d54.png',
        'drx': 'https://owcdn.net/img/606320a1b5c5e.png',
        'paper rex': 'https://owcdn.net/img/61161b3d86c8f.png',
        'prx': 'https://owcdn.net/img/61161b3d86c8f.png', // Same as Paper Rex
        'team heretics': 'https://owcdn.net/img/637b755224c12.png',
        'heretics': 'https://owcdn.net/img/637b755224c12.png',
        'mibr': 'https://owcdn.net/img/64f5a8b7dd5e2.png',
        'loud': 'https://owcdn.net/img/6348734bbc01e.png',
        'cloud9': 'https://owcdn.net/img/5f25c7b1cdeb3.png',
        'c9': 'https://owcdn.net/img/5f25c7b1cdeb3.png',
        '100 thieves': 'https://owcdn.net/img/5f25c58dd7e35.png',
        '100t': 'https://owcdn.net/img/5f25c58dd7e35.png',
        'giantx': 'https://owcdn.net/img/657b2f3fcd199.png',
        'giants': 'https://owcdn.net/img/657b2f3fcd199.png',
        'vitality': 'https://owcdn.net/img/5f25b7e5b9c28.png',
        'g2 esports': 'https://owcdn.net/img/5f25c95b0891e.png',
        'g2': 'https://owcdn.net/img/5f25c95b0891e.png',
        'kru': 'https://owcdn.net/img/6064221cda3f5.png',
        'furia': 'https://owcdn.net/img/60640895c2d3a.png',
        'leviatan': 'https://owcdn.net/img/624706b23d768.png',
        'lev': 'https://owcdn.net/img/624706b23d768.png',
        'edg': 'https://owcdn.net/img/64f5a98c8d7e1.png',
        'edward gaming': 'https://owcdn.net/img/64f5a98c8d7e1.png',
        'navi': 'https://owcdn.net/img/5f25c8cb5b7e2.png',
        'natus vincere': 'https://owcdn.net/img/5f25c8cb5b7e2.png',
        'faze': 'https://owcdn.net/img/5f25c8cb5b7e3.png',
        'faze clan': 'https://owcdn.net/img/5f25c8cb5b7e3.png',
      },
      // LoL teams
      'lol': {
        't1': 'https://am-a.akamaihd.net/image?resize=150:&f=http%3A%2F%2Fstatic.lolesports.com%2Fteams%2F1631819404087_T1-01-FullonDark.png',
        'gen.g': 'https://am-a.akamaihd.net/image?resize=150:&f=http%3A%2F%2Fstatic.lolesports.com%2Fteams%2F1641208314571_GenG-FullLogo.png',
        'geng': 'https://am-a.akamaihd.net/image?resize=150:&f=http%3A%2F%2Fstatic.lolesports.com%2Fteams%2F1641208314571_GenG-FullLogo.png',
        'drx': 'https://am-a.akamaihd.net/image?resize=150:&f=http%3A%2F%2Fstatic.lolesports.com%2Fteams%2F1641208435495_DRX_FullLogo_2022.png',
        'kt rolster': 'https://am-a.akamaihd.net/image?resize=150:&f=http%3A%2F%2Fstatic.lolesports.com%2Fteams%2F1641208678449_ktRolster-FullLogo.png',
        'kt': 'https://am-a.akamaihd.net/image?resize=150:&f=http%3A%2F%2Fstatic.lolesports.com%2Fteams%2F1641208678449_ktRolster-FullLogo.png',
        'damwon kia': 'https://am-a.akamaihd.net/image?resize=150:&f=http%3A%2F%2Fstatic.lolesports.com%2Fteams%2F1641208542717_DWG_KIA_FullLogo.png',
        'dk': 'https://am-a.akamaihd.net/image?resize=150:&f=http%3A%2F%2Fstatic.lolesports.com%2Fteams%2F1641208542717_DWG_KIA_FullLogo.png',
        'jd gaming': 'https://am-a.akamaihd.net/image?resize=150:&f=http%3A%2F%2Fstatic.lolesports.com%2Fteams%2F1641208505530_JDGaming-FullLogo.png',
        'jdg': 'https://am-a.akamaihd.net/image?resize=150:&f=http%3A%2F%2Fstatic.lolesports.com%2Fteams%2F1641208505530_JDGaming-FullLogo.png',
        'fnatic': 'https://am-a.akamaihd.net/image?resize=150:&f=http%3A%2F%2Fstatic.lolesports.com%2Fteams%2F1641208400367_FNC-FullLogo.png',
        'g2 esports': 'https://am-a.akamaihd.net/image?resize=150:&f=http%3A%2F%2Fstatic.lolesports.com%2Fteams%2F1641208416199_G2-FullLogo.png',
        'g2': 'https://am-a.akamaihd.net/image?resize=150:&f=http%3A%2F%2Fstatic.lolesports.com%2Fteams%2F1641208416199_G2-FullLogo.png',
        'mad lions': 'https://am-a.akamaihd.net/image?resize=150:&f=http%3A%2F%2Fstatic.lolesports.com%2Fteams%2F1641208468397_MAD-FullLogo.png',
        'mad': 'https://am-a.akamaihd.net/image?resize=150:&f=http%3A%2F%2Fstatic.lolesports.com%2Fteams%2F1641208468397_MAD-FullLogo.png',
      },
      // Football teams (Premier League & La Liga)
      'football': {
        'arsenal': 'https://logos-world.net/wp-content/uploads/2020/06/Arsenal-Logo.png',
        'manchester united': 'https://logos-world.net/wp-content/uploads/2020/06/Manchester-United-Logo.png',
        'chelsea': 'https://logos-world.net/wp-content/uploads/2020/06/Chelsea-Logo.png',
        'liverpool': 'https://logos-world.net/wp-content/uploads/2020/06/Liverpool-Logo.png',
        'manchester city': 'https://logos-world.net/wp-content/uploads/2020/06/Manchester-City-Logo.png',
        'tottenham': 'https://logos-world.net/wp-content/uploads/2020/06/Tottenham-Logo.png',
        'real madrid': 'https://logos-world.net/wp-content/uploads/2020/06/Real-Madrid-Logo.png',
        'barcelona': 'https://logos-world.net/wp-content/uploads/2020/06/FC-Barcelona-Logo.png',
        'atletico madrid': 'https://logos-world.net/wp-content/uploads/2020/06/Atletico-Madrid-Logo.png',
        'sevilla': 'https://logos-world.net/wp-content/uploads/2020/06/Sevilla-Logo.png',
      },
      // PUBG teams
      'pubg': {
        'gen.g': 'https://owcdn.net/img/5f25c8cb5b7e4.png',
        'geng': 'https://owcdn.net/img/5f25c8cb5b7e4.png',
        'damwon kia': 'https://owcdn.net/img/5f25c8cb5b7e5.png',
        'dk': 'https://owcdn.net/img/5f25c8cb5b7e5.png',
        'soniqs': 'https://owcdn.net/img/5f25c8cb5b7e6.png',
        'sq': 'https://owcdn.net/img/5f25c8cb5b7e6.png',
        'faze': 'https://owcdn.net/img/5f25c8cb5b7e3.png',
        'faze clan': 'https://owcdn.net/img/5f25c8cb5b7e3.png',
      }
    }

    // Google Custom Search API configuration
    const API_KEY = process.env.GOOGLE_SEARCH_API_KEY
    const SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID

    // Check static mappings first with normalized team name
    const normalizedTeamName = teamName.toLowerCase()
      .trim()
      .replace(/\s*(gaming|esports|e-sports|team|club|fc|united)$/i, '')
      .replace(/\s+/g, ' ')
      .trim()
    
    const sportMappings = staticLogoMappings[sport?.toLowerCase()] || {}
    
    // Try exact match first
    let staticLogo = sportMappings[normalizedTeamName]
    
    // If no exact match, try variations
    if (!staticLogo) {
      // Try without common prefixes/suffixes
      const variations = [
        teamName.toLowerCase().trim(),
        normalizedTeamName,
        teamName.toLowerCase().replace('team ', '').trim(),
        teamName.toLowerCase().replace(' esports', '').trim(),
        teamName.toLowerCase().replace(' gaming', '').trim(),
      ]
      
      for (const variation of variations) {
        if (sportMappings[variation]) {
          staticLogo = sportMappings[variation]
          break
        }
      }
    }

    if (staticLogo) {
      console.log(`📍 Using static logo mapping for "${teamName}" (${sport}):`, staticLogo)
      return res.status(200).json({
        teamName,
        sport,
        searchQuery: `${teamName} logo`,
        images: [{
          url: staticLogo,
          title: `${teamName} Logo`,
          displayLink: 'static-mapping',
          width: 150,
          height: 150,
          thumbnailUrl: staticLogo,
          thumbnailWidth: 150,
          thumbnailHeight: 150
        }],
        totalResults: 1,
        source: 'static-mapping'
      })
    }

    // If Google API credentials are not configured, return empty result
    if (!API_KEY || !SEARCH_ENGINE_ID) {
      console.log(`⚠️ Google Search API not configured. No logo found for: ${teamName}`)
      return res.status(200).json({
        teamName,
        sport,
        searchQuery: `${teamName} logo`,
        images: [],
        totalResults: 0,
        source: 'no-api-config'
      })
    }

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
      key: 'AIzaSyC4ktJ7bCFJp30sFmHIggs4vgvXklny294',
      cx: '166bd52b2a2404003',
      q: searchQuery,
      searchType: 'image',
      num: '3', // Get top 3 results
      imgType: 'photo',
      imgSize: 'medium',
      safe: 'active',
      fileType: 'png,jpg,jpeg', // Prefer common image formats
      rights: 'cc_publicdomain,cc_attribute,cc_sharealike,cc_noncommercial,cc_nonderived' // Prefer images with usage rights
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
      totalResults: data.searchInformation?.totalResults || 0,
      source: 'google-api'
    })

  } catch (error) {
    console.error('Google Search API error:', error)
    
    // Return graceful fallback response (200 status to avoid app errors)
    return res.status(200).json({
      teamName,
      sport,
      searchQuery: `${teamName} logo`,
      images: [],
      totalResults: 0,
      source: 'api-error',
      error: 'Failed to search for team logo'
    })
  }
}