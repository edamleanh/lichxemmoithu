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
    
    // Handle /competitions endpoint
    if (urlPath === '/competitions') {
      // GET /competitions - return available competitions
      const competitions = [
        { id: 'PL', name: 'Premier League', area: { name: 'England' } },
        { id: 'PD', name: 'LaLiga', area: { name: 'Spain' } },
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
      
      // List of API keys to try in order
      const apiKeys = [
        process.env.VITE_FOOTBALL_API_KEY,
        process.env.FOOTBALL_API_KEY,
        '354c9341dac74c788f59795973d8099d',
        '802efe2831cd4f00b45f718885ed2658',
      ].filter(Boolean); // Remove null/undefined keys
      
      if (apiKeys.length === 0) {
        res.status(500).json({ error: 'Football API keys not configured' });
        return;
      }

      let apiUrl = `https://api.football-data.org/v4/competitions/${competition}/matches`;
      if (dateFrom && dateTo) {
        apiUrl += `?dateFrom=${dateFrom}&dateTo=${dateTo}`;
      }

      // Try each API key until one works
      let lastError = null;
      let successfulData = null;
      
      for (let i = 0; i < apiKeys.length; i++) {
        const currentApiKey = apiKeys[i];
        
        try {
          const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'X-Auth-Token': currentApiKey,
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });

          if (response.ok) {
            const data = await response.json();
            successfulData = data;
            break; // Success, exit the loop
          } else {
            const errorText = await response.text();
            
            // If it's a rate limit (429) or auth error (401/403), try next key
            if (response.status === 429 || response.status === 401 || response.status === 403) {
              lastError = new Error(`Key ${i + 1} failed: ${response.status} - ${errorText}`);
              continue; // Try next key
            } else {
              // For other errors, throw immediately
              throw new Error(`Football API responded with status: ${response.status} - ${errorText}`);
            }
          }
        } catch (error) {
          lastError = error;
          
          // If it's a network error, try next key
          if (error.name === 'TypeError' || error.name === 'AbortError') {
            continue;
          } else {
            // For other errors, continue to try next key
            continue;
          }
        }
      }
      
      // If no key worked, throw the last error
      if (!successfulData) {
        throw lastError || new Error('All API keys failed');
      }
      
      const data = successfulData;
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

    // Get API keys list for legacy support
    const apiKeys = [
      process.env.VITE_FOOTBALL_API_KEY,
      process.env.FOOTBALL_API_KEY,
      '354c9341dac74c788f59795973d8099d',
      '802efe2831cd4f00b45f718885ed2658',
    ].filter(Boolean); // Remove null/undefined keys
    
    if (apiKeys.length === 0) {
      res.status(500).json({ error: 'Football API keys not configured' });
      return;
    }

    const apiUrl = `https://api.football-data.org/v4/competitions/${competition}/matches${
      dateFrom && dateTo ? `?dateFrom=${dateFrom}&dateTo=${dateTo}` : ''
    }`;

    // Try each API key until one works (Legacy endpoint)
    let lastError = null;
    let successfulData = null;
    
    for (let i = 0; i < apiKeys.length; i++) {
      const currentApiKey = apiKeys[i];
      
      try {
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'X-Auth-Token': currentApiKey,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        if (response.ok) {
          const data = await response.json();
          successfulData = data;
          break;
        } else {
          if (response.status === 429 || response.status === 401 || response.status === 403) {
            lastError = new Error(`Legacy key ${i + 1} failed: ${response.status}`);
            continue;
          } else {
            throw new Error(`Football API responded with status: ${response.status}`);
          }
        }
      } catch (error) {
        lastError = error;
        continue;
      }
    }
    
    if (!successfulData) {
      throw lastError || new Error('All legacy API keys failed');
    }
    
    const data = successfulData;
    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch Football data',
      message: error.message 
    });
  }
}