import http from 'http';
import fs from 'fs';

const url = 'http://localhost:5173/api/lol/persisted/gw/getLeagues?hl=en-US';

http.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const leagues = json.data.leagues;
      
      const simplified = leagues.map(l => ({
        id: l.id,
        slug: l.slug,
        name: l.name,
        region: l.region
      }));
      
      fs.writeFileSync('all_leagues.json', JSON.stringify(simplified, null, 2));
      console.log('Dumped all leagues to all_leagues.json');
      
    } catch (e) {
      console.error('Error parsing JSON:', e.message);
    }
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
