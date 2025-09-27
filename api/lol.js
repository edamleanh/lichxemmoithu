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
    // Try multiple LoL API endpoints
    const apiUrls = [
      'https://esports-api.lolesports.com/persisted/gw/getSchedule?hl=en-US',
      'https://feed.lolesports.com/livestats/v1/schedule?hl=en-US'
    ];

    let lastError;
    
    for (const apiUrl of apiUrls) {
      try {
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Referer': 'https://lolesports.com/',
            'Origin': 'https://lolesports.com'
          }
        });

        if (!response.ok) {
          throw new Error(`LoL API responded with status: ${response.status}`);
        }

        const data = await response.json();
        res.status(200).json(data);
        return;
      } catch (error) {
        lastError = error;
        continue;
      }
    }
    
    // If all APIs fail, throw the last error
    throw lastError;

  } catch (error) {
    console.error('LoL API Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch LoL data',
      message: error.message 
    });
  }
}