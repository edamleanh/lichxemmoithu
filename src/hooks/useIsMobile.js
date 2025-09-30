import { useState, useEffect } from 'react'

// Custom hook to detect mobile devices
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => {
      // Check screen width
      const isSmallScreen = window.innerWidth < 768 // md breakpoint in Tailwind
      
      // Check user agent for mobile devices
      const userAgent = navigator.userAgent.toLowerCase()
      const mobileKeywords = [
        'android', 'webos', 'iphone', 'ipad', 'ipod', 
        'blackberry', 'iemobile', 'opera mini', 'mobile'
      ]
      const isMobileDevice = mobileKeywords.some(keyword => userAgent.includes(keyword))
      
      // Check for touch support
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      
      // Consider mobile if small screen OR mobile device OR touch device
      const mobile = isSmallScreen || isMobileDevice || isTouchDevice
      
      setIsMobile(mobile)
    }

    // Check on mount
    checkIsMobile()

    // Check on resize
    window.addEventListener('resize', checkIsMobile)
    
    // Check on orientation change (mobile specific)
    window.addEventListener('orientationchange', checkIsMobile)

    return () => {
      window.removeEventListener('resize', checkIsMobile)
      window.removeEventListener('orientationchange', checkIsMobile)
    }
  }, [])

  return isMobile
}

// Hook to get screen size info
export function useScreenSize() {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    isMobile: false,
    isTablet: false,
    isDesktop: false
  })

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      setScreenSize({
        width,
        height,
        isMobile: width < 768,        // Less than md
        isTablet: width >= 768 && width < 1024,  // md to lg
        isDesktop: width >= 1024      // lg and above
      })
    }

    updateScreenSize()
    window.addEventListener('resize', updateScreenSize)

    return () => window.removeEventListener('resize', updateScreenSize)
  }, [])

  return screenSize
}

// Hook for responsive breakpoints
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState('mobile')

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth
      
      if (width < 640) {
        setBreakpoint('mobile')      // Less than sm
      } else if (width < 768) {
        setBreakpoint('sm')          // sm
      } else if (width < 1024) {
        setBreakpoint('md')          // md
      } else if (width < 1280) {
        setBreakpoint('lg')          // lg
      } else {
        setBreakpoint('xl')          // xl and above
      }
    }

    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)

    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])

  return breakpoint
}