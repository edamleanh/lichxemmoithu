export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  const { url } = req
  // Strip /api/cs2 from the path and get the query params
  const targetPath = url.replace(/^\/api\/cs2/, '')
  const targetUrl = `https://api.pandascore.co/csgo/matches${targetPath}`

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env.VITE_PANDASCORE_API_KEY || 'YYuIsgt7LShLjwAKkERoW0HJqLtw0BcsAxVRr2NHHsk6BzcEqZM'}`
      },
    })
    
    // Add logging to monitor the rate limits for the free tier
    // PandaScore returns X-Rate-Limit-Remaining
    
    const data = await response.json()
    res.status(response.status).json(data)
  } catch (error) {
    res.status(500).json({ error: 'Error fetching CS2 data from PandaScore' })
  }
}
