# Hướng dẫn cấu hình Firebase cho Football API Cache

## Bước 1: Tạo dự án Firebase

1. Truy cập https://console.firebase.google.com
2. Click "Add project" hoặc "Tạo dự án"
3. Nhập tên dự án (ví dụ: "lichxemmoithu")
4. Bỏ chọn Google Analytics nếu không cần
5. Click "Create project"

## Bước 2: Bật Firestore Database

1. Trong Firebase Console, chọn "Firestore Database" từ menu bên trái
2. Click "Create database"
3. Chọn "Start in test mode" (cho development)
4. Chọn location: `asia-southeast1` (Singapore - gần Việt Nam nhất)
5. Click "Done"

## Bước 3: Lấy thông tin cấu hình

1. Click vào icon ⚙️ (Project Settings) ở menu bên trái
2. Scroll xuống phần "Your apps"
3. Click "Add app" → chọn "Web" (</>) 
4. Nhập app name (ví dụ: "football-cache")
5. Click "Register app"
6. Copy thông tin config hiển thị

## Bước 4: Cập nhật thông tin trong code

Thay đổi các giá trị sau trong file `api/football.js`:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyCfBIsyq2N5mFDJwmcu-ISUs4cKIMlUwn4", // GIỮ NGUYÊN
  authDomain: "TÊN_DỰ_ÁN.firebaseapp.com", // Thay đổi TÊN_DỰ_ÁN
  projectId: "TÊN_DỰ_ÁN", // Thay đổi TÊN_DỰ_ÁN  
  storageBucket: "TÊN_DỰ_ÁN.appspot.com", // Thay đổi TÊN_DỰ_ÁN
  messagingSenderId: "SỐ_SENDER_ID", // Từ Firebase Console
  appId: "APP_ID_TỪ_FIREBASE" // Từ Firebase Console
};
```

## Bước 5: Cấu hình Security Rules (Tùy chọn)

Nếu muốn bảo mật hơn, vào Firestore → Rules và thay đổi:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Chỉ cho phép đọc/ghi collection footballCache
    match /footballCache/{document} {
      allow read, write: if true;
    }
    // Từ chối tất cả các collection khác
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Bước 6: Test

Sau khi cấu hình xong:
1. Deploy code lên Vercel
2. Gọi API football lần đầu - sẽ gọi external API và lưu cache
3. Gọi API football lần thứ 2 - sẽ lấy từ cache nếu chưa đến thời gian trận đấu sớm nhất
4. Kiểm tra Firestore Console để xem dữ liệu đã được lưu

## Cách hoạt động của cache:

1. **Lần đầu gọi API**: Dữ liệu được lấy từ football-data.org và lưu vào Firestore
2. **Các lần sau**: Kiểm tra thời gian trận đấu sớm nhất
   - Nếu thời gian hiện tại < thời gian trận đấu sớm nhất: Lấy từ cache
   - Nếu thời gian hiện tại >= thời gian trận đấu sớm nhất: Gọi API mới và cập nhật cache

## Lợi ích:

- ✅ Giảm số lần gọi API external (tiết kiệm quota)
- ✅ Tăng tốc độ response (cache nhanh hơn API external)
- ✅ Tự động cập nhật khi có trận đấu mới
- ✅ Không cần manual refresh cache
