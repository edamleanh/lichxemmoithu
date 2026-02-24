// Using native fetch in Node 22

async function testCS2API() {
  try {
    const now = new Date();
    // Simulate App.jsx from and to
    const from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const to = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    const roundedFrom = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate(), 0, 0, 0));
    const roundedTo = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate(), 23, 59, 59, 999));

    const fromStr = roundedFrom.toISOString();
    const toStr = roundedTo.toISOString();
    
    console.log(`Querying from ${fromStr} to ${toStr}`);

    const targetUrl1 = `https://api.pandascore.co/csgo/matches?sort=begin_at&range[begin_at]=${fromStr},${toStr}&per_page=100&page=1`;
    const targetUrl2 = `https://api.pandascore.co/csgo/matches?sort=begin_at&range[begin_at]=${fromStr},${toStr}&per_page=100&page=2`;
    
    const [res1, res2] = await Promise.all([
        fetch(targetUrl1, { headers: { 'Accept': 'application/json', 'Authorization': 'Bearer YYuIsgt7LShLjwAKkERoW0HJqLtw0BcsAxVRr2NHHsk6BzcEqZM' } }),
        fetch(targetUrl2, { headers: { 'Accept': 'application/json', 'Authorization': 'Bearer YYuIsgt7LShLjwAKkERoW0HJqLtw0BcsAxVRr2NHHsk6BzcEqZM' } })
    ]);

    const data1 = await res1.json();
    const data2 = await res2.json();
    
    const data = [...data1, ...data2];
    console.log(`Found ${data.length} matches across 2 pages.`);

    if (data.length > 0) {
       console.log(`First match start: ${data[0].begin_at}`);
       console.log(`Last match start: ${data[data.length-1].begin_at}`);
    }

  } catch (error) {
    console.error('Fetch error:', error);
  }
}

testCS2API();
