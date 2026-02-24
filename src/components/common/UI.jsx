import React, { useState, useEffect, useRef } from 'react'
import {
  Calendar as CalendarIcon,
  Clock,
  Play,
  Medal,
  Gamepad2
} from 'lucide-react'
import valorantIcon from '../../images/valorant.png'
import lolIcon from '../../images/lol.png'
import footballIcon from '../../images/football.png'
import pubgIcon from '../../images/pubg.png'
import tftIcon from '../../images/tft.png'
import cs2Icon from '../../images/csgo-4.svg'

// --- Lazy Image Component ------------------------------------------------
export const LazyImage = ({ src, alt, className = '', placeholder = null }) => {
  const [imageSrc, setImageSrc] = useState(placeholder)
  const [isLoading, setIsLoading] = useState(true)
  const imgRef = useRef(null)

  useEffect(() => {
    // If no src, don't load
    if (!src) {
      setIsLoading(false)
      return
    }

    // Create Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Start downloading image by setting real source
            setImageSrc(src)
            observer.unobserve(entry.target)
          }
        })
      },
      {
        // 400px margin means images will start loading well before they become visible,
        // making them appear instantly when scrolled into view.
        rootMargin: '400px', 
        threshold: 0.01,
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current)
      }
    }
  }, [src])

  if (!src) return <div className={`${className} bg-gray-500/10 rounded-full`} />

  const transparentGif = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='

  return (
    <img
      ref={imgRef}
      src={imageSrc || transparentGif}
      alt={alt}
      onLoad={() => {
        // Only mark as loaded if we aren't displaying the transparent gif
        if (imageSrc) setIsLoading(false)
      }}
      onError={() => setIsLoading(false)}
      className={`${className} ${isLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'} transition-all duration-300`}
    />
  )
}

// --- Styled Components ---------------------------------------------------
export const Button = ({ className = '', children, variant = 'default', size = 'default', isDarkMode = false, ...props }) => {
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
      ? 'bg-transparent hover:bg-gray-700/50 text-gray-300'
      : 'bg-transparent hover:bg-gray-100 text-gray-700',
    danger: 'bg-red-500 hover:bg-red-600 text-white border-0',
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    default: 'px-4 py-2 text-sm rounded-xl',
    lg: 'px-6 py-3 text-base rounded-xl',
  }

  return (
    <button
      {...props}
      className={`inline-flex items-center gap-2 font-medium shadow-sm outline-none transition-all duration-200 active:scale-95 ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  )
}

export const Input = ({ className = '', ...props }) => (
  <input
    {...props}
    className={`w-full rounded-xl border border-gray-200 bg-white/50 backdrop-blur px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 ${className}`}
  />
)

export const Select = ({ className = '', children, ...props }) => (
  <select
    {...props}
    className={`w-full rounded-xl border border-gray-200 bg-white/50 backdrop-blur px-4 py-2.5 text-sm outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 ${className}`}
  >
    {children}
  </select>
)

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    live: 'bg-red-50 text-red-700 border border-red-200 animate-pulse',
    upcoming: 'bg-blue-50 text-blue-700 border border-blue-200',
    finished: 'bg-green-50 text-green-700 border border-green-200',
    valorant: 'bg-red-50 text-red-700 border border-red-200',
    pubg: 'bg-orange-50 text-orange-700 border border-orange-200',
    lol: 'bg-blue-50 text-blue-700 border border-blue-200',
    tft: 'bg-purple-50 text-purple-700 border border-purple-200',
    football: 'bg-green-50 text-green-700 border border-green-200',
  }
  
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

// Status helpers
export const getStatusInfo = (status) => {
  switch (status) {
    case 'live': return { variant: 'live', label: 'LIVE', icon: Play }
    case 'finished': return { variant: 'finished', label: 'ENDED', icon: Medal }
    default: return { variant: 'upcoming', label: 'UPCOMING', icon: Clock }
  }
}

export const getGameInfo = (game) => {
  switch (game) {
    case 'valorant': return { variant: 'valorant', label: 'VALORANT', icon: valorantIcon, color: 'from-red-500 to-pink-500', isImage: true }
    case 'pubg': return { variant: 'pubg', label: 'PUBG', icon: pubgIcon, color: 'from-orange-500 to-yellow-500', isImage: true }
    case 'lol': return { variant: 'lol', label: 'LOL', icon: lolIcon, color: 'from-blue-500 to-cyan-500', isImage: true }
    case 'tft': return { variant: 'tft', label: 'TFT', icon: tftIcon, color: 'from-purple-500 to-indigo-500', isImage: true }
    case 'football': return { variant: 'football', label: 'BÓNG ĐÁ', icon: footballIcon, color: 'from-green-500 to-emerald-500', isImage: true }
    case 'cs2': return { variant: 'cs2', label: 'CS2', icon: cs2Icon, color: 'from-slate-600 to-gray-700', isImage: true }
    default: return { variant: 'default', label: game.toUpperCase(), icon: Gamepad2, color: 'from-gray-500 to-gray-600', isImage: false }
  }
}
