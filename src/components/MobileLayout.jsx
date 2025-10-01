import React, { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  Clock, 
  Trophy, 
  Eye, 
  ChevronDown, 
  ChevronUp, 
  Sun, 
  Moon,
  TrendingUp,
  Gamepad2,
  RefreshCw,
  Menu,
  X,
  Filter
} from 'lucide-react'

// Import mobile styles
import '../styles/mobile.css'

// Import mobile configuration
import { getConfig, getGameConfig } from '../config/mobileConfig'


// Import icons
import valorantIcon from '../images/valorant.png'
import pubgIcon from '../images/pubg.png'
import lolIcon from '../images/lol.png'
import footballIcon from '../images/football.png'
import tftIcon from '../images/tft.png'



function WatchLiveButton({ match }) {
  const [isSearching, setIsSearching] = useState(false)
  const [foundStream, setFoundStream] = useState(null)
  if(match.game === 'football' || match.game === 'lol') {
    if(match.status !== 'live') {
      return null
    }
  }
  const handleWatchLive = async () => {
    // If match already has stream, use it
    if (match.stream) {
      window.open(match.stream, '_blank')
      return
    }

    if (match.videoId) {
      const youtubeUrl = `https://www.youtube.com/watch?v=${match.videoId}`
      window.open(youtubeUrl, '_blank')
      return
    }
    
    // If we already found a stream, use it
    if (foundStream) {
      window.open(foundStream, '_blank')
      return
    }
    
    // Special handling for football matches
    if (match.game === 'football') {
      window.open('https://bit.ly/tiengruoi', '_blank')
      return
    }
    
    // Search for YouTube live stream for other sports
    setIsSearching(true)
    try {
      const youtubeUrl = await searchYouTubeLiveStream(match)
      if (youtubeUrl) {
        setFoundStream(youtubeUrl)
        window.open(youtubeUrl, '_blank')
      } else {
        alert('Không tìm thấy live stream cho trận đấu này trên YouTube')
      }
    } catch (error) {
      alert('Lỗi khi tìm kiếm live stream')
    } finally {
      setIsSearching(false)
    }
  }
  
  return (
    <Button
      variant={match.status === 'upcoming' ? "primary" : "danger"}
      size="sm"
      onClick={handleWatchLive}
      className={`text-xs px-2 py-1 ${match.status === 'live' ? 'animate-pulse' : ''}`}
      disabled={isSearching}
    >
      <Play className="h-2.5 w-2.5" />
      {match.status === 'upcoming' && (match.game === 'tft' || match.game === 'pubg') ? 'Đặt nhắc nhở' : 
       match.status === 'finished' ? 'Xem lại' :
       match.status === 'live' ? (isSearching ? 'Đang tìm...' : 'Xem Live') : null  }
    </Button>
  )
}

const Button = ({ className = '', children, variant = 'default', size = 'default', isDarkMode = false, ...props }) => {
  const variants = {
    default: isDarkMode 
      ? 'bg-gray-700/80 hover:bg-gray-600/80 border border-gray-600 text-gray-200 hover:text-white'
      : 'bg-white/80 hover:bg-white border border-gray-200 text-gray-700 hover:text-gray-900',
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0',
    secondary: isDarkMode
      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600'
      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200',
    outline: 'border-2 border-current bg-transparent hover:bg-current/10',
    ghost: isDarkMode
      ? 'bg-transparent hover:bg-gray-700/50 text-gray-300 hover:text-white border-0'
      : 'bg-transparent hover:bg-gray-100 text-gray-600 hover:text-gray-900 border-0',
    danger: 'bg-red-600 hover:bg-red-700 text-white border-0'
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    default: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  }
  
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg font-medium
        transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 
        focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}

// Badge Component  
const Badge = ({ variant = 'default', className = '', children, ...props }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-purple-100 text-purple-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    valorant: 'bg-red-100 text-red-800',
    lol: 'bg-blue-100 text-blue-800',
    football: 'bg-green-100 text-green-800',
    pubg: 'bg-orange-100 text-orange-800',
    tft: 'bg-purple-100 text-purple-800'
  }
  
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}

// Helper functions
const getStatusInfo = (status) => {
  switch (status) {
    case 'live':
      return { variant: 'danger', label: 'LIVE', icon: Play }
    case 'upcoming':
      return { variant: 'primary', label: 'Sắp tới', icon: Clock }
    case 'finished':
      return { variant: 'success', label: 'Kết thúc', icon: Trophy }
    default:
      return { variant: 'default', label: 'Unknown', icon: Clock }
  }
}

