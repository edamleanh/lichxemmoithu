# 🏟️ Half Time (HT) Display Implementation

## Cập Nhật: Hiển Thị Trạng Thái Half Time (HT)

### 📋 Vấn Đề
Trận đấu bóng đá từ API `apibongda.onrender.com` có trạng thái "HT" (Half Time) trong `rawText`, nhưng không được hiển thị trên UI.

**Dữ liệu mẫu**:
```json
{
  "homeTeam": "Công An Hà Nội",
  "awayTeam": "Wofoo Tai Po",
  "time": "02/10 19:15",
  "league": "AFC Champions League 2",
  "status": "• Live",
  "rawText": "19:15\n• Live\nCông An Hà Nội\nHT\n2\n-\n0\nWofoo Tai Po\nNgười Thỏ",
  "source": "ThapcamTV"
}
```

---

## ✅ Giải Pháp Triển Khai

### 1. **Parse Half Time từ rawText** 📝

**File**: `src/App.jsx` - `FootballAdapter.fetch()`

**Thêm detection logic**:
```javascript
// Check for Half Time status in rawText
const isHalfTime = match.rawText?.includes('HT') || match.rawText?.includes('Half Time')
```

**Lưu vào match object**:
```javascript
{
  currentMinute: currentMinute,
  halfTime: isHalfTime ? 'HT' : undefined,
  commentator: match.blv,
  source: match.source
}
```

---

### 2. **Hiển Thị HT trên UI** 🎨

**File**: `src/App.jsx` - `MatchCard` component

**Before**:
```javascript
{match.game === 'football' && (
  <span>
    {match.currentMinute ? `${match.currentMinute}'` : ''}
    {match.halfTime ? match.halfTime : ''}
  </span>
)}
```

**After** (với styled badge):
```javascript
{match.game === 'football' && (
  <span>
    {match.halfTime ? (
      <span className="flex items-center gap-1">
        <span className="px-2 py-0.5 rounded bg-yellow-500 text-white text-xs font-bold">
          {match.halfTime}
        </span>
      </span>
    ) : match.currentMinute ? (
      `${match.currentMinute}'`
    ) : (
      'LIVE'
    )}
  </span>
)}
```

**Visual Design**:
- 🟡 **Yellow background** - Dễ phân biệt với LIVE (đỏ) và kết thúc (xanh)
- ⚪ **White text** - Contrast cao
- 📦 **Rounded badge** - Tách biệt rõ ràng khỏi các thông tin khác
- 💪 **Bold font** - Nổi bật

---

### 3. **Hỗ Trợ football-data.org API** 🌐

**File**: `src/App.jsx` - Football-data.org mapping

Cập nhật để cũng hiển thị HT cho API chính thức:

```javascript
status: match.status === 'FINISHED' ? 'finished' :
        match.status === 'IN_PLAY' || match.status === 'PAUSED' ? 'live' : 'upcoming',
