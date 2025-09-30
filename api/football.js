// Vercel Serverless Function for Football API với Firestore Cache
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, query, where, orderBy } from 'firebase/firestore';

// Cấu hình Firebase với thông tin hardcode
const firebaseConfig = {
  apiKey: "AIzaSyCfBIsyq2N5mFDJwmcu-ISUs4cKIMlUwn4",
  authDomain: "lickxemmoithu.firebaseapp.com",
  projectId: "lickxemmoithu",
  storageBucket: "lickxemmoithu.firebasestorage.app",
  messagingSenderId: "1068842530441",
  appId: "1:1068842530441:web:be4f3432ae9cd24ae3f858",
  measurementId: "G-MWTMBCQ677"
};

// Khởi tạo Firebase (chỉ khởi tạo một lần)
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db = getFirestore(app);

// Hàm kiểm tra và lấy dữ liệu từ cache
async function getCachedMatches(competition, dateFrom, dateTo) {
  try {
    const cacheDocId = `${competition}_${dateFrom}_${dateTo}`;
    const cacheRef = doc(db, 'footballCache', cacheDocId);
    const cacheDoc = await getDoc(cacheRef);
    
    if (cacheDoc.exists()) {
      const cachedData = cacheDoc.data();
      console.log('Football API - Tìm thấy cache:', cacheDocId);
      return cachedData;
    }
    
    console.log('Football API - Không tìm thấy cache:', cacheDocId);
    return null;
  } catch (error) {
    console.error('Football API - Lỗi khi đọc cache:', error);
    return null;
  }
}

// Hàm lưu dữ liệu vào cache
async function saveToCache(competition, dateFrom, dateTo, data) {
  try {
    const cacheDocId = `${competition}_${dateFrom}_${dateTo}`;
    const cacheRef = doc(db, 'footballCache', cacheDocId);
    
    const cacheData = {
      data,
      lastUpdated: new Date().toISOString(),
      competition,
      dateFrom,
      dateTo,
      nextEarliestMatch: getEarliestMatchTime(data.matches),
      hasLiveMatches: hasLiveMatches(data.matches),
      liveMatchCount: data.matches ? data.matches.filter(match => 
        match.status === 'IN_PLAY' || match.status === 'LIVE'
      ).length : 0
    };
    
    await setDoc(cacheRef, cacheData);
    console.log('Football API - Đã lưu cache:', cacheDocId, 
      `- Live matches: ${cacheData.liveMatchCount}`);
  } catch (error) {
    console.error('Football API - Lỗi khi lưu cache:', error);
  }
}

// Hàm tìm thời gian trận đấu sớm nhất và kiểm tra trận đấu live
function getEarliestMatchTime(matches) {
  if (!matches || matches.length === 0) return null;
  
  const now = new Date();
  const upcomingMatches = matches
    .map(match => new Date(match.utcDate))
    .filter(date => date > now)
    .sort((a, b) => a - b);
  
  return upcomingMatches.length > 0 ? upcomingMatches[0].toISOString() : null;
}

// Hàm kiểm tra có trận đấu live không
function hasLiveMatches(matches) {
  if (!matches || matches.length === 0) return false;
  
  return matches.some(match => match.status === 'IN_PLAY' || match.status === 'LIVE');
}

