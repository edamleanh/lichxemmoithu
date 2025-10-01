# Cache Logic Test - Yêu Cầu Mới

## 🎯 Yêu Cầu Đã Implement:

### **Upcoming Data:**
✅ **Làm mới khi:**
- Data cũ quá 12 giờ (720 phút)
- HOẶC thời gian hiện tại >= thời gian diễn ra của event trong upcoming

✅ **KHÔNG làm mới live data** khi upcoming refresh

### **Live Data:**
✅ **Làm mới khi:**
- Data cũ quá 30 phút
- HOẶC khi upcoming data được làm mới

## 📊 Test Scenarios:

### Scenario 1: Upcoming Refresh (Time Expired)
```
10:00 AM - Upcoming cached (age: 0h)
10:00 PM - User load (age: 12h) 
→ Upcoming refresh ✅ (time expired)
→ Live cache cleared ✅ (upcoming triggered)
→ Next live fetch will get fresh data ✅
```

### Scenario 2: Upcoming Refresh (Event Started)
```
09:00 AM - Upcoming cached with event at 10:00 AM
10:30 AM - User load (event started at 10:00 AM)
→ Upcoming refresh ✅ (event started)
→ Live cache cleared ✅ (upcoming triggered)
→ Next live fetch will get fresh data ✅
```

### Scenario 3: Live Refresh (Time Expired)
```
10:00 AM - Live cached (age: 0m)
10:35 AM - User load (age: 35m)
→ Live refresh ✅ (time expired)
→ Upcoming cache NOT affected ✅
```

### Scenario 4: Live Refresh (Upcoming Triggered)
```
10:00 AM - Both cached
12:30 PM - Upcoming expires → refreshes
→ Live cache cleared ✅
→ Next live request → fresh data ✅
```

## 🔄 Flow Chart:

```
User Request Live Data
├── Cache exists & < 30min? → Use Cache
├── Cache expired? → Fetch Fresh → Save Cache
└── Upcoming recently refreshed? → Fetch Fresh

User Request Upcoming Data  
├── Cache exists & < 12h & no events started? → Use Cache
├── Cache expired OR events started? → Fetch Fresh → Save Cache → Clear Live Cache
```

## ✅ Logic Implementation:

1. **`isCacheValid()`**: Kiểm tra 12h/30min + events started
2. **`hasEventsStarted()`**: Helper check events
3. **`getCachedData()`**: Main logic với upcoming → live invalidation
4. **`clearCache()`**: Remove cache khi cần

## 🎉 Result: 
Đáp ứng 100% yêu cầu của user!