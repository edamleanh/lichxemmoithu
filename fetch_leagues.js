import http from 'http';

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
      console.log('Total leagues found:', leagues.length);
      
      const pacificLeagues = leagues.filter(l => 
        l.name.toLowerCase().includes('pacific') || 
        l.slug.toLowerCase().includes('lcp') ||
        l.slug.toLowerCase().includes('pcs')
      );
      
      console.log('Found Leagues:');
      pacificLeagues.forEach(l => {
        console.log(`${l.name} (Slug: ${l.slug}) - ID: ${l.id}`);
      });
    } catch (e) {
      console.error('Error parsing JSON:', e.message);
      // console.log('Raw data preview:', data.substring(0, 200));
    }
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
