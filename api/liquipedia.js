// Vercel Serverless Function for Liquipedia MediaWiki API
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
    const { game, type = 'matches' } = req.query;
    
    if (!game) {
      res.status(400).json({ error: 'Game parameter is required' });
      return;
    }

    // Map game names to Liquipedia wiki endpoints
    const gameWikis = {
      'valorant': 'valorant',
      'lol': 'leagueoflegends',
      'pubg': 'pubg',
      'dota2': 'dota2',
      'csgo': 'counterstrike'
    };

    const wikiGame = gameWikis[game.toLowerCase()];
    if (!wikiGame) {
      res.status(400).json({ error: 'Unsupported game' });
      return;
    }

    // Base Liquipedia API URL
    const baseUrl = `https://liquipedia.net/${wikiGame}/api.php`;
    
    let apiUrl;
    let params;

    if (type === 'matches') {
      // Query for recent and upcoming matches
      params = new URLSearchParams({
        action: 'parse',
        page: 'Liquipedia:Upcoming_and_ongoing_matches',
        format: 'json',
        prop: 'wikitext|categories',
        origin: '*'
      });
    } else if (type === 'tournaments') {
      // Query for tournament information
      params = new URLSearchParams({
        action: 'query',
        list: 'categorymembers',
        cmtitle: 'Category:Tournaments',
        cmlimit: 50,
        format: 'json',
        origin: '*'
      });
    } else {
      res.status(400).json({ error: 'Invalid type parameter. Use "matches" or "tournaments"' });
      return;
    }

    apiUrl = `${baseUrl}?${params.toString()}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'EsportsCalendar/1.0 (https://lichxemmoithu.vercel.app) Contact/admin@example.com',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Liquipedia API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the data based on the type
    let transformedData = data;
    
    if (type === 'matches' && data.parse) {
      // Parse wikitext to extract match information
      transformedData = parseMatchesFromWikitext(data.parse.wikitext['*'], game);
    }

    res.status(200).json({
      success: true,
      game: game,
      type: type,
      data: transformedData,
      source: 'liquipedia'
    });

  } catch (error) {
    console.error('Liquipedia API Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Liquipedia data',
      message: error.message,
      source: 'liquipedia'
    });
  }
}

// Helper function to parse matches from wikitext
function parseMatchesFromWikitext(wikitext, game) {
  const matches = [];
  
  try {
    // This is a simplified parser - Liquipedia uses complex wikitext templates
    // In a real implementation, you'd need a proper MediaWiki wikitext parser
    
    // Look for match templates in the wikitext
    const matchRegex = /\{\{MatchList\|[^}]+\}\}/g;
    const foundMatches = wikitext.match(matchRegex) || [];
    
    foundMatches.forEach((matchText, index) => {
      // Extract basic information from the match template
      const teamRegex = /team1=([^|]+)/;
      const team2Regex = /team2=([^|]+)/;
      const dateRegex = /date=([^|]+)/;
      const timeRegex = /time=([^|]+)/;
      
      const team1Match = matchText.match(teamRegex);
      const team2Match = matchText.match(team2Regex);
      const dateMatch = matchText.match(dateRegex);
      const timeMatch = matchText.match(timeRegex);
      
      if (team1Match && team2Match) {
        matches.push({
          id: `liquipedia-${game}-${index}`,
          team1: team1Match[1].trim(),
          team2: team2Match[1].trim(),
          date: dateMatch ? dateMatch[1].trim() : null,
          time: timeMatch ? timeMatch[1].trim() : null,
          game: game,
          source: 'liquipedia'
        });
      }
    });
    
    // If no matches found in templates, try alternative parsing
    if (matches.length === 0) {
      // Return sample structure for now
      return [{
        id: `liquipedia-${game}-sample`,
        team1: 'Team A',
        team2: 'Team B',
        date: new Date().toISOString().split('T')[0],
        time: '20:00',
        game: game,
        source: 'liquipedia',
        note: 'Sample data - wikitext parsing needs refinement'
      }];
    }
    
  } catch (parseError) {
    console.error('Error parsing wikitext:', parseError);
    return [{
      id: `liquipedia-${game}-error`,
      team1: 'Parse Error',
      team2: 'Check Logs',
      date: new Date().toISOString().split('T')[0],
      time: '00:00',
      game: game,
      source: 'liquipedia',
      error: parseError.message
    }];
  }
  
  return matches;
}