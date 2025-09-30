// Vercel Serverless Function for LoL API
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
    console.log('LoL API - Starting request');
    
    // Try the primary LoL API endpoint first with shorter timeout
    const primaryApiUrl = 'https://esports-api.lolesports.com/persisted/gw/getLive?hl=en-US';
    
    try {
      console.log('LoL API - Trying primary endpoint:', primaryApiUrl);
      
      // Create timeout controller with shorter timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(primaryApiUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
          'Referer': 'https://lolesports.com/',
          'Origin': 'https://lolesports.com',
          'x-api-key': '0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z'
        }
      });

      clearTimeout(timeoutId);
      console.log('LoL API - Primary endpoint response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('LoL API - Success, data received from primary endpoint');
        console.log('LoL API - Data structure:', JSON.stringify(data, null, 2));
        res.status(200).json(data);
        return;
      } else {
        // Log chi tiết lỗi khi response không thành công
        const errorText = await response.text();
        console.error('LoL API - HTTP Error Details:');
        console.error('Status Code:', response.status);
        console.error('Status Text:', response.statusText);
        console.error('Response Headers:', Object.fromEntries(response.headers.entries()));
        console.error('Error Response Body:', errorText);
        
        // Throw error với chi tiết để fallback xử lý
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }
    } catch (error) {
      console.error('LoL API - Primary endpoint failed with detailed error:');
      console.error('Error Type:', error.name);
      console.error('Error Message:', error.message);
      console.error('Error Stack:', error.stack);
      
      if (error.name === 'AbortError') {
        console.error('LoL API - Request timed out after 5 seconds');
      } else if (error.name === 'TypeError') {
        console.error('LoL API - Network error or invalid URL');
      }
    }
    
    // If primary API fails, return realistic sample data with proper structure
    console.log('LoL API - Primary API failed, using sample data fallback');
    console.warn('LoL API - WARNING: Returning sample data due to API failure');
    
    const sampleData = {
      _metadata: {
        isUsingFallbackData: true,
        fallbackReason: 'Primary API endpoint failed',
        timestamp: new Date().toISOString(),
        note: 'This is sample data - not real live data'
      },
      data: {
        schedule: {
          events: [
            {
              match: {
                id: 'lol-sample-live',
                strategy: { type: 'Bo5', count: 5 },
                teams: [
                  {
                    name: 'T1',
                    image: 'https://static.lolesports.com/teams/1641205340222_t1-2019-worlds.png',
                    result: { gameWins: 1 }
                  },
                  {
                    name: 'Gen.G',
                    image: 'https://static.lolesports.com/teams/GenG-FullonDark.png',
                    result: { gameWins: 0 }
                  }
                ],
                games: [
                  { number: 2, state: 'inProgress' }
                ]
              },
              league: {
                name: 'LCK',
                region: 'Korea'
              },
              startTime: new Date().toISOString(),
              state: 'inProgress',
              blockName: 'Spring Playoffs',
              streams: [
                { parameter: 'https://twitch.tv/lck' }
              ]
            },
            {
              match: {
                id: 'lol-sample-finished',
                strategy: { type: 'Bo5', count: 5 },
                teams: [
                  {
                    name: 'DRX',
                    image: 'https://static.lolesports.com/teams/1641205340890_DRX_FullonDark.png',
                    result: { gameWins: 3 }
                  },
                  {
                    name: 'KT Rolster',
                    image: 'https://static.lolesports.com/teams/1641205341281_KT_FullonDark.png',
                    result: { gameWins: 1 }
                  }
                ]
              },
              league: {
                name: 'LCK',
                region: 'Korea'
              },
              startTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
              state: 'completed',
              blockName: 'Spring Playoffs',
              streams: [
                { parameter: 'https://twitch.tv/lck' }
              ]
            },
            {
              match: {
                id: 'lol-sample-upcoming',
                strategy: { type: 'Bo3', count: 3 },
                teams: [
                  {
                    name: 'JDG',
                    image: 'https://static.lolesports.com/teams/JDG_FullonDark.png'
                  },
                  {
                    name: 'BLG',
                    image: 'https://static.lolesports.com/teams/BLG_FullonDark.png'
                  }
                ]
              },
              league: {
                name: 'LPL',
                region: 'China'
              },
              startTime: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
              state: 'unstarted',
              blockName: 'Regular Season',
              streams: [
                { parameter: 'https://twitch.tv/lpl' }
              ]
            }
          ]
        }
      }
    };
    
    console.log('LoL API - Returning sample data with', sampleData.data.schedule.events.length, 'sample matches');
    console.log('LoL API - Sample data structure:', JSON.stringify(sampleData._metadata, null, 2));
    res.status(200).json(sampleData);

  } catch (error) {
    console.error('LoL API - Critical Error:');
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    console.error('Request URL:', req.url);
    console.error('Request Method:', req.method);
    console.error('Request Headers:', req.headers);
    
    // Xác định loại lỗi và mã lỗi tương ứng
    let errorCode = 'UNKNOWN_ERROR';
    let statusCode = 500;
    
    if (error.name === 'AbortError') {
      errorCode = 'TIMEOUT_ERROR';
      statusCode = 408;
    } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
      errorCode = 'NETWORK_ERROR';
      statusCode = 503;
    } else if (error.message.includes('HTTP 401')) {
      errorCode = 'UNAUTHORIZED';
      statusCode = 401;
    } else if (error.message.includes('HTTP 403')) {
      errorCode = 'FORBIDDEN';
      statusCode = 403;
    } else if (error.message.includes('HTTP 404')) {
      errorCode = 'NOT_FOUND';
      statusCode = 404;
    } else if (error.message.includes('HTTP 429')) {
      errorCode = 'RATE_LIMITED';
      statusCode = 429;
    } else if (error.message.includes('HTTP 5')) {
      errorCode = 'SERVER_ERROR';
      statusCode = 502;
    }
    
    const errorResponse = {
      error: 'Failed to fetch LoL data',
      errorCode: errorCode,
      statusCode: statusCode,
      message: error.message,
      timestamp: new Date().toISOString(),
      endpoint: 'LoL API',
      details: {
        errorType: error.name,
        originalMessage: error.message,
        isUsingFallbackData: false
      }
    };
    
    console.error('LoL API - Returning error response:', JSON.stringify(errorResponse, null, 2));
    res.status(statusCode).json(errorResponse);
  }
}