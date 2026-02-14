import React from 'react'
import { motion } from 'framer-motion'
import {
  Gamepad2,
} from 'lucide-react'
import valorantIcon from '../../images/valorant.png'
import lolIcon from '../../images/lol.png'
import footballIcon from '../../images/football.png'
import pubgIcon from '../../images/pubg.png'
import tftIcon from '../../images/tft.png'

export function FilterBar({ activeSport, setActiveSport, isDarkMode }) {
  const sports = [
    { id: 'all', label: 'Tất cả', icon: Gamepad2, color: 'from-gray-500 to-gray-600', isImage: false },
    { id: 'valorant', label: 'Valorant', icon: valorantIcon, color: 'from-red-500 to-pink-500', isImage: true },
    { id: 'lol', label: 'LoL', icon: lolIcon, color: 'from-blue-500 to-cyan-500', isImage: true },
    { id: 'football', label: 'Bóng đá', icon: footballIcon, color: 'from-green-500 to-emerald-500', isImage: true },
    { id: 'pubg', label: 'PUBG', icon: pubgIcon, color: 'from-orange-500 to-yellow-500', isImage: true },
    { id: 'tft', label: 'TFT', icon: tftIcon, color: 'from-purple-500 to-indigo-500', isImage: true },
  ]

  return (
    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
      {sports.map((sport) => {
        const Icon = sport.icon
        const isActive = activeSport === sport.id
        
        return (
          <button
            key={sport.id}
            onClick={() => setActiveSport(sport.id)}
            className={`
              relative flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all duration-300
              ${isActive 
                ? 'text-white shadow-lg scale-105' 
                : isDarkMode 
                  ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }
            `}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className={`absolute inset-0 rounded-xl bg-gradient-to-r ${sport.color}`}
              />
            )}
            
            <span className="relative z-10 flex items-center gap-2 font-medium">
              {sport.isImage ? (
                <img src={sport.icon} alt={sport.label} className="w-4 h-4 object-contain" />
              ) : (
                <Icon className="w-4 h-4" />
              )}
              {sport.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
