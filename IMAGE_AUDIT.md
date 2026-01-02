# Image Path Audit & Fix Report

## Summary
Audit lengkap untuk semua penggunaan gambar/foto di aplikasi Kawan Hiking.

## Issues Found

### 1. **Inconsistent Image Path Handling**
Beberapa file menggunakan path langsung tanpa validasi:
- ❌ `src={dest.gambar}` - Tidak handle jika hanya filename
- ❌ `src={guide.foto}` - Sudah diperbaiki di guide pages
- ❌ Tidak ada fallback untuk external URLs

### 2. **Missing Helper Function**
Tidak ada utility function untuk handle image paths secara konsisten.

## Solution Implemented

### Created Utility Function
**File:** `/lib/image-utils.js`

```javascript
export function getImagePath(imagePath, folder = 'general') {
  if (!imagePath) return null;
  
  // Full URL or absolute path
  if (imagePath.startsWith('http') || imagePath.startsWith('/')) {
    return imagePath;
  }
  
  // Relative filename
  return `/uploads/${folder}/${imagePath}`;
}
```

## Files That Need Updates

### ✅ Already Fixed
1. `/app/guide/page.js` - Line 64
2. `/app/guide/[id]/page.js` - Line 85

### 🔧 Need to Fix

#### Destinasi (Destinations)
1. **`/app/destinasi/page.js`** - Line 128
   ```javascript
   // Current
   src={dest.gambar}
   
   // Should be
   src={getImagePath(dest.gambar, 'destinations')}
   ```

2. **`/app/destinasi/[id]/page.js`** - Line 63
   ```javascript
   // Current
   src={destination.gambar}
   
   // Should be
   src={getImagePath(destination.gambar, 'destinations')}
   ```

3. **`/app/page.js`** (Homepage) - Line 112
   ```javascript
   // Current
   src={dest.gambar}
   
   // Should be
   src={getImagePath(dest.gambar, 'destinations')}
   ```

#### Open Trips
4. **`/app/open-trip/page.js`** - Line 245
   ```javascript
   // Current
   src={destination.gambar}
   
   // Should be
   src={getImagePath(destination.gambar, 'destinations')}
   ```

5. **`/app/open-trip/[id]/page.js`** - Line 133
   ```javascript
   // Current
   src={destination.gambar}
   
   // Should be
   src={getImagePath(destination.gambar, 'destinations')}
   ```

#### Admin Pages
6. **`/app/admin/guides/page.js`** - Line 74
   ```javascript
   // Current
   <img src={guide.foto} .../>
   
   // Should be
   <img src={getImagePath(guide.foto, 'general')} .../>
   ```

7. **`/app/admin/destinasi/edit/[id]/page.js`** - Line 227
   ```javascript
   // Current
   src={formData.gambar}
   
   // Should be
   src={getImagePath(formData.gambar, 'destinations')}
   ```

## Upload Folder Structure

```
public/uploads/
├── general/          # Guide photos
├── destinations/     # Destination images  
└── trips/           # Trip images
```

## Database Field Names

| Entity | Field Name | Type | Example |
|--------|-----------|------|---------|
| Guide | `foto` | String | `/uploads/general/guide-123.jpg` |
| Destination | `gambar` | String | `/uploads/destinations/dest-456.jpg` |
| Trip | `gambar` | String | `/uploads/trips/trip-789.jpg` |

## Recommendations

### 1. Use Helper Function Everywhere
Import and use `getImagePath()` in all components that display images.

### 2. Consistent Field Names
Consider standardizing to either `foto` or `gambar` across all entities.

### 3. Image Validation
Add validation in upload API to ensure:
- File size limits
- Allowed file types
- Proper naming convention

### 4. CDN Support
The helper function already supports external URLs (http/https), making it easy to migrate to CDN later.

### 5. Lazy Loading
Consider adding lazy loading for images:
```javascript
<img loading="lazy" ... />
```

## Priority Fixes

### High Priority (User-Facing)
1. ✅ Guide pages (DONE)
2. 🔧 Destinasi pages
3. 🔧 Open trip pages
4. 🔧 Homepage

### Medium Priority (Admin)
5. 🔧 Admin guide list
6. 🔧 Admin destinasi edit

### Low Priority
7. Image optimization
8. Lazy loading
9. CDN migration

## Testing Checklist

After implementing fixes, test:
- [ ] Images with full URL (http/https)
- [ ] Images with absolute path (/uploads/...)
- [ ] Images with filename only (photo.jpg)
- [ ] Missing images (null/undefined)
- [ ] External CDN images
- [ ] Mobile responsiveness
- [ ] Loading performance

## Next Steps

1. Apply `getImagePath()` to all identified files
2. Test all image displays
3. Update admin forms to use correct upload folders
4. Add image optimization (next/image where possible)
5. Consider implementing lazy loading
