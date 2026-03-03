import fs from 'fs';
import path from 'path';

async function fetchAndDumpNames() {
  const uniqueTeams = new Set();
  const PORT = 5173; // The port the dev server is using
  
  // 1. Fetch CS2
  try {
    const cs2Res = await fetch(`http://localhost:${PORT}/api/cs2`);
    if(cs2Res.ok) {
       const cs2Data = await cs2Res.json();
       cs2Data.forEach(match => {
         if (match.team1?.name) uniqueTeams.add(`[CS2] ${match.team1.name}`);
         if (match.team2?.name) uniqueTeams.add(`[CS2] ${match.team2.name}`);
       });
    }
  } catch(e) { console.error('CS2 fetch failed', e.message); }

  // 2. Fetch Valorant (VLR)
  try {
    const vlrRes = await fetch(`http://localhost:${PORT}/api/valorant/match/matches`);
    if(vlrRes.ok) {
        const vlrData = await vlrRes.json();
        vlrData.data?.segments?.forEach(match => {
          if (match.team1) uniqueTeams.add(`[VAL] ${match.team1}`);
          if (match.team2) uniqueTeams.add(`[VAL] ${match.team2}`);
        });
    }
  } catch(e) { console.error('Valorant fetch failed', e.message); }

  console.log(Array.from(uniqueTeams).sort().join('\n'));
}

fetchAndDumpNames();
