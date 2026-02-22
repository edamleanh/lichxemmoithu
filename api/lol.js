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
  // Strip /api/lol from the path
  const targetPath = url.replace(/^\/api\/lol/, '')
  const targetUrl = `https://esports-api.lolesports.com${targetPath}`

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'x-api-key': process.env.VITE_LOL_API_KEY || '0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z',
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    res.status(response.status).json(data)
  } catch (error) {
    res.status(500).json({ error: 'Error fetching data' })
  }
}
