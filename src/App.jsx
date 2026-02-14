import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, Search, Sun, Moon, RefreshCw, Menu, X, Calendar as CalendarIcon, ChevronDown, ChevronUp } from 'lucide-react'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'

// Import components
import MobileLayout from './components/MobileLayout'
import { Button, Input, Select, Badge } from './components/common/UI'
import { MatchCard } from './components/features/MatchCard'
import { FilterBar } from './components/features/FilterBar'
import { useIsMobile } from './hooks/useIsMobile'

// Import services and utils
import { ValorantAdapter } from './services/valorant'
import { LolAdapter } from './services/lol'
import { FootballAdapter } from './services/football'
import { PubgAdapter } from './services/pubg'
import { TftAdapter } from './services/tft'
import { fmtDay } from './utils/formatters'

import './App.css'

// Initialize QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
})

// Service adapters map
const adapters = {
  valorant: ValorantAdapter,
  lol: LolAdapter,
  football: FootballAdapter,
  pubg: PubgAdapter,
  tft: TftAdapter,
}

// --- Main Content Component -----------------------------------------------
// --- Main Content Component -----------------------------------------------
function MainContent() {
  const isMobile = useIsMobile()
  const [activeSport, setActiveSport] = useState('all')
  // dateFilter removed, always 'today'
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Toggle Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  // Date range calculation - Always Today
  const dateRange = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    return { 
      from: today, 
      // End of today
      to: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1) 
    }
  }, [])

  // Fetch matches using TanStack Query
  const { data: matches = [], isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['matches', activeSport, 'today'], // Hardcoded 'today'
    queryFn: async () => {
      let allMatches = []
      
      const standardFrom = dateRange.from
      const standardTo = dateRange.to
      
      // Extended range for YouTube-based games (PUBG, TFT)
      // because they might not have exact schedule data often
      const extendedFrom = new Date(standardFrom)
      extendedFrom.setDate(extendedFrom.getDate() - 1)
      const extendedTo = new Date(standardTo)
      extendedTo.setDate(extendedTo.getDate() + 2)

      if (activeSport === 'all') {
        const results = await Promise.allSettled([
          adapters.valorant.fetch({ from: standardFrom, to: standardTo }),
          adapters.pubg.fetch({ from: extendedFrom, to: extendedTo }),
          adapters.tft.fetch({ from: extendedFrom, to: extendedTo }),
          adapters.lol.fetch({ from: standardFrom, to: standardTo }),
          adapters.football.fetch({ from: standardFrom, to: standardTo }),
        ])
        
        results.forEach((result) => {
          if (result.status === 'fulfilled') {
            allMatches = [...allMatches, ...result.value]
          }
        })
      } else {
        const adapter = adapters[activeSport]
        if (adapter) {
          const from = (activeSport === 'pubg' || activeSport === 'tft') ? extendedFrom : standardFrom
          const to = (activeSport === 'pubg' || activeSport === 'tft') ? extendedTo : standardTo
          allMatches = await adapter.fetch({ from, to })
        }
      }
      
      // Sort matches: LIVE first, then UPCOMING, then FINISHED
      return allMatches.sort((a, b) => {
        const getPriority = (status) => {
          if (status === 'live') return 0
          if (status === 'upcoming') return 1
          return 2 // finished
        }

        const aPriority = getPriority(a.status)
        const bPriority = getPriority(b.status)
        
        if (aPriority !== bPriority) {
          return aPriority - bPriority
        }
        
        // If same priority, sort by time
        // For Finished matches, sort descending (most recent first)
        if (a.status === 'finished') {
          return new Date(b.start) - new Date(a.start)
        }
        // For Live and Upcoming, sort ascending (soonest first)
        return new Date(a.start) - new Date(b.start)
      })
    }
  })

  // Mobile Layout Render
  if (isMobile) {
    return (
      <MobileLayout 
        matches={matches} 
        loading={isLoading} 
        error={error} 
        refetch={refetch}
        activeSport={activeSport}
        setActiveSport={setActiveSport}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />
    )
  }

  // Desktop Layout Render
  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full blur-[100px] opacity-20 ${
          isDarkMode ? 'bg-blue-600' : 'bg-blue-400'
        }`} />
        <div className={`absolute top-[40%] -left-[10%] w-[40%] h-[40%] rounded-full blur-[100px] opacity-20 ${
          isDarkMode ? 'bg-purple-600' : 'bg-purple-400'
        }`} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              ESPORTS CALENDAR
            </h1>
            <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Theo dõi lịch thi đấu & kết quả trực tiếp
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              isDarkMode={isDarkMode}
              onClick={refetch}
              className={isFetching ? 'animate-spin' : ''}
              title="Cập nhật dữ liệu"
            >
              <RefreshCw className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              isDarkMode={isDarkMode}
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </header>

        {/* Filters and Controls */}
        <div className="sticky top-4 z-40 mb-8 space-y-4">
          <div className={`p-4 rounded-2xl shadow-lg backdrop-blur-md border transition-all ${
            isDarkMode 
              ? 'bg-gray-800/80 border-gray-700/50' 
              : 'bg-white/80 border-gray-200/50'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <FilterBar 
                activeSport={activeSport} 
                setActiveSport={setActiveSport} 
                isDarkMode={isDarkMode}
              />
              
              {/* Date Filter Removed */}
            </div>
          </div>
        </div>

        {/* Matches Grid */}
        <AnimatePresence mode="wait">
          {isLoading && !matches.length ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Đang tải dữ liệu...</p>
            </motion.div>
          ) : error ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <div className="mb-4 text-red-500 bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <X className="w-8 h-8" />
              </div>
              <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Đã có lỗi xảy ra
              </h3>
              <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {error.message || 'Không thể tải dữ liệu trận đấu'}
              </p>
              <Button onClick={refetch} variant="primary">
                Thử lại
              </Button>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {matches.length === 0 ? (
                <div className="text-center py-20">
                  <div className={`mb-4 w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                    isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <CalendarIcon className="w-8 h-8" />
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Không có trận đấu nào
                  </h3>
                  <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Không tìm thấy trận đấu nào trong khoảng thời gian này
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {matches.map((match) => (
                    <MatchCard 
                      key={match.id} 
                      match={match} 
                      isDarkMode={isDarkMode} 
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MainContent />
    </QueryClientProvider>
  )
}

export default App
