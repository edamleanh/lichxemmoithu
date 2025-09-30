// Vercel Serverless Function for Football API
export default async function handler(req, res) {
  // Add initial log to track when API is called
  console.log('🏈 Football API - Handler called!');
  console.log('🏈 Football API - Request method:', req.method);
  console.log('🏈 Football API - Request URL:', req.url);
  console.log('🏈 Football API - Request headers:', JSON.stringify(req.headers, null, 2));
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Auth-Token');

  if (req.method === 'OPTIONS') {
    console.log('🏈 Football API - Handling OPTIONS request');
    res.status(200).end();
    return;
  }

  try {
    console.log('🏈 Football API - Starting main logic');
    
    // Parse URL path - remove query parameters first
    const urlPath = req.url.split('?')[0].replace('/api/football', '');
    console.log('🏈 Football API - URL Path:', urlPath);
    console.log('🏈 Football API - Full URL:', req.url);
    console.log('🏈 Football API - Query params:', req.query);
    
    // Handle /competitions endpoint
    if (urlPath === '/competitions') {
      console.log('🏈 Football API - Handling /competitions endpoint');
      // GET /competitions - return available competitions
      const competitions = [
        { id: 'PL', name: 'Premier League', area: { name: 'England' } },
        { id: 'PD', name: 'LaLiga', area: { name: 'Spain' } },
        { id: 'CL', name: 'UEFA Champions League', area: { name: 'Europe' } }
      ];
      console.log('🏈 Football API - Returning competitions:', competitions);
      res.status(200).json({ competitions });
      return;
    }
    
    // Handle /competitions/{id}/matches endpoint
    const competitionMatch = urlPath.match(/^\/competitions\/([^\/]+)\/matches$/);
    if (competitionMatch) {
      console.log('🏈 Football API - Handling /competitions/{id}/matches endpoint');
      const competition = competitionMatch[1];
      const { dateFrom, dateTo } = req.query;
      
      console.log('🏈 Football API - Competition:', competition);
      console.log('🏈 Football API - Date range:', { dateFrom, dateTo });
      
      // List of API keys to try in order
      const apiKeys = [
        process.env.VITE_FOOTBALL_API_KEY,
        process.env.FOOTBALL_API_KEY,
        '354c9341dac74c788f59795973d8099d',
        '802efe2831cd4f00b45f718885ed2658',
      ].filter(Boolean); // Remove null/undefined keys
      
      if (apiKeys.length === 0) {
        console.error('🏈 Football API - No API keys found');
        res.status(500).json({ error: 'Football API keys not configured' });
        return;
      }
      
      console.log('🏈 Football API - Available keys count:', apiKeys.length);

      let apiUrl = `https://api.football-data.org/v4/competitions/${competition}/matches`;
      if (dateFrom && dateTo) {
        apiUrl += `?dateFrom=${dateFrom}&dateTo=${dateTo}`;
      }
      
      console.log('Football API - Calling:', apiUrl);

      // Try each API key until one works
      let lastError = null;
      let successfulData = null;
      
      for (let i = 0; i < apiKeys.length; i++) {
        const currentApiKey = apiKeys[i];
        console.log(`Football API - Trying key ${i + 1}/${apiKeys.length} (${currentApiKey.substring(0, 8)}...)`);
        
        try {
          const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'X-Auth-Token': currentApiKey,
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });

          console.log(`Football API - Key ${i + 1} response status:`, response.status);

          if (response.ok) {
            const data = await response.json();
            console.log(`Football API - Key ${i + 1} SUCCESS! Matches found:`, data.matches?.length || 0);
            successfulData = data;
            break; // Success, exit the loop
          } else {
            const errorText = await response.text();
            console.warn(`Football API - Key ${i + 1} failed with status ${response.status}:`, errorText);
            
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
          console.error(`Football API - Key ${i + 1} error:`, error.message);
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
        console.error('Football API - All keys failed');
        throw lastError || new Error('All API keys failed');
      }
      
      const data = successfulData;
      console.log('Football API - Success, matches found:', data.matches?.length || 0);
      
      // Log detailed data structure
      console.log('Football API - Full data structure:');
      console.log('===============================');
      console.log('Competition info:', JSON.stringify(data.competition, null, 2));
      console.log('Filters applied:', JSON.stringify(data.filters, null, 2));
      console.log('Total matches:', data.count);
      console.log('===============================');
      
      if (data.matches && data.matches.length > 0) {
        console.log('Sample match data (first match):');
        console.log(JSON.stringify(data.matches[0], null, 2));
        console.log('===============================');
        
        // Log all match basic info
        data.matches.forEach((match, index) => {
          console.log(`Match ${index + 1}:`, {
            id: match.id,
            homeTeam: match.homeTeam?.name,
            awayTeam: match.awayTeam?.name,
            status: match.status,
            utcDate: match.utcDate,
            score: match.score?.fullTime || 'N/A',
            competition: match.competition?.name,
            stage: match.stage
          });
        });
      }
      
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
      // Add more API keys here as needed
      // 'your-second-api-key',
      // 'your-third-api-key',
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
      console.log(`Football API - Legacy: Trying key ${i + 1}/${apiKeys.length}`);
      
      try {
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'X-Auth-Token': currentApiKey,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        console.log('Football API - Legacy endpoint response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log(`Football API - Legacy: Key ${i + 1} SUCCESS!`);
          successfulData = data;
          break;
        } else {
          console.warn(`Football API - Legacy: Key ${i + 1} failed with status ${response.status}`);
          if (response.status === 429 || response.status === 401 || response.status === 403) {
            lastError = new Error(`Legacy key ${i + 1} failed: ${response.status}`);
            continue;
          } else {
            throw new Error(`Football API responded with status: ${response.status}`);
          }
        }
      } catch (error) {
        console.error(`Football API - Legacy: Key ${i + 1} error:`, error.message);
        lastError = error;
        continue;
      }
    }
    
    if (!successfulData) {
      throw lastError || new Error('All legacy API keys failed');
    }
    
    const data = successfulData;
    
    // Log detailed data structure for legacy endpoint
    console.log('Football API - Legacy endpoint data:');
    console.log('====================================');
    console.log('Competition info:', JSON.stringify(data.competition, null, 2));
    console.log('Total matches:', data.count);
    console.log('====================================');
    
    if (data.matches && data.matches.length > 0) {
      console.log('Legacy - Sample match data (first match):');
      console.log(JSON.stringify(data.matches[0], null, 2));
      
      // Log all match basic info
      data.matches.forEach((match, index) => {
        console.log(`Legacy Match ${index + 1}:`, {
          id: match.id,
          homeTeam: match.homeTeam?.name,
          awayTeam: match.awayTeam?.name,
          status: match.status,
          utcDate: match.utcDate,
          score: match.score?.fullTime || 'N/A'
        });
      });
    }
    
    res.status(200).json(data);

  } catch (error) {
    console.error('🏈 Football API - Critical Error occurred!');
    console.error('🏈 Football API Error:', error);
    console.error('🏈 Football API Error Name:', error.name);
    console.error('🏈 Football API Error Message:', error.message);
    console.error('🏈 Football API Error Stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to fetch Football data',
      message: error.message 
    });
  }
}