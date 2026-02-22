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
  // Strip /api/football from the path
  const targetPath = url.replace(/^\/api\/football/, '')
  const targetUrl = `https://api.football-data.org/v4${targetPath}`

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'X-Auth-Token': process.env.VITE_FOOTBALL_API_KEY || '354c9341dac74c788f59795973d8099d',
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    res.status(response.status).json(data)
  } catch (error) {
    res.status(500).json({ error: 'Error fetching data' })
  }
}