const getGameInfo = (game) => {
  switch (game) {
    case 'valorant':
      return { label: 'Valorant', icon: valorantIcon, color: 'from-red-500 to-pink-500', isImage: true }
    case 'pubg':
      return { label: 'PUBG', icon: pubgIcon, color: 'from-orange-500 to-yellow-500', isImage: true }
    case 'tft':
      return { label: 'TFT', icon: tftIcon, color: 'from-purple-500 to-indigo-500', isImage: true }
    case 'lol':
      return { label: 'LOL', icon: lolIcon, color: 'from-blue-500 to-cyan-500', isImage: true }
    case 'football':
      return { label: 'Bóng Đá', icon: footballIcon, color: 'from-green-500 to-emerald-500', isImage: true }
    default:
      return { label: 'Unknown', icon: TrendingUp, color: 'from-gray-500 to-gray-600', isImage: false }
  }
}

const fmtTime = (date) => {
  const now = new Date()
  const matchDate = new Date(date)
  
  // Check if match is today
  const isToday = now.toDateString() === matchDate.toDateString()
  
  // Check if match is tomorrow
  const tomorrow = new Date(now)
  tomorrow.setDate(now.getDate() + 1)
  const isTomorrow = tomorrow.toDateString() === matchDate.toDateString()
  
  // Check if match is yesterday
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const isYesterday = yesterday.toDateString() === matchDate.toDateString()
  
  const timeStr = matchDate.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  })
  
  if (isToday) {
    return `Hôm nay ${timeStr}`
  } else if (isTomorrow) {
    return `Ngày mai ${timeStr}`
  } else if (isYesterday) {
    return `Hôm qua ${timeStr}`
  } else {
    // For other days, show date and time
    const dateStr = matchDate.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit'
    })
    return `${dateStr} ${timeStr}`
  }
}

const shortenTeamName = (teamName) => {
  if (!teamName || teamName === 'TBD') return teamName
  
  // Words to remove from team names
  const wordsToRemove = [
    'FC', 'CF', 'AC', 'SC', 'AS', 'RC', 'CD', 'CD.', 'C.D.',
    'Esports', 'Esport', 'E-sports', 'Gaming', 'Team',
    'Club', 'Football Club', 'Soccer Club',
     'Athletic', 'Atletico',
     'Town', 'County', 'Sport', 'de', 'Fútbol', 'Fútbol', 'Fútbol Club', 'F.C.', 'C.F.', 'A.C.', 'S.C.', 'A.S.', 'R.C.', 'C.D.', 'C.D',
  ]
  
  // Split team name into words
  let words = teamName.split(' ')
  
  // Remove unnecessary words (case insensitive)
  words = words.filter(word => {
    const wordLower = word.toLowerCase().replace(/[.,]/g, '')
    return !wordsToRemove.some(removeWord => 
      removeWord.toLowerCase() === wordLower
    )
  })
  
  // If all words were removed, return original name
  if (words.length === 0) {
    return teamName
  }
  
  // Join remaining words
  let cleanName = words.join(' ')
  
  // Special cases for common abbreviations
  const specialCases = {
    'Manchester Utd': 'Manchester United',
    'Man Utd': 'Manchester United',
    'Barcelona': 'Barça',
    'Bayern München': 'Bayern Munich',
    'Inter Milan': 'Inter',
    'AC Milan': 'Milan'
  }
  
  // Check if cleaned name matches any special case
  for (const [key, value] of Object.entries(specialCases)) {
    if (cleanName === key) {
      return value
    }
  }
  
  // Mobile-specific: If name is still too long, truncate
  if (cleanName.length > 25) {
    return cleanName.substring(0, 22) + '...'
  }
  
  return cleanName
}

