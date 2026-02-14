// YouTube API Key Manager with fallback support
export const YouTubeAPIManager = {
  // Array of API keys - add your API keys here
  apiKeys: [
    'AIzaSyCZHYPprCcGOwLFrt1jGbtiKlvuVJtgoRY',
    'AIzaSyDo77udI07ntgKZ7uBqeDo2NavY9199TPE',
    'AIzaSyC4ktJ7bCFJp30sFmHIggs4vgvXklny294', 
    'AIzaSyCHmBLPsIMhKJpxuOVGWK5OSHrwsIvRQbI', 
    'AIzaSyBd8I64KQA5fS_eQEDh5kpMM4416R3arrc', 
    
  ],
  
  currentKeyIndex: 0,
  
  // Get current active API key
  getCurrentKey() {
    return this.apiKeys[this.currentKeyIndex]
  },
  
  // Switch to next available API key
  switchToNextKey() {
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length
    const newKey = this.getCurrentKey()
    return newKey
  },
  
  // Check if we've tried all keys
  hasMoreKeys() {
    return this.currentKeyIndex < this.apiKeys.length - 1
  },
  
  // Reset to first key
  resetToFirstKey() {
    this.currentKeyIndex = 0
  },
  
  // Make request with fallback to other keys
  async makeRequest(url, retryCount = 0) {
    const currentKey = this.getCurrentKey()
    const fullUrl = url.includes('key=') ? url : `${url}&key=${currentKey}`
    
    try {
      const response = await fetch(fullUrl)
      
      if (response.ok) {
        const data = await response.json()
        return data
      } else if (response.status === 403 && this.hasMoreKeys() && retryCount < this.apiKeys.length) {
        this.switchToNextKey()
        return this.makeRequest(url, retryCount + 1)
      } else {
        return null // Return null for failed requests
      }
    } catch (error) {
      if (this.hasMoreKeys() && retryCount < this.apiKeys.length) {
        this.switchToNextKey()
        return this.makeRequest(url, retryCount + 1)
      } else {
        return null
      }
    }
  }
}

// Helper function to check YouTube API health and provide debugging info
export const checkYouTubeAPIHealth = async (apiKey) => {
  try {
    const testResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?` +
      `part=snippet&q=test&type=video&maxResults=1&key=${apiKey}`
    )
    
    const data = await testResponse.json()
    
    if (!testResponse.ok) {
      console.error('❌ YOUTUBE API HEALTH CHECK FAILED:', {
        status: testResponse.status,
        statusText: testResponse.statusText,
        error: data.error
      })
      return false
    }
    
    console.log('✅ YOUTUBE API HEALTH CHECK PASSED')
    return true
  } catch (error) {
    console.error('❌ YOUTUBE API NETWORK ERROR:', error)
    return false
  }
}

// Create alias for easier access
export const youtubeApiManager = YouTubeAPIManager
