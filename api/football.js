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
    // Parse URL path - remove query parameters first
    const urlPath = req.url.split('?')[0].replace('/api/football', '');
    console.log('Football API - URL Path:', urlPath);
    console.log('Football API - Full URL:', req.url);
    
    // Handle /competitions endpoint
    if (urlPath === '/competitions') {
      // GET /competitions - return available competitions
      const competitions = [
        { id: 'PL', name: 'Premier League', area: { name: 'England' } },
        { id: 'PD', name: 'Primera División', area: { name: 'Spain' } },
        { id: 'CL', name: 'UEFA Champions League', area: { name: 'Europe' } }
      ];
      res.status(200).json({ competitions });
      return;
    }
    
    // Handle /competitions/{id}/matches endpoint
    const competitionMatch = urlPath.match(/^\/competitions\/([^\/]+)\/matches$/);
    if (competitionMatch) {
      const competition = competitionMatch[1];
      const { dateFrom, dateTo } = req.query;
      
      console.log('Football API - Competition:', competition);
      console.log('Football API - Date range:', { dateFrom, dateTo });
      
      // Get API key from environment variables
      const apiKey = process.env.VITE_FOOTBALL_API_KEY || process.env.FOOTBALL_API_KEY;
      
      if (!apiKey) {
        console.error('Football API - No API key found');
        res.status(500).json({ error: 'Football API key not configured' });
        return;
      }

      let apiUrl = `https://api.football-data.org/v4/competitions/${competition}/matches`;
      if (dateFrom && dateTo) {
        apiUrl += `?dateFrom=${dateFrom}&dateTo=${dateTo}`;
      }
      
      console.log('Football API - Calling:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'X-Auth-Token': apiKey,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      console.log('Football API - Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Football API - Error response:', errorText);
        throw new Error(`Football API responded with status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Football API - Success, matches found:', data.matches?.length || 0);
      res.status(200).json(data);
      return;
    }
    
    // Legacy support - direct competition parameter
    const { competition, dateFrom, dateTo } = req.query;
    
    if (!competition) {
      res.status(400).json({ 
        error: 'Invalid endpoint. Use /competitions or /competitions/{id}/matches',
        receivedPath: urlPath,
        supportedEndpoints: [
          '/competitions',
          '/competitions/PL/matches',
          '/competitions/PD/matches',
          '/competitions/CL/matches'
        ]
      });
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