// Using native fetch in Node 22

async function testCS2API() {
  try {
    const from = new Date();
    from.setHours(0, 0, 0, 0);
    const to = new Date();
    to.setHours(23, 59, 59, 999);
    
    const fromStr = from.toISOString();
    const toStr = to.toISOString();
    
    const targetUrl = `https://lichxemmoithu.vercel.app/api/cs2?sort=begin_at&range[begin_at]=${fromStr},${toStr}&per_page=50`;
    console.log(`Fetching from: ${targetUrl}\n`);
    
    const response = await fetch(targetUrl, {
      headers: {
        'Accept': 'application/json'
      },
    });

    if (!response.ok) {
      console.error(`Error: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.error(text);
      return;
    }

    const data = await response.json();
    console.log(`Found ${data.length} matches.\n`);

    const matches = data.map(match => {
      const homeTeam = match.opponents?.[0]?.opponent || {};
      const awayTeam = match.opponents?.[1]?.opponent || {};
      
      let leagueName = match.league?.name || 'CS2';
      if (match.tournament?.name && !match.tournament.name.toLowerCase().includes('group')) {
         leagueName = `${leagueName} - ${match.tournament.name}`;
      }

      return {
        id: match.id,
        league: leagueName,
        tier: match.tournament?.tier || match.serie?.tier || 'Unranked',
        name: match.name,
        home: homeTeam.name || 'TBD',
        away: awayTeam.name || 'TBD',
        start: match.begin_at,
        status: match.status
      };
    });

    require('fs').writeFileSync('cs2.json', JSON.stringify(matches, null, 2));
    console.log('Saved to cs2.json');
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

testCS2API();
