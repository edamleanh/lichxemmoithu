// Test script để kiểm tra Firebase cache hoạt động
// Chạy: node test-firebase-cache.js (cần cài node-fetch: npm install node-fetch)

import fetch from 'node-fetch';

async function testCache() {
  const baseUrl = 'https://your-vercel-url.vercel.app'; // Thay đổi URL này
  const endpoint = '/api/football/competitions/PL/matches';
  const params = '?dateFrom=2024-01-01&dateTo=2024-12-31';
  
  console.log('🧪 Testing Firebase Cache...\n');
  
  // Test 1: Lần đầu gọi (sẽ gọi external API)
  console.log('📞 Test 1: Lần đầu gọi API...');
  const start1 = Date.now();
  try {
    const response1 = await fetch(baseUrl + endpoint + params);
    const data1 = await response1.json();
    const time1 = Date.now() - start1;
    
    console.log(`✅ Thành công! Thời gian: ${time1}ms`);
    console.log(`📊 Số trận đấu: ${data1.matches?.length || 0}`);
    console.log('💾 Dữ liệu đã được lưu vào Firestore\n');
  } catch (error) {
    console.log(`❌ Lỗi: ${error.message}\n`);
    return;
  }
  
  // Đợi 2 giây
  console.log('⏱️  Đợi 2 giây...\n');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 2: Lần thứ 2 gọi (sẽ lấy từ cache)
  console.log('📞 Test 2: Lần thứ 2 gọi API...');
  const start2 = Date.now();
  try {
    const response2 = await fetch(baseUrl + endpoint + params);
    const data2 = await response2.json();
    const time2 = Date.now() - start2;
    
    console.log(`✅ Thành công! Thời gian: ${time2}ms`);
    console.log(`📊 Số trận đấu: ${data2.matches?.length || 0}`);
    
    if (time2 < time1 * 0.5) {
      console.log('🚀 Cache hoạt động! (Lần 2 nhanh hơn đáng kể)');
    } else {
      console.log('⚠️  Có thể cache chưa hoạt động (thời gian tương tự lần 1)');
    }
    
  } catch (error) {
    console.log(`❌ Lỗi: ${error.message}`);
  }
}

// Chạy test
testCache().catch(console.error);

// Hướng dẫn sử dụng:
// 1. Cài node-fetch: npm install node-fetch
// 2. Thay đổi baseUrl thành URL Vercel của bạn
// 3. Chạy: node test-firebase-cache.js
// 4. Quan sát thời gian response để xác nhận cache hoạt động