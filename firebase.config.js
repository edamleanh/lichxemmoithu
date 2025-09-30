// Cấu hình Firebase cho dự án
export const firebaseConfig = {
  apiKey: "AIzaSyCfBIsyq2N5mFDJwmcu-ISUs4cKIMlUwn4",
  authDomain: "lickxemmoithu.firebaseapp.com",
  projectId: "lickxemmoithu",
  storageBucket: "lickxemmoithu.firebasestorage.app",
  messagingSenderId: "1068842530441",
  appId: "1:1068842530441:web:be4f3432ae9cd24ae3f858",
  measurementId: "G-MWTMBCQ677"
};

// Lưu ý: 
// 1. Bạn cần cập nhật các thông tin sau từ Firebase Console:
//    - authDomain: thường là projectId.firebaseapp.com
//    - projectId: ID dự án Firebase của bạn
//    - storageBucket: thường là projectId.appspot.com
//    - messagingSenderId: Sender ID từ Project Settings
//    - appId: App ID từ Project Settings
//
// 2. Để lấy thông tin chính xác:
//    - Vào https://console.firebase.google.com
//    - Chọn dự án của bạn
//    - Vào Project Settings (⚙️ icon)
//    - Scroll xuống phần "Your apps"
//    - Click "Config" để xem thông tin cấu hình
//
// 3. Đảm bảo đã bật Firestore Database:
//    - Vào Firestore Database trong Firebase Console
//    - Click "Create database"
//    - Chọn "Start in test mode" hoặc cấu hình security rules
//    - Chọn location gần với người dùng (asia-southeast1 cho Việt Nam)