# 🏆 Lịch Thi Đấu Esports

Ứng dụng web theo dõi lịch thi đấu Esports và Bóng đá với Real-time API integration.

## ✨ Tính năng

- **Multi-sport support**: Valorant, PUBG, League of Legends, Football
- **Real-time updates**: Live matches với status updates
- **Beautiful UI**: Modern design với animations
- **Mobile responsive**: Hoạt động tốt trên mọi thiết bị
- **API Integration**: Kết nối với các API chính thức

## 🚀 Tech Stack

- **Frontend**: React 19 + Vite 7
- **Styling**: TailwindCSS 4
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Deployment**: Vercel

## 📦 Installation

1. Clone repository:
```bash
git clone https://github.com/edamleanh/lichxemmoithu.git
cd lichxemmoithu
```

2. Install dependencies:
```bash
npm install
```

3. Setup environment variables:
```bash
cp .env.example .env
```

4. Get Football API key:
   - Visit https://www.football-data.org/
   - Register for free account
   - Get your API token
   - Add to `.env`: `VITE_FOOTBALL_API_KEY=your_actual_key`

5. Start development server:
```bash
npm run dev
```

## 🌐 API Endpoints

- **Valorant**: VLR.gg API (no key required)
- **League of Legends**: LoL Esports API (no key required)  
- **Football**: Football-data.org API (requires free API key)
- **PUBG**: Sample data (API integration coming soon)

## 🔧 Troubleshooting

### API Errors

**Football API 404/500 errors:**
- Check if VITE_FOOTBALL_API_KEY is set correctly
- Verify API key is valid at football-data.org
- Free tier has rate limits (10 requests/minute)

**LoL API 500 errors:**
- API may be temporarily unavailable
- App will fallback to sample data automatically

**Network timeout:**
- APIs have 5-8 second timeout
- Automatic fallback to sample data on timeout

### Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Deployment

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard:
   - `VITE_FOOTBALL_API_KEY=your_actual_key`
4. Deploy

## 📱 Features Showcase

- **Live Matches**: Real-time scores và match status
- **Upcoming Games**: Schedule với precise timing
- **Completed Matches**: Results với detailed scores
- **Game-specific Info**: 
  - Valorant: Map info, round scores
  - LoL: Game number, series info
  - Football: Current minute, referee info

## 🎨 Design System

- **Modern gradients** và glass morphism effects
- **Responsive grid** layout
- **Smooth animations** với Framer Motion
- **Status-based color coding**
- **Compact/Grid view** toggle

## 🔮 Roadmap

- [ ] Push notifications cho live matches
- [ ] User favorites/bookmarks
- [ ] Match predictions
- [ ] Social features
- [ ] More sports (CS:GO, Dota 2)
- [ ] Mobile app version

## 📄 License

MIT License - see LICENSE file for details.
