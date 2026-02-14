export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  const { url } = req
  // Strip /api/valorant from the path
  const targetPath = url.replace(/^\/api\/valorant/, '')
  const targetUrl = `https://vlrggapi.vercel.app${targetPath}`

  try {
    const response = await fetch(targetUrl)
    const data = await response.json()
    res.status(response.status).json(data)
  } catch (error) {
    res.status(500).json({ error: 'Error fetching data' })
  }
}
