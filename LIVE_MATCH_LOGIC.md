# Logic Cache với Live Match Detection

## 🔴 Trần đấu LIVE - Luôn cập nhật

### Khi nào API được gọi:

1. **🚨 Có trận đấu đang LIVE**: 
   - Status: `IN_PLAY` hoặc `LIVE`
   - **LUÔN gọi API** để cập nhật tỷ số real-time
   - Không quan tâm đến cache time

2. **⏰ Cache cũ hơn 5 phút**:
   - Gọi API để kiểm tra trận live mới có thể bắt đầu
   - Đảm bảo không bỏ sót trận đấu mới

3. **📅 Đến thời gian trận sắp tới**:
   - Thời gian hiện tại >= thời gian trận đấu sớm nhất
   - Logic cũ vẫn hoạt động

4. **🆕 Không có cache**:
   - Lần đầu gọi API

### Khi nào sử dụng cache:

- ✅ Không có trận live
- ✅ Cache mới hơn 5 phút  
- ✅ Chưa đến thời gian trận sắp tới

## 📊 Dữ liệu được lưu trong cache:

```javascript
{
  data: { matches: [...] },           // Dữ liệu trận đấu
  lastUpdated: "2024-01-01T10:00:00Z", // Thời gian cập nhật
  nextEarliestMatch: "2024-01-01T15:00:00Z", // Trận sắp tới
  hasLiveMatches: true,               // Có trận live không
  liveMatchCount: 2,                  // Số trận live
  competition: "PL",                  // Giải đấu
  dateFrom: "2024-01-01",            // Từ ngày
  dateTo: "2024-01-31"               // Đến ngày
}
```

## 🔄 Flow hoạt động:

```
Request → Check Cache → Has Live Matches? 
                    ↓
                   YES → Call API → Update Cache → Return Data
                    ↓
                   NO → Cache > 5min old?
                    ↓
                   YES → Call API → Update Cache → Return Data  
                    ↓
                   NO → Time >= Next Match?
                    ↓
                   YES → Call API → Update Cache → Return Data
                    ↓
                   NO → Return Cached Data
```

## ⚡ Performance Benefits:

- **Live matches**: Tỷ số cập nhật real-time
- **Upcoming matches**: Chỉ gọi API khi cần thiết
- **Finished matches**: Cache lâu dài, hiệu suất cao

## 🧪 Test Cases:

### Case 1: Có trận live
```bash
curl "/api/football/competitions/PL/matches?dateFrom=2024-01-01&dateTo=2024-01-31"
# → Luôn gọi API (dù có cache)
```

### Case 2: Không có trận live, cache mới
```bash
# Lần 1: Gọi API, lưu cache
# Lần 2 (trong 5 phút): Dùng cache
# Lần 3 (sau 5 phút): Gọi API kiểm tra live mới
```

### Case 3: Đến giờ trận sắp tới
```bash
# Current time >= earliest match time → Gọi API
```

## 🚀 Lợi ích:

1. **Real-time updates**: Trận live luôn có tỷ số mới nhất
2. **Efficient caching**: Không gọi API không cần thiết  
3. **Auto detection**: Tự động phát hiện trận live mới
4. **Smart refresh**: Chỉ refresh khi có thay đổi thực sự

## ⚠️ Lưu ý:

- API có rate limit, nhưng trận live ưu tiên cao hơn
- Cache 5 phút đảm bảo balance giữa performance và freshness
- Live match detection dựa trên status từ football-data.org