// Test script for Liquipedia API
import fetch from 'node-fetch';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const zlib = require('zlib');

async function testLiquipediaAPI() {
  try {
    console.log('🔍 Testing Liquipedia API...\n');
    
    // Test basic API access with required headers
    const response = await fetch('https://liquipedia.net/valorant/api.php?action=query&format=json&list=categorymembers&cmtitle=Category:Tournaments&cmlimit=5', {
      headers: {
        'Accept-Encoding': 'gzip',
        'User-Agent': 'EsportsCalendar/1.0 (https://github.com/edamleanh/lichxemmoithu; contact@esportscalendar.com)'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());
    
    if (response.ok) {
      const data = await response.json();
      console.log('Success! Sample data:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Test specific tournament page
async function testTournamentPage() {
  try {
    console.log('\n🎯 Testing specific tournament page...\n');
    
    const response = await fetch('https://liquipedia.net/valorant/api.php?action=parse&format=json&page=VALORANT_Champions_Tour/2025', {
      headers: {
        'Accept-Encoding': 'gzip',
        'User-Agent': 'EsportsCalendar/1.0 (https://github.com/edamleanh/lichxemmoithu; contact@esportscalendar.com)'
      }
    });
    
    console.log('Tournament page status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Tournament data structure:', Object.keys(data));
      if (data.parse) {
        console.log('Parse structure:', Object.keys(data.parse));
      }
    } else {
      const errorText = await response.text();
      console.log('Error:', errorText);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run tests
await testLiquipediaAPI();
await testTournamentPage();