import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Eye, Play } from 'lucide-react'
import { Button, Badge, getStatusInfo, getGameInfo, LazyImage } from '../common/UI.jsx'
import { fmtTime, shortenTeamName } from '../../utils/formatters.js'

// --- Watch Live Button Component ------------------------------------------
export function WatchLiveButton({ match }) {
  const [isSearching, setIsSearching] = useState(false)
  const [foundStream, setFoundStream] = useState(null)
  
  const handleWatchLive = async () => {
    // If match already has stream, use it
    if (match.stream) {
      console.log('Opening direct stream URL:', match.stream)
      window.open(match.stream, '_blank')
      return
    }

    if (match.videoId) {
      const youtubeUrl = `https://www.youtube.com/watch?v=${match.videoId}`
      window.open(youtubeUrl, '_blank')
    }
    
    // If we already found a stream, use it
    if (foundStream) {
      window.open(foundStream, '_blank')
      return
    }
    
    // Special handling for football matches
    if (match.game === 'football') {
      window.open('https://www.xaycon.live', '_blank')
      return
    }
    
    // Search for YouTube live stream for other sports (LoL, Valorant, etc.)
    setIsSearching(true)
    try {
      const searchQuery = `${match.home?.name || ''} vs ${match.away?.name || ''} ${match.league || ''} live`
      const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`
      window.open(youtubeSearchUrl, '_blank')
    } catch (error) {
      console.error('Error opening search:', error)
      alert('Không thể mở trang tìm kiếm')
    } finally {
      setIsSearching(false)
    }
  }
  
  return (
    <Button
      variant={match.status === 'upcoming' ? "primary" : "danger"}
      size="sm"
      onClick={handleWatchLive}
      className="animate-pulse"
      disabled={isSearching}
    >
      <Play className="h-3 w-3" />
      {match.status === 'upcoming' ? 'Đặt thông báo' : isSearching ? 'Đang tìm...' : 'Xem Live'}
    </Button>
  )
}

// --- Match Card Component -------------------------------------------------
export function MatchCard({ match, isDarkMode }) {
  const statusInfo = getStatusInfo(match.status)
  const gameInfo = getGameInfo(match.game)
  const StatusIcon = statusInfo.icon
  const GameIcon = gameInfo.icon

  // Special layout for PUBG (YouTube-based)
  if (match.game === 'pubg') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ y: -4 }}
        className={`group relative overflow-hidden rounded-2xl backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 ${
          isDarkMode 
            ? 'bg-gray-800/95 border border-gray-600/60 hover:bg-gray-700/95' 
            : 'bg-gray-200/95 border border-gray-400/60 hover:bg-gray-100/95'
        } p-6`}
      >
        {/* Background Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gameInfo.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
        
        {/* PUBG YouTube Video Layout */}
        <div className="space-y-4">
          {/* Header - Same format as other cards */}
          <div className="grid grid-cols-3 items-center mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${gameInfo.color}`}>
                {gameInfo.isImage ? (
                  <img src={gameInfo.icon} alt={gameInfo.label} className="h-4 w-4 object-contain" />
                ) : (
                  <GameIcon className="h-4 w-4 text-white" />
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-center">

              <Badge variant={statusInfo.variant}>
                <StatusIcon className="h-3 w-3" />
                {statusInfo.label}
              </Badge>
            </div>
            
            <div className={`flex items-center gap-2 text-sm justify-end ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <Clock className="h-4 w-4" />
              {fmtTime(match.start)}
            </div>
          </div>

          {/* Video Thumbnail - Only show for live videos, not upcoming */}
          {match.thumbnail && match.status !== 'upcoming' && (
            <div 
              className="relative rounded-lg overflow-hidden aspect-video bg-gray-900 cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => {
                if (match.stream) {
                  window.open(match.stream, '_blank')
                } else {
                  // Fallback to YouTube search if no direct stream URL
                  const searchQuery = `${match.title || match.league} live stream`
                  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`
                  window.open(youtubeSearchUrl, '_blank')
                }
              }}
            >
              <img 
                src={match.thumbnail} 
                alt={match.title}
                className="w-full h-full object-cover"
              />
              {/* Play overlay for live streams */}
              {match.status === 'live' && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 animate-pulse">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    LIVE
                  </div>
                </div>
              )}
              {/* Click hint overlay */}
              <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                <div className="bg-black/60 text-white px-4 py-2 rounded-lg text-sm font-medium">
                  Click để xem
                </div>
              </div>
            </div>
          )}

          {/* Video Title */}
          <div>
            <h3 className={`font-semibold text-lg leading-tight line-clamp-2 ${
              isDarkMode ? 'text-gray-100' : 'text-gray-900'
            }`}>
              {match.title || match.league || 'PUBG Tournament'}
            </h3>
            
            {/* View count and live viewers info */}
            <div className={`flex items-center gap-4 mt-2 text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {match.status === 'live' && match.concurrentViewers && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">
                    {match.concurrentViewers.toLocaleString()} đang xem
                  </span>
                </div>
              )}
              
              {match.viewCount > 0 && (
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{match.viewCount.toLocaleString()} lượt xem</span>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
                <WatchLiveButton match={match} />
            </div>
          </div>

          {/* Live match info for PUBG */}
          {/* {match.status === 'live' && (
            <div className={`p-3 rounded-lg ${
              isDarkMode 
                ? 'bg-gray-700/80 border border-gray-600/60' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className={`font-semibold ${
                    isDarkMode ? 'text-red-300' : 'text-red-800'
                  }`}>
                    Đang phát trực tiếp
                  </span>
                </div>
                
                <WatchLiveButton match={match} />
              </div>
            </div>
          )} */}
        </div>
      </motion.div>
    )
  }

  // Special layout for TFT (YouTube-based, similar to PUBG)
  if (match.game === 'tft') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ y: -4 }}
        className={`group relative overflow-hidden rounded-2xl backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 ${
          isDarkMode 
            ? 'bg-gray-800/95 border border-gray-600/60 hover:bg-gray-700/95' 
            : 'bg-gray-200/95 border border-gray-400/60 hover:bg-gray-100/95'
        } p-6`}
      >
        {/* Background Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gameInfo.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
        
        {/* TFT YouTube Video Layout */}
        <div className="space-y-4">
          {/* Header - Same format as PUBG cards */}
          <div className="grid grid-cols-3 items-center mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${gameInfo.color}`}>
                {gameInfo.isImage ? (
                  <img src={gameInfo.icon} alt={gameInfo.label} className="h-4 w-4 object-contain" />
                ) : (
                  <GameIcon className="h-4 w-4 text-white" />
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <Badge variant={statusInfo.variant}>
                <StatusIcon className="h-3 w-3" />
                {statusInfo.label}
              </Badge>
            </div>
            
            <div className={`flex items-center gap-2 text-sm justify-end ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <Clock className="h-4 w-4" />
              {fmtTime(match.start)}
            </div>
          </div>

          {/* Video Title */}
          <div>
            <h3 className={`font-semibold text-lg leading-tight line-clamp-2 ${
              isDarkMode ? 'text-gray-100' : 'text-gray-900'
            }`}>
              {match.title || match.league || 'TFT Tournament'}
            </h3>
            
            {/* View count and live viewers info */}
            <div className={`flex items-center gap-4 mt-2 text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {match.status === 'live' && match.concurrentViewers && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">
                    {match.concurrentViewers.toLocaleString()} đang xem
                  </span>
                </div>
              )}
              
              {match.viewCount > 0 && (
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{match.viewCount.toLocaleString()} lượt xem</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
                <WatchLiveButton match={match} />
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  // Default layout for other games
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      className={`group relative overflow-hidden rounded-2xl backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 ${
        isDarkMode 
          ? 'bg-gray-800/95 border border-gray-600/60 hover:bg-gray-700/95' 
          : 'bg-gray-200/95 border border-gray-400/60 hover:bg-gray-100/95'
      } p-6`}
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gameInfo.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
      
      {/* Header */}
      <div className="grid grid-cols-3 items-center mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${gameInfo.color}`}>
            {gameInfo.isImage ? (
              <img src={gameInfo.icon} alt={gameInfo.label} className="h-4 w-4 object-contain" />
            ) : (
              <GameIcon className="h-4 w-4 text-white" />
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-center">
          <Badge variant={statusInfo.variant}>
            <StatusIcon className="h-3 w-3" />
            {statusInfo.label}
          </Badge>
        </div>
        
        <div className={`flex items-center gap-2 text-sm justify-end ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <Clock className="h-4 w-4" />
          {fmtTime(match.start)}
        </div>
      </div>

      {/* Teams */}
      <div className="mb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {match.home?.logo && (
              <LazyImage 
                src={match.home.logo} 
                alt={match.home.name} 
                className="h-8 w-8 rounded-lg object-cover flex-shrink-0 mt-1" 
              />
            )}
            <span className={`font-semibold break-words leading-tight ${
              isDarkMode ? 'text-gray-100' : 'text-gray-900'
            }`}>{shortenTeamName(match.home?.name) || 'TBD'}</span>
          </div>
          
          <div className="flex items-center gap-3 min-w-0">
            {(match.status === 'finished' || match.status === 'live') && (match.home?.score !== undefined || match.away?.score !== undefined) ? (
              <>
                <span className={`px-2 py-1 rounded-lg text-sm font-bold ${
                  match.status === 'live' 
                    ? 'bg-red-100 text-red-800 animate-pulse' 
                    : (match.home?.score > (match.away?.score || 0)) 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                }`}>
                  {match.home?.score || 0}
                </span>
                <span className={`text-lg font-bold ${match.status === 'live' ? 'text-red-600' : 'text-gray-600'}`}>-</span>
                <span className={`px-2 py-1 rounded-lg text-sm font-bold ${
                  match.status === 'live' 
                    ? 'bg-red-100 text-red-800 animate-pulse' 
                    : (match.away?.score > (match.home?.score || 0)) 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                }`}>
                  {match.away?.score || 0}
                </span>
              </>
            ) : (
              <span className="text-gray-400 font-medium">VS</span>
            )}
          </div>
          
          <div className="flex items-start gap-3 flex-1 justify-end min-w-0">
            <span className={`font-semibold break-words leading-tight text-right ${
              isDarkMode ? 'text-gray-100' : 'text-gray-900'
            }`}>{shortenTeamName(match.away?.name) || 'TBD'}</span>
            {match.away?.logo && (
              <LazyImage 
                src={match.away.logo} 
                alt={match.away.name} 
                className="h-8 w-8 rounded-lg object-cover flex-shrink-0 mt-1" 
              />
            )}
          </div>
        </div>

        {/* Live Match Additional Info */}
        {match.status === 'live' && (
          <div className={`mt-3 p-3 rounded-lg ${
            isDarkMode 
              ? 'bg-gray-700/80 border border-gray-600/60' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                
                {/* Valorant LIVE info */}
                {match.game === 'valorant' && match.currentMap && (
                  <span className={`font-semibold ${
                    isDarkMode ? 'text-red-300' : 'text-red-800'
                  }`}>
                    Map {match.mapNumber}: {match.currentMap}
                  </span>
                )}
                
                {/* LoL LIVE info */}
                {match.game === 'lol' && (
                  <span className={`font-semibold ${
                    isDarkMode ? 'text-red-300' : 'text-red-800'
                  }`}>
                    {match.currentGame && `${match.currentGame}`}
                    {match.liveGameState && `${match.liveGameState}`}
                  </span>
                )}

                {/* Football LIVE info */}
                {match.game === 'football' && (
                  <span className={`font-semibold ${
                    isDarkMode ? 'text-red-300' : 'text-red-800'
                  }`}>
                    {match.halfTime || (match.currentMinute ? `${match.currentMinute}'` : 'LIVE')}
                  </span>
                )}
              </div>

               <WatchLiveButton match={match} />
            </div>
          </div>
        )}
      </div>

      {/* Footer information */}
      <div className={`mt-4 pt-3 border-t text-sm flex items-center justify-between ${
        isDarkMode ? 'border-gray-700 text-gray-400' : 'border-gray-100 text-gray-500'
      }`}>
        <span className="truncate max-w-[60%]">{match.league}</span>
        <span className="truncate max-w-[40%]">{match.stage}</span>
      </div>
    </motion.div>
  )
}
