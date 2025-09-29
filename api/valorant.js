// Vercel Serverless Function for Valorant API
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { q } = req.query;
    
    let apiUrl;
    if (q === 'live_score') {
      apiUrl = 'https://vlrggapi.vercel.app/match?q=live_score';
    } else if (q === 'upcoming') {
      apiUrl = 'https://vlrggapi.vercel.app/match?q=upcoming';
    } else if (q === 'results') {
      apiUrl = 'https://vlrggapi.vercel.app/match?q=results';
    } else {
      res.status(400).json({ error: 'Invalid query parameter' });
      return;
    }

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    console.error('Valorant API Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Valorant data',
      message: error.message 
    });
  }
}