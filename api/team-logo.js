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
    const { team } = req.query;
    
    if (!team) {
      return res.status(400).json({ error: 'Team name is required' });
    }

    // Clean team name
    const cleanTeam = team.trim();
    
    // Known team logo mappings for Valorant teams
    const knownLogos = {
      'Sentinels': 'https://owcdn.net/img/61048c65e3d3e.png',
      'Team Liquid': 'https://owcdn.net/img/5f88ff81c3be8.png', 
      'LOUD': 'https://owcdn.net/img/626ae8a2b1c6c.png',
      'FNATIC': 'https://owcdn.net/img/60f87b30b9a21.png',
      'Paper Rex': 'https://owcdn.net/img/62674e8b9d19b.png',
      'PRX': 'https://owcdn.net/img/62674e8b9d19b.png',
      'NRG': 'https://owcdn.net/img/61048c65e3d3f.png',
      'Cloud9': 'https://owcdn.net/img/5f88ff81c3be9.png',
      'NAVI': 'https://owcdn.net/img/6062b9e0b9a22.png',
      'FUT Esports': 'https://owcdn.net/img/63674e8b9d19c.png',
      'DRX': 'https://owcdn.net/img/61048c65e3d3g.png',
      'EDward Gaming': 'https://owcdn.net/img/62674e8b9d19d.png',
      'Evil Geniuses': 'https://owcdn.net/img/61048c65e3d3h.png',
      '100 Thieves': 'https://owcdn.net/img/61048c65e3d3i.png',
      'OpTic Gaming': 'https://owcdn.net/img/61048c65e3d3j.png',
      'Team Heretics': 'https://owcdn.net/img/64674e8b9d19e.png',
      'Karmine Corp': 'https://owcdn.net/img/65674e8b9d19f.png',
      'BBL Esports': 'https://owcdn.net/img/66674e8b9d19g.png',
      'KOI': 'https://owcdn.net/img/67674e8b9d19h.png',
      'Giants': 'https://owcdn.net/img/68674e8b9d19i.png',
      'T1': 'https://owcdn.net/img/69674e8b9d19j.png',
      'Gen.G': 'https://owcdn.net/img/70674e8b9d19k.png',
      'ZETA DIVISION': 'https://owcdn.net/img/71674e8b9d19l.png',
      'DetonationFocusMe': 'https://owcdn.net/img/72674e8b9d19m.png',
    };

    // Check if we have a known logo
    if (knownLogos[cleanTeam]) {
      return res.json({
        team: cleanTeam,
        logo: knownLogos[cleanTeam],
        source: 'known_mapping'
      });
    }

    // Fallback: Generate a consistent placeholder
    const initial = cleanTeam.charAt(0).toUpperCase();
    const colors = [
      { bg: '1f2937', fg: 'ffffff' }, // gray
      { bg: 'dc2626', fg: 'ffffff' }, // red
      { bg: '2563eb', fg: 'ffffff' }, // blue
      { bg: '16a34a', fg: 'ffffff' }, // green
      { bg: 'ca8a04', fg: 'ffffff' }, // yellow
      { bg: '9333ea', fg: 'ffffff' }, // purple
      { bg: 'c2410c', fg: 'ffffff' }, // orange
    ];
    
    // Use team name hash to consistently pick a color
    const hash = cleanTeam.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const color = colors[hash % colors.length];
    
    const placeholderUrl = `https://via.placeholder.com/64x64/${color.bg}/${color.fg}?text=${initial}`;

    return res.json({
      team: cleanTeam,
      logo: placeholderUrl,
      source: 'placeholder'
    });

  } catch (error) {
    console.error('Team logo API error:', error);
    res.status(500).json({ 
      error: 'Failed to get team logo',
      details: error.message 
    });
  }
}