// Mobile-optimized Match Card Component
function MobileMatchCard({ match, isDarkMode }) {
  const statusInfo = getStatusInfo(match.status)
  const gameInfo = getGameInfo(match.game)
  const StatusIcon = statusInfo.icon
  const GameIcon = gameInfo.icon

  // Compact layout for mobile
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`relative overflow-hidden rounded-xl backdrop-blur-sm shadow-md transition-all duration-200 ${
        isDarkMode 
          ? 'bg-gray-800/95 border border-gray-600/60' 
          : 'bg-gray-200/95 border border-gray-400/60'
      } p-3 ${
        // Make PUBG/TFT cards clickable if they have streams
        (match.game === 'pubg' || match.game === 'tft') && match.stream ? 'cursor-pointer hover:scale-[1.02]' : ''
      }`}
      onClick={() => {
        // Click handler for PUBG/TFT videos
        if ((match.game === 'pubg' || match.game === 'tft') && match.stream) {
          window.open(match.stream, '_blank')
        }
      }}
    >
      {/* Mobile Header - Compact */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg bg-gradient-to-br ${gameInfo.color}`}>
            {gameInfo.isImage ? (
              <img src={gameInfo.icon} alt={gameInfo.label} className="h-3 w-3 object-contain" />
            ) : (
              <GameIcon className="h-3 w-3 text-white" />
            )}
          </div>
        </div>
        
        {/* League info in center */}
        <div className={`text-xs font-medium truncate px-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {match.league}
        </div>
        
        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {fmtTime(match.start)}
        </div>
      </div>

      {/* Mobile Teams Layout - Vertical for small screens */}
      <div className="space-y-2 mb-3">
        {/* Special layout for PUBG/TFT - Show video title instead of teams */}
        {(match.game === 'pubg' || match.game === 'tft') && match.title ? (
          <div className="space-y-2">
            {/* Video Title */}
            <div className={`font-semibold text-sm leading-tight ${
              isDarkMode ? 'text-gray-100' : 'text-gray-900'
            }`}>
              {match.title}
            </div>
            
            {/* Show description if available and not too long */}
            {match.description && match.description.length <= 100 && (
              <div className={`text-xs leading-relaxed opacity-80 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {match.description}
              </div>
            )}
          </div>
        ) : (
          /* Regular team vs team layout for other games */
          <>
            {/* Team 1 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {match.home?.logo && (
                  <img src={match.home.logo} alt={match.home.name} className="h-6 w-6 rounded object-cover flex-shrink-0" />
                )}
                <span className={`font-semibold text-sm truncate ${
                  isDarkMode ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  {shortenTeamName(match.home?.name) || 'TBD'}
                </span>
              </div>
              
              {/* Score for Team 1 */}
              {(match.status === 'finished' || match.status === 'live') && match.home?.score !== undefined && (
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  match.status === 'live' 
                    ? 'bg-red-100 text-red-800' 
                    : (match.home?.score > (match.away?.score || 0)) 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                }`}>
                  {match.home.score}
                </span>
              )}
            </div>

            {/* Team 2 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {match.away?.logo && (
                  <img src={match.away.logo} alt={match.away.name} className="h-6 w-6 rounded object-cover flex-shrink-0" />
                )}
                <span className={`font-semibold text-sm truncate ${
                  isDarkMode ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  {shortenTeamName(match.away?.name) || 'TBD'}
                </span>
              </div>
              
              {/* Score for Team 2 */}
              {(match.status === 'finished' || match.status === 'live') && match.away?.score !== undefined && (
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  match.status === 'live' 
                    ? 'bg-red-100 text-red-800' 
                    : (match.away?.score > (match.home?.score || 0)) 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                }`}>
                  {match.away.score}
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Mobile Live Info - Only show essential info */}
      {match.status === 'live' && (
        <div className={`p-2 rounded-lg mb-2 ${
          isDarkMode 
            ? 'bg-gray-700/80 border border-gray-600/60' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
              <span className={`font-semibold ${
                isDarkMode ? 'text-red-300' : 'text-red-800'
              }`}>
                LIVE
              </span>
              
              {/* Game-specific live info - minimal */}
              {match.game === 'valorant' && match.currentMap && (
                <span className="text-gray-500">• {match.currentMap}</span>
              )}
              {match.game === 'football' && match.currentMinute && (
                <span className="text-gray-500">• {match.currentMinute}'</span>
              )}
            </div>
            
            <WatchLiveButton match={match} />
          </div>
        </div>
      )}

      {/* Mobile PUBG/TFT Video Info - Simplified */}
      {(match.game === 'pubg' || match.game === 'tft') && match.viewCount > 0 && (
        <div className={`flex items-center gap-3 text-xs ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {match.status === 'live' && match.concurrentViewers && (
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
              <span>{match.concurrentViewers.toLocaleString()}</span>
            </div>
          )}
          
          <div className="flex items-center gap-1">
            <Eye className="h-2.5 w-2.5" />
            <span>{match.viewCount.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Watch/Reminder Button for all matches */}
      {(match.status === 'upcoming' || (match.status === 'finished' && (match.stream || match.videoId))) && (
        <div className="mt-3 flex justify-center">
          <WatchLiveButton match={match} />
        </div>
      )}
    </motion.div>
  )
}

// Mobile Section Header Component
function MobileSectionHeader({ 
  title, 
  count, 
  isCollapsed, 
  onToggle, 
  config, 
  isDarkMode 
}) {
  return (
    <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-600/60' : `${config.bgColor} ${config.borderColor}`} border rounded-xl p-3`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`bg-gradient-to-r ${config.gradient} text-white rounded-lg px-3 py-1.5 ${title.includes('LIVE') ? 'animate-pulse' : ''}`}>
            <h3 className="text-sm font-bold">{title}</h3>
          </div>
          <span className={`text-xs font-bold px-2 py-1 rounded-full border ${
            isDarkMode 
              ? 'bg-gray-700/80 border-gray-500/60 text-gray-200' 
              : `${config.textColor} ${config.bgColor} ${config.borderColor}`
          }`}>
            {count}
          </span>
        </div>
        
        <button
          onClick={onToggle}
          className={`p-1.5 rounded-lg transition-all duration-200 ${
            isDarkMode 
              ? 'bg-gray-700/60 hover:bg-gray-600/80 text-gray-300 border border-gray-600/60' 
              : `${config.bgColor} hover:bg-opacity-80 ${config.textColor} ${config.borderColor} border`
          }`}
        >
          {isCollapsed ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronUp className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </div>
  )
}

// Mobile Navigation Component
function MobileNavigation({ 
  sports, 
  activeSport, 
  onSportChange, 
  isDarkMode, 
  onThemeToggle,
  groupedData,
  onSectionScroll 
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <>
      {/* Mobile Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-lg border-b transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gray-800/80 border-gray-700/50' 
          : 'bg-white/80 border-gray-200/50'
      }`}>
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                🏆 Esports
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Quick Jump Buttons - Mobile */}
              {groupedData.length > 0 && (
                <div className="flex gap-1">
                  {groupedData.map(([status, matches]) => {
                    const sectionConfig = {
                      live: { icon: Play, color: 'bg-red-500', count: matches.length },
                      upcoming: { icon: Clock, color: 'bg-blue-500', count: matches.length },
                      finished: { icon: Trophy, color: 'bg-green-500', count: matches.length }
                    }
                    
                    const config = sectionConfig[status]
                    if (!config) return null
                    
                    const SectionIcon = config.icon
                    
                    return (
                      <button
                        key={status}
                        onClick={() => onSectionScroll(status)}
                        className={`flex items-center gap-1 px-2 py-1 rounded ${config.color} text-white text-xs font-medium ${status === 'live' ? 'animate-pulse' : ''}`}
                      >
                        <SectionIcon className="h-3 w-3" />
                        <span>{config.count}</span>
                      </button>
                    )
                  })}
                </div>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                isDarkMode={isDarkMode}
                onClick={onThemeToggle}
                className="p-2"
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                isDarkMode={isDarkMode}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2"
              >
                {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`sticky top-[64px] z-40 border-b ${
              isDarkMode 
                ? 'bg-gray-800/95 border-gray-700/50' 
                : 'bg-white/95 border-gray-200/50'
            } backdrop-blur-lg`}
          >
            <div className="px-4 py-3">
              <div className="grid grid-cols-2 gap-2">
                {sports.map((sport) => {
                  const SportIcon = sport.icon
                  return (
                    <Button
                      key={sport.id}
                      variant={activeSport === sport.id ? 'primary' : 'default'}
                      size="sm"
                      isDarkMode={isDarkMode}
                      onClick={() => {
                        onSportChange(sport.id)
                        setIsMenuOpen(false)
                      }}
                      className="justify-start text-xs"
                    >
                      {sport.isImage ? (
                        <img src={sport.icon} alt={sport.label} className="h-3.5 w-3.5 object-contain" />
                      ) : (
                        <SportIcon className="h-3.5 w-3.5" />
                      )}
                      {sport.label}
                    </Button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Main Mobile Layout Component
export default function MobileLayout({
  isDarkMode,
  setIsDarkMode,
  activeSport,
  setActiveSport,
  groupedData,
  loading,
  error,
  refetch,
  collapsedSections,
  toggleSectionCollapse,
  scrollToSection,
  liveRef,
  upcomingRef,
  finishedRef
}) {
  const sports = [
    { id: 'all', label: 'Tất cả', icon: TrendingUp, color: 'from-purple-500 to-pink-500', isImage: false },
    { id: 'valorant', label: 'Valorant', icon: valorantIcon, color: 'from-red-500 to-pink-500', isImage: true },
    { id: 'pubg', label: 'PUBG', icon: pubgIcon, color: 'from-orange-500 to-yellow-500', isImage: true },
    { id: 'tft', label: 'TFT', icon: tftIcon, color: 'from-purple-500 to-indigo-500', isImage: true },
    { id: 'lol', label: 'LOL', icon: lolIcon, color: 'from-blue-500 to-cyan-500', isImage: true },
    { id: 'football', label: 'Bóng Đá', icon: footballIcon, color: 'from-green-500 to-emerald-500', isImage: true },
  ]

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      {/* Mobile Navigation */}
      <MobileNavigation
        sports={sports}
        activeSport={activeSport}
        onSportChange={setActiveSport}
        isDarkMode={isDarkMode}
        onThemeToggle={() => setIsDarkMode(!isDarkMode)}
        groupedData={groupedData}
        onSectionScroll={scrollToSection}
      />

      {/* Mobile Content */}
      <div className="px-4 py-4">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Đang tải...
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className={`rounded-xl border p-4 text-center ${
            isDarkMode 
              ? 'border-red-600/60 bg-red-900/30' 
              : 'border-red-200 bg-red-50'
          }`}>
            <p className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-600'}`}>
              {error}
            </p>
            <Button variant="outline" size="sm" isDarkMode={isDarkMode} onClick={refetch} className="mt-3">
              Thử lại
            </Button>
          </div>
        )}

        {/* No Data State */}
        {!loading && !error && groupedData.length === 0 && (
          <div className={`rounded-xl border p-8 text-center ${
            isDarkMode 
              ? 'border-gray-600 bg-gray-800/50' 
              : 'border-gray-200 bg-gray-50'
          }`}>
            <Gamepad2 className={`h-12 w-12 mx-auto mb-3 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <h3 className={`text-lg font-semibold mb-2 ${
              isDarkMode ? 'text-gray-100' : 'text-gray-900'
            }`}>Không có trận đấu</h3>
            <p className={`text-sm mb-3 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>Không tìm thấy trận đấu nào</p>
            <Button variant="primary" size="sm" isDarkMode={isDarkMode} onClick={refetch}>
              <RefreshCw className="h-3.5 w-3.5" />
              Làm mới
            </Button>
          </div>
        )}

        {/* Mobile Match Groups */}
        <div className="space-y-4">
          {groupedData.map(([status, matches]) => {
            const statusConfig = {
              live: {
                title: '🔴 LIVE',
                gradient: 'from-red-500 to-red-600',
                bgColor: 'bg-red-50',
                borderColor: 'border-red-200',
                textColor: 'text-red-800'
              },
              upcoming: {
                title: '📅 Sắp tới',
                gradient: 'from-blue-500 to-blue-600',
                bgColor: 'bg-blue-50',
                borderColor: 'border-blue-200',
                textColor: 'text-blue-800'
              },
              finished: {
                title: '🏆 Diễn ra rồi',
                gradient: 'from-green-500 to-green-600',
                bgColor: 'bg-green-50',
                borderColor: 'border-green-200',
                textColor: 'text-green-800'
              }
            }
            
            const config = statusConfig[status]
            const isCollapsed = collapsedSections[status]
            
            // Get appropriate ref for this section
            const getSectionRef = (status) => {
              switch(status) {
                case 'live': return liveRef
                case 'upcoming': return upcomingRef
                case 'finished': return finishedRef
                default: return null
              }
            }
            
            return (
              <motion.section
                key={status}
                ref={getSectionRef(status)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <MobileSectionHeader
                  title={config.title}
                  count={matches.length}
                  isCollapsed={isCollapsed}
                  onToggle={() => toggleSectionCollapse(status)}
                  config={config}
                  isDarkMode={isDarkMode}
                />

                {/* Mobile Match Cards */}
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-3">
                        <AnimatePresence>
                          {matches.map((match) => (
                            <MobileMatchCard
                              key={match.id}
                              match={match}
                              isDarkMode={isDarkMode}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.section>
            )
          })}
        </div>
      </div>
    </div>
  )
}