const https = require('https');

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse JSON from ${url}: ${e.message}`));
        }
      });
    }).on('error', reject);
  });
}

async function findTeams() {
  const teams = new Set();
  
  try {
    const cs2 = await fetchJson('https://hltv-api.vercel.app/api/matches');
    cs2.forEach(m => {
       if (m.team1?.name) teams.add(`[CS2] ${m.team1.name}`);
       if (m.team2?.name) teams.add(`[CS2] ${m.team2.name}`);
    });
  } catch(e) { console.error(e.message) }

  try {
     const vlr = await fetchJson('https://vlrggapi.vercel.app/match/matches');
     vlr.data.segments.forEach(m => {
       if (m.team1) teams.add(`[VAL] ${m.team1}`);
       if (m.team2) teams.add(`[VAL] ${m.team2}`);
    });
  } catch(e) { console.error(e.message) }

  console.log([...teams].sort().join('\n'));
}

findTeams();
