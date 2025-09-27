// Test script for API endpoints
// Run with: node test-api.js

const testFootballAPI = async () => {
  console.log('🏈 Testing Football API...');
  
  try {
    // Test competitions endpoint
    const competitionsResponse = await fetch('http://localhost:3000/api/football/competitions');
    console.log('Competitions status:', competitionsResponse.status);
    
    if (competitionsResponse.ok) {
      const competitions = await competitionsResponse.json();
      console.log('Competitions:', competitions);
    }
    
    // Test matches endpoint
    const matchesResponse = await fetch('http://localhost:3000/api/football/competitions/PL/matches?dateFrom=2025-09-26&dateTo=2025-09-28');
    console.log('Matches status:', matchesResponse.status);
    
    if (matchesResponse.ok) {
      const matches = await matchesResponse.json();
      console.log('Matches found:', matches.matches?.length || 0);
    } else {
      const error = await matchesResponse.text();
      console.error('Matches error:', error);
    }
    
  } catch (error) {
    console.error('Football API test failed:', error);
  }
};

const testLoLAPI = async () => {
  console.log('⚡ Testing LoL API...');
  
  try {
    const response = await fetch('http://localhost:3000/api/lol');
    console.log('LoL API status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('LoL API success:', !!data);
    } else {
      const error = await response.text();
      console.error('LoL API error:', error);
    }
    
  } catch (error) {
    console.error('LoL API test failed:', error);
  }
};

const testValorantAPI = async () => {
  console.log('🎯 Testing Valorant API...');
  
  try {
    const response = await fetch('http://localhost:3000/api/valorant?q=live_score');
    console.log('Valorant API status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Valorant API success:', !!data);
    } else {
      const error = await response.text();
      console.error('Valorant API error:', error);
    }
    
  } catch (error) {
    console.error('Valorant API test failed:', error);
  }
};

// Run tests
const runTests = async () => {
  console.log('🧪 Starting API Tests...\n');
  
  await testFootballAPI();
  console.log('');
  
  await testLoLAPI();
  console.log('');
  
  await testValorantAPI();
  console.log('');
  
  console.log('✅ Tests completed!');
};

// Check if running as script
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}

export { testFootballAPI, testLoLAPI, testValorantAPI };