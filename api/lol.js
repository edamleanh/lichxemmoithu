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
    
    // Try multiple LoL API endpoints with timeout
    const apiUrls = [
      'https://esports-api.lolesports.com/persisted/gw/getSchedule?hl=en-US',
      'https://feed.lolesports.com/livestats/v1/schedule?hl=en-US',
      // Fallback to a simpler endpoint
      'https://esports-api.lolesports.com/persisted/gw/getLive?hl=en-US'
    ];

    let lastError;
    
    for (let i = 0; i < apiUrls.length; i++) {
      const apiUrl = apiUrls[i];
      console.log(`LoL API - Trying endpoint ${i + 1}:`, apiUrl);
      
      try {
        // Create timeout controller
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Referer': 'https://lolesports.com/',
            'Origin': 'https://lolesports.com'
          }
        });

        clearTimeout(timeoutId);
        console.log(`LoL API - Response status ${i + 1}:`, response.status);

        if (!response.ok) {
          throw new Error(`LoL API responded with status: ${response.status}`);
        }

        const data = await response.json();
        console.log('LoL API - Success, data received');
        res.status(200).json(data);
        return;
      } catch (error) {
        console.log(`LoL API - Endpoint ${i + 1} failed:`, error.message);
        lastError = error;
        continue;
      }
    }
    
    // If all APIs fail, throw the last error
    console.error('LoL API - All endpoints failed');
    throw lastError;

  } catch (error) {
    console.error('LoL API Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch LoL data',
      message: error.message 
    });
  }
}