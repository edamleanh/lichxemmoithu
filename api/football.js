// Vercel Serverless Function for Football API
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Auth-Token');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { competition, dateFrom, dateTo } = req.query;
    
    if (!competition) {
      res.status(400).json({ error: 'Competition parameter is required' });
      return;
    }

    // Get API key from environment variables
    const apiKey = process.env.VITE_FOOTBALL_API_KEY;
    
    if (!apiKey) {
      res.status(500).json({ error: 'Football API key not configured' });
      return;
    }

    const apiUrl = `https://api.football-data.org/v4/competitions/${competition}/matches${
      dateFrom && dateTo ? `?dateFrom=${dateFrom}&dateTo=${dateTo}` : ''
    }`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-Auth-Token': apiKey,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Football API responded with status: ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    console.error('Football API Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Football data',
      message: error.message 
    });
  }
}