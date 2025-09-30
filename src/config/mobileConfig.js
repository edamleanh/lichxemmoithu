// Mobile Configuration
// Different settings and behaviors for mobile vs desktop

export const mobileConfig = {
  // Layout settings
  layout: {
    headerHeight: 64,
    cardPadding: 12,
    sectionGap: 12,
    maxCardsPerPage: 20,
    enableInfiniteScroll: true,
    compactMode: true
  },
  
  // Animation settings - reduced for better mobile performance
  animations: {
    duration: 200,
    easing: 'ease-out',
    reduceMotion: true,
    enableHover: false, // Disable hover effects on mobile
    enableParallax: false
  },
  
  // Typography settings
  typography: {
    titleSize: 'text-lg',
    subtitleSize: 'text-sm',
    captionSize: 'text-xs',
    lineHeight: 'leading-tight'
  },
  
  // Button settings
  buttons: {
    size: 'sm',
    minTouchTarget: 44, // Minimum 44px for accessibility
    spacing: 8
  },
  
  // Navigation settings
  navigation: {
    enableQuickJump: true,
    enableBottomNav: false,
    stickyHeader: true,
    collapsibleSections: true,
    enableSwipeGestures: true
  },
  
  // Performance settings
  performance: {
    lazyLoading: true,
    imageOptimization: true,
    maxConcurrentRequests: 3,
    cacheTimeout: 300000, // 5 minutes
    enableServiceWorker: true
  },
  
  // UI/UX settings
  ui: {
    enableHapticFeedback: true,
    enablePullToRefresh: true,
    enableSwipeNavigation: true,
    showViewCount: true,
    compactMatchInfo: true,
    prioritizeLiveMatches: true
  },
  
  // Breakpoints
  breakpoints: {
    mobile: 768,
    mobileSm: 375,
    mobileXs: 320
  }
}

export const desktopConfig = {
  // Layout settings
  layout: {
    headerHeight: 120,
    cardPadding: 24,
    sectionGap: 32,
    maxCardsPerPage: -1, // No limit
    enableInfiniteScroll: false,
    compactMode: false
  },
  
  // Animation settings - full animations for desktop
  animations: {
    duration: 300,
    easing: 'ease-in-out',
    reduceMotion: false,
    enableHover: true,
    enableParallax: true
  },
  
  // Typography settings
  typography: {
    titleSize: 'text-xl',
    subtitleSize: 'text-base',
    captionSize: 'text-sm',
    lineHeight: 'leading-relaxed'
  },
  
  // Button settings
  buttons: {
    size: 'default',
    minTouchTarget: 32,
    spacing: 12
  },
  
  // Navigation settings
  navigation: {
    enableQuickJump: true,
    enableBottomNav: false,
    stickyHeader: true,
    collapsibleSections: true,
    enableSwipeGestures: false
  },
  
  // Performance settings
  performance: {
    lazyLoading: false,
    imageOptimization: false,
    maxConcurrentRequests: 6,
    cacheTimeout: 600000, // 10 minutes
    enableServiceWorker: false
  },
  
  // UI/UX settings
  ui: {
    enableHapticFeedback: false,
    enablePullToRefresh: false,
    enableSwipeNavigation: false,
    showViewCount: true,
    compactMatchInfo: false,
    prioritizeLiveMatches: true
  }
}

// Function to get config based on device type
export const getConfig = (isMobile) => {
  return isMobile ? mobileConfig : desktopConfig
}

// Mobile-specific game configurations
export const mobileGameConfig = {
  // Different display priorities for mobile
  displayPriority: {
    live: 1,
    upcoming: 2,
    finished: 3
  },
  
  // Compact game info for mobile
  gameInfo: {
    valorant: {
      showRounds: false, // Hide round details on mobile
      showMap: true,
      maxTitleLength: 30
    },
    pubg: {
      showThumbnail: true,
      showViewCount: true,
      maxTitleLength: 40
    },
    tft: {
      showThumbnail: false, // Hide thumbnails on mobile for TFT
      showViewCount: true,
      maxTitleLength: 35
    },
    lol: {
      showCurrentGame: true,
      showBestOf: false, // Hide best of info on mobile
      maxTitleLength: 30
    },
    football: {
      showMinute: true,
      showReferee: false, // Hide referee on mobile
      maxTitleLength: 25
    }
  },
  
  // Mobile-specific card layouts
  cardLayouts: {
    valorant: 'vertical',
    pubg: 'media', // Show thumbnail prominently
    tft: 'compact',
    lol: 'vertical',
    football: 'compact'
  }
}

// Desktop-specific game configurations
export const desktopGameConfig = {
  displayPriority: {
    live: 1,
    upcoming: 2,
    finished: 3
  },
  
  gameInfo: {
    valorant: {
      showRounds: true,
      showMap: true,
      maxTitleLength: -1 // No limit
    },
    pubg: {
      showThumbnail: true,
      showViewCount: true,
      maxTitleLength: -1
    },
    tft: {
      showThumbnail: true,
      showViewCount: true,
      maxTitleLength: -1
    },
    lol: {
      showCurrentGame: true,
      showBestOf: true,
      maxTitleLength: -1
    },
    football: {
      showMinute: true,
      showReferee: true,
      maxTitleLength: -1
    }
  },
  
  cardLayouts: {
    valorant: 'horizontal',
    pubg: 'media',
    tft: 'horizontal',
    lol: 'horizontal',
    football: 'horizontal'
  }
}

// Function to get game config based on device type
export const getGameConfig = (isMobile) => {
  return isMobile ? mobileGameConfig : desktopGameConfig
}

// Device detection utilities
export const deviceUtils = {
  // Check if device supports touch
  isTouchDevice: () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  },
  
  // Check if device is in landscape mode
  isLandscape: () => {
    return window.innerWidth > window.innerHeight
  },
  
  // Get device pixel ratio
  getPixelRatio: () => {
    return window.devicePixelRatio || 1
  },
  
  // Check if device has high DPI
  isHighDPI: () => {
    return window.devicePixelRatio > 1
  },
  
  // Get viewport dimensions
  getViewport: () => {
    return {
      width: window.innerWidth,
      height: window.innerHeight
    }
  },
  
  // Check if device supports PWA installation
  supportsPWA: () => {
    return 'serviceWorker' in navigator && 'PushManager' in window
  }
}

// Performance optimization utilities for mobile
export const mobileOptimizations = {
  // Debounce function for scroll events
  debounce: (func, wait) => {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  },
  
  // Throttle function for resize events
  throttle: (func, limit) => {
    let inThrottle
    return function() {
      const args = arguments
      const context = this
      if (!inThrottle) {
        func.apply(context, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  },
  
  // Lazy loading intersection observer
  createLazyLoader: (callback) => {
    if ('IntersectionObserver' in window) {
      return new IntersectionObserver(callback, {
        root: null,
        rootMargin: '50px',
        threshold: 0.1
      })
    }
    return null
  },
  
  // Reduce motion check
  prefersReducedMotion: () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }
}