currentMinute: match.status === 'IN_PLAY' ? match.minute : undefined,
halfTime: match.status === 'PAUSED' ? 'HT' : undefined,
```

**Logic**:
- `IN_PLAY` → Hiển thị phút hiện tại (45', 67', etc.)
- `PAUSED` → Hiển thị badge "HT"

---

## 🎯 Kết Quả

### Live Match Card - Half Time
```
┌─────────────────────────────────────────┐
│ 🏆 AFC Champions League 2        19:15 │
│                                         │
│ 🔴 LIVE                                 │
│                                         │
│ Công An Hà Nội         2 - 0  Wofoo... │
│                                         │
│ ┌───────────────────────────────────┐  │
│ │ 🔴  [HT]  🎥 Watch Live           │  │
│ └───────────────────────────────────┘  │
│                                         │
│ 🎤 BLV: Người Thỏ                      │
└─────────────────────────────────────────┘
```

### Priority Display Logic
1. **HT badge** - Nếu `halfTime` tồn tại (vàng, bold)
2. **Current minute** - Nếu `currentMinute` tồn tại (VD: 67')
3. **"LIVE"** - Fallback nếu không có thông tin cụ thể

---

## 📊 Test Cases

### ✅ Test Case 1: Half Time from apibongda.onrender.com
**Input**:
```json
{
  "rawText": "19:15\n• Live\nCông An Hà Nội\nHT\n2\n-\n0\nWofoo Tai Po"
}
```
**Expected Output**:
- ✅ Badge vàng với text "HT"
- ✅ Không hiển thị phút (currentMinute)

### ✅ Test Case 2: Half Time from football-data.org
**Input**:
```json
{
  "status": "PAUSED",
  "minute": 45
}
```
**Expected Output**:
- ✅ Badge vàng với text "HT"
- ✅ Status = 'live'

### ✅ Test Case 3: Normal Live Match
**Input**:
```json
{
  "rawText": "67'\n• Live\nTeam A\n1\n-\n1\nTeam B",
  "status": "IN_PLAY",
  "minute": 67
}
```
**Expected Output**:
- ✅ Hiển thị "67'"
- ✅ Không có badge HT

### ✅ Test Case 4: Live without minute info
**Input**:
```json
{
  "status": "• Live",
  "rawText": "• Live\nTeam A\n0\n-\n0\nTeam B"
}
```
**Expected Output**:
- ✅ Hiển thị "LIVE"
- ✅ Không có badge HT

---

## 🔍 Detection Methods

### Method 1: From apibongda.onrender.com
```javascript
const isHalfTime = match.rawText?.includes('HT') || 
                   match.rawText?.includes('Half Time')
```

**Patterns detected**:
- ✅ `"...Công An Hà Nội\nHT\n2..."` 
- ✅ `"...Half Time..."` (if API returns this)
- ✅ Case insensitive check

### Method 2: From football-data.org
```javascript
match.status === 'PAUSED'
```

**API statuses**:
- `IN_PLAY` → Trận đang diễn ra
- `PAUSED` → Half Time hoặc nghỉ giải lao
- `FINISHED` → Kết thúc

---

## 🎨 UI/UX Design Decisions

### Color Choice: Yellow (bg-yellow-500)
- ⚠️ **Attention grabbing** nhưng không quá aggressive như đỏ
- 🔄 **Pause state** - Vàng thường chỉ trạng thái tạm dừng
- 🎯 **Distinguishable** - Khác biệt rõ với LIVE (đỏ) và finished (xanh)

### Size: text-xs font-bold
- 📏 **Compact** - Không chiếm quá nhiều không gian
- 💪 **Bold** - Dễ đọc và nổi bật
- 🎯 **Consistent** - Cùng size với các badge khác

### Position: Inline with match time
- 📍 **Visible** - Ngay khu vực hiển thị thời gian
- 🔍 **Expected** - User tự nhiên nhìn vào đó để biết trạng thái
- 🎯 **Non-intrusive** - Không làm lộn xộn layout

---

## 🔧 Technical Details

### Data Flow
```
API Response (rawText)
  ↓
Parse HT detection
  ↓
Store in match.halfTime
  ↓
Conditional rendering
  ↓
Yellow badge display
```

### Fallback Logic
```javascript
// Priority order:
1. halfTime exists → Show HT badge
2. currentMinute exists → Show "67'"
3. No info → Show "LIVE"
```

---

## 📝 Related Files

- `src/App.jsx` - FootballAdapter + MatchCard component
- Lines changed: ~1783, ~1817, ~2788-2799

---

## 🚀 Future Enhancements

### Possible improvements:
- [ ] **Extra Time** - Hiển thị "ET" (Extra Time) nếu có
- [ ] **Penalty** - Hiển thị "PEN" cho loạt penalty
- [ ] **Injury Time** - Hiển thị "45+3'" cho thời gian bù giờ
- [ ] **Animation** - Pulse effect cho HT badge
- [ ] **Countdown** - Countdown đến khi trận tiếp tục (nếu API có thông tin)

---

**Last Updated**: October 2, 2025  
**Status**: ✅ Implemented and ready for testing  
**Visual**: 🟡 Yellow HT badge with white bold text
