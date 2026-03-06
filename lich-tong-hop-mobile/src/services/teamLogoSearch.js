
// --- Team Logo Search Service --------------------------------------------
export const TeamLogoSearchService = {
  // Cache to store team logo search results to avoid repeated API calls
  cache: new Map(),
  
  // Configuration
  config: {
    enabled: false, // TẮT tính năng tìm logo tạm thời
    maxCacheSize: 100, // Maximum number of cached results
    searchTimeout: 10000, // 10 seconds timeout for search requests
  },
  
  // Search for team logo using Google Custom Search API
  async searchTeamLogo(teamName, sport) {
    if (!teamName || !this.config.enabled) return null
    
    // Create cache key
    const cacheKey = `${sport}-${teamName.toLowerCase().trim()}`
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cachedResult = this.cache.get(cacheKey)
      return cachedResult
    }
    
    try {
      
      // Clean team name for better search results
      const cleanTeamName = teamName
        .replace(/\s*(Gaming|Esports|E-sports|Team|Club|FC|United)$/i, '')
        .trim()
      
      // Call our image search API with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.config.searchTimeout)
      
      const response = await fetch(`/api/image-search?teamName=${encodeURIComponent(cleanTeamName)}&sport=${encodeURIComponent(sport)}`, {
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`Search API error: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Extract the best logo URL from search results
      let logoUrl = null
      if (data.images && data.images.length > 0) {
        // Prefer images with smaller dimensions (likely logos) and from official sources
        const bestImage = data.images.find(img => {
          const domain = img.displayLink?.toLowerCase() || ''
          const isOfficialSource = domain.includes('liquipedia') || 
                                 domain.includes('vlr.gg') || 
                                 domain.includes('leaguepedia') ||
                                 domain.includes('lolesports') ||
                                 domain.includes('valorant') ||
                                 domain.includes('riotgames') ||
                                 domain.includes('fifa.com') ||
                                 domain.includes('uefa.com')
          
          const hasGoodDimensions = img.width && img.height && 
                                  img.width >= 64 && img.height >= 64 &&
                                  img.width <= 512 && img.height <= 512
          
          return isOfficialSource || hasGoodDimensions
        }) || data.images[0] // Fall back to first result
        
        logoUrl = bestImage.url
      }
      
      // Cache the result (even if null to avoid repeated failed searches)
      this.addToCache(cacheKey, logoUrl)
      
      return logoUrl
      
    } catch (error) {
      
      // Cache null result to avoid repeated failed searches
      this.addToCache(cacheKey, null)
      return null
    }
  },
  
  // Enhanced cache management with size limit
  addToCache(key, value) {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.config.maxCacheSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    
    this.cache.set(key, value)
  },
  
  // Enhance team object with logo if missing
  async enhanceTeamWithLogo(team, sport) {
    // Return early if feature is disabled
    if (!this.config.enabled) {
      return team
    }
    
    if (!team || !team.name || team.logo) {
      return team // Already has logo or no team name
    }
    
    const logoUrl = await this.searchTeamLogo(team.name, sport)
    return {
      ...team,
      logo: logoUrl || team.logo
    }
  },
  
  // Clear cache (useful for testing or memory management)
  clearCache() {
    this.cache.clear()
  },
  
  // Get cache statistics
  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.config.maxCacheSize,
      enabled: this.config.enabled
    }
  }
}