// Hàm kiểm tra xem có cần gọi API không
async function shouldCallAPI(competition, dateFrom, dateTo) {
  try {
    const cacheDocId = `${competition}_${dateFrom}_${dateTo}`;
    const cacheRef = doc(db, 'footballCache', cacheDocId);
    const cacheDoc = await getDoc(cacheRef);
    
    if (!cacheDoc.exists()) {
      console.log('Football API - Không có cache, cần gọi API');
      return true;
    }
    
    const cachedData = cacheDoc.data();
    const now = new Date();
    
    // Kiểm tra trận đấu live trước - Nếu có trận live, LUÔN gọi API để cập nhật tỷ số
    if (hasLiveMatches(cachedData.data.matches)) {
      console.log('Football API - Có trận đấu đang live, cần gọi API để cập nhật tỷ số');
      return true;
    }
    
    // Kiểm tra cache cũ (hơn 5 phút) trong trường hợp có thể có trận live mới
    const lastUpdated = new Date(cachedData.lastUpdated);
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    if (lastUpdated < fiveMinutesAgo) {
      console.log('Football API - Cache cũ hơn 5 phút, gọi API để kiểm tra trận live mới');
      return true;
    }
    
    // Nếu không có trận đấu sắp tới, cache vẫn hợp lệ
    if (!cachedData.nextEarliestMatch) {
      console.log('Football API - Không có trận đấu sắp tới và không có trận live, sử dụng cache');
      return false;
    }
    
    const earliestMatchTime = new Date(cachedData.nextEarliestMatch);
    
    // Nếu thời gian hiện tại >= thời gian trận đấu sớm nhất, cần gọi API
    if (now >= earliestMatchTime) {
      console.log('Football API - Đã đến thời gian trận đấu sớm nhất, cần gọi API');
      return true;
    }
    
    console.log('Football API - Chưa đến thời gian trận đấu sớm nhất và không có trận live, sử dụng cache');
    return false;
  } catch (error) {
    console.error('Football API - Lỗi khi kiểm tra cache:', error);
    return true; // Nếu có lỗi, gọi API để đảm bảo dữ liệu
  }
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Auth-Token');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Parse URL path - remove query parameters first
    const urlPath = req.url.split('?')[0].replace('/api/football', '');
    console.log('Football API - URL Path:', urlPath);
    console.log('Football API - Full URL:', req.url);
    
    // Handle /competitions endpoint
    if (urlPath === '/competitions') {
      // GET /competitions - return available competitions
      const competitions = [
        { id: 'PL', name: 'Premier League', area: { name: 'England' } },
        { id: 'PD', name: 'LaLiga', area: { name: 'Spain' } },
        { id: 'CL', name: 'UEFA Champions League', area: { name: 'Europe' } }
      ];
      res.status(200).json({ competitions });
      return;
    }
    
    // Handle /competitions/{id}/matches endpoint với cache
    const competitionMatch = urlPath.match(/^\/competitions\/([^\/]+)\/matches$/);
    if (competitionMatch) {
      const competition = competitionMatch[1];
      const { dateFrom, dateTo } = req.query;
      
      console.log('Football API - Competition:', competition);
      console.log('Football API - Date range:', { dateFrom, dateTo });
      
      // Kiểm tra cache trước
      const shouldCall = await shouldCallAPI(competition, dateFrom, dateTo);
      
      if (!shouldCall) {
        const cachedData = await getCachedMatches(competition, dateFrom, dateTo);
        if (cachedData) {
          console.log('Football API - Trả về dữ liệu từ cache');
          res.status(200).json(cachedData.data);
          return;
        }
      }
      
      // Gọi API nếu cần thiết
      console.log('Football API - Gọi API mới');
      const apiKey = process.env.VITE_FOOTBALL_API_KEY || process.env.FOOTBALL_API_KEY || '354c9341dac74c788f59795973d8099d';
      
      if (!apiKey) {
        console.error('Football API - Không tìm thấy API key');
        res.status(500).json({ error: 'Football API key not configured' });
        return;
      }

      let apiUrl = `https://api.football-data.org/v4/competitions/${competition}/matches`;
      if (dateFrom && dateTo) {
        apiUrl += `?dateFrom=${dateFrom}&dateTo=${dateTo}`;
      }
      
      console.log('Football API - Đang gọi:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'X-Auth-Token': apiKey,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      console.log('Football API - Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Football API - Error response:', errorText);
        throw new Error(`Football API responded with status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Football API - Thành công, số trận đấu tìm thấy:', data.matches?.length || 0);
      
      // Lưu vào cache
      await saveToCache(competition, dateFrom, dateTo, data);
      
      res.status(200).json(data);
      return;
    }
    
    // Legacy support - direct competition parameter với cache
    const { competition, dateFrom, dateTo } = req.query;
    
    if (!competition) {
      res.status(400).json({ 
        error: 'Invalid endpoint. Use /competitions or /competitions/{id}/matches',
        receivedPath: urlPath,
        supportedEndpoints: [
          '/competitions',
          '/competitions/PL/matches',
          '/competitions/PD/matches',
          '/competitions/CL/matches'
        ]
      });
      return;
    }

    // Kiểm tra cache cho legacy support
    const shouldCall = await shouldCallAPI(competition, dateFrom, dateTo);
    
    if (!shouldCall) {
      const cachedData = await getCachedMatches(competition, dateFrom, dateTo);
      if (cachedData) {
        console.log('Football API - Trả về dữ liệu từ cache (legacy)');
        res.status(200).json(cachedData.data);
        return;
      }
    }

    // Gọi API cho legacy support
    const apiKey = process.env.VITE_FOOTBALL_API_KEY || process.env.FOOTBALL_API_KEY || '354c9341dac74c788f59795973d8099d';
    
    if (!apiKey) {
      res.status(500).json({ error: 'Football API key not configured' });
      return;
    }

    const apiUrl = `https://api.football-data.org/v4/competitions/${competition}/matches${
      dateFrom && dateTo ? `?dateFrom=${dateFrom}&dateTo=${dateTo}` : ''
    }`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-Auth-Token': apiKey,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Football API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Lưu vào cache
    await saveToCache(competition, dateFrom, dateTo, data);
    
    res.status(200).json(data);

  } catch (error) {
    console.error('Football API Error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Football data',
      message: error.message 
    });
  }
}