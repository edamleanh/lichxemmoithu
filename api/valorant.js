// Vercel Serverless Function for Valorant API using Liquipedia
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
    const { tournament = 'VCT_2025' } = req.query;
    
    // Liquipedia API endpoints
    const liquipediaEndpoints = [
      `https://liquipedia.net/valorant/api.php?action=query&format=json&prop=revisions&rvprop=content&titles=${tournament}&origin=*`,
      'https://liquipedia.net/valorant/api.php?action=query&format=json&prop=revisions&rvprop=content&titles=VALORANT_Champions_2025&origin=*',
      'https://liquipedia.net/valorant/api.php?action=query&format=json&prop=revisions&rvprop=content&titles=VCT_Masters&origin=*'
    ];

    let allData = { query: { pages: {} } };
    
    // Try to fetch from multiple Liquipedia endpoints
    for (const apiUrl of liquipediaEndpoints) {
      try {
        console.log('Fetching from Liquipedia:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'EsportsCalendar/1.0 (Contact: admin@example.com)',
            'Accept': 'application/json',
          },
          timeout: 8000
        });

        if (response.ok) {
          const data = await response.json();
          
          // Merge data from multiple endpoints
          if (data.query && data.query.pages) {
            allData.query.pages = { ...allData.query.pages, ...data.query.pages };
          }
        } else {
          console.warn(`Liquipedia API error: ${response.status} for ${apiUrl}`);
        }
      } catch (error) {
        console.warn(`Error fetching from ${apiUrl}:`, error.message);
      }
    }

    // If we have some data, return it
    if (Object.keys(allData.query.pages).length > 0) {
      res.status(200).json(allData);
    } else {
      // Return empty structure if no data found
      res.status(200).json({
        query: {
          pages: {}
        },
        warning: 'No data found from Liquipedia'
      });
    }

  } catch (error) {
    console.error('Valorant Liquipedia API Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Valorant data from Liquipedia',
      message: error.message,
      query: { pages: {} } // Return empty structure for fallback
    });
  }
}