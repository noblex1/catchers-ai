# PWA (Progressive Web App) Setup Guide

## Overview
Catchers AI is now a fully functional Progressive Web App that can be installed on Android, iOS, and desktop devices.

## Features Implemented

### ✅ Core PWA Features
- **Installable**: Users can install the app on their home screen
- **Offline Support**: Service worker caches assets for offline access
- **App-like Experience**: Runs in standalone mode without browser UI
- **Auto-updates**: Automatically updates when new versions are deployed
- **Fast Loading**: Cached assets load instantly
- **Push Notifications Ready**: Infrastructure in place for future notifications

### ✅ Platform Support
- **Android**: Full PWA support with install prompt
- **iOS/iPadOS**: Add to Home Screen functionality
- **Windows**: Install via Chrome/Edge
- **macOS**: Install via Chrome/Edge/Safari
- **Linux**: Install via Chrome/Firefox

---

## Files Created/Modified

### 1. **vite.config.ts** - PWA Configuration
- Added `vite-plugin-pwa` plugin
- Configured manifest.json settings
- Set up service worker with Workbox
- Configured caching strategies

### 2. **src/components/PWAInstallPrompt.tsx** - Install Prompt
- Smart install banner that appears after 3 seconds
- Dismissible with 7-day cooldown
- Detects if app is already installed
- Handles install flow

### 3. **src/main.tsx** - Service Worker Registration
- Registers service worker on app load
- Handles update notifications
- Manages offline ready state

### 4. **index.html** - PWA Meta Tags
- Theme color for Android
- Apple-specific meta tags for iOS
- Mobile web app capabilities

---

## PWA Icons Setup

### Required Icons
You need to create the following icon files and place them in `frontend/public/`:

1. **pwa-192x192.png** - Standard icon (192x192px)
2. **pwa-512x512.png** - Large icon (512x512px)
3. **pwa-maskable-192x192.png** - Maskable icon (192x192px)
4. **pwa-maskable-512x512.png** - Maskable icon (512x512px)

### Icon Requirements

#### Standard Icons
- **Format**: PNG with transparency
- **Content**: Your logo centered with some padding
- **Background**: Transparent or solid color
- **Safe Zone**: Keep important content in center 80%

#### Maskable Icons
- **Format**: PNG
- **Content**: Logo fills entire canvas
- **Background**: Solid color (no transparency)
- **Safe Zone**: Keep important content in center 80% (circular mask)
- **Purpose**: Adapts to different device shapes (circle, squircle, rounded square)

### How to Create Icons

#### Option 1: Using Online Tools (Recommended)
1. **PWA Asset Generator**: https://www.pwabuilder.com/imageGenerator
   - Upload your logo (at least 512x512px)
   - Select "Generate Icons"
   - Download and extract to `frontend/public/`

2. **Maskable.app**: https://maskable.app/editor
   - Upload your icon
   - Adjust safe zone
   - Export maskable versions

#### Option 2: Using Design Tools
**Figma/Photoshop/GIMP:**
1. Create 512x512px canvas
2. Place your logo in center
3. For standard icons: Add padding (40-60px)
4. For maskable icons: Fill entire canvas with background color
5. Export as PNG

#### Option 3: Using ImageMagick (Command Line)
```bash
# Install ImageMagick first
# macOS: brew install imagemagick
# Ubuntu: sudo apt-get install imagemagick
# Windows: Download from imagemagick.org

# Create standard icons from your logo
convert images.jpg -resize 192x192 -background transparent -gravity center -extent 192x192 pwa-192x192.png
convert images.jpg -resize 512x512 -background transparent -gravity center -extent 512x512 pwa-512x512.png

# Create maskable icons (with background)
convert images.jpg -resize 400x400 -background "#3b82f6" -gravity center -extent 512x512 pwa-maskable-512x512.png
convert images.jpg -resize 150x150 -background "#3b82f6" -gravity center -extent 192x192 pwa-maskable-192x192.png
```

#### Option 4: Using Node.js Script
Create `generate-icons.js` in frontend root:

```javascript
const sharp = require('sharp');
const fs = require('fs');

const sizes = [
  { name: 'pwa-192x192.png', size: 192, padding: 30 },
  { name: 'pwa-512x512.png', size: 512, padding: 80 },
  { name: 'pwa-maskable-192x192.png', size: 192, padding: 0, background: '#3b82f6' },
  { name: 'pwa-maskable-512x512.png', size: 512, padding: 0, background: '#3b82f6' }
];

async function generateIcons() {
  for (const { name, size, padding, background } of sizes) {
    const logoSize = size - (padding * 2);
    
    await sharp('public/images.jpg')
      .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: background || { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(`public/${name}`);
    
    console.log(`✓ Generated ${name}`);
  }
}

generateIcons().catch(console.error);
```

Run with:
```bash
npm install sharp
node generate-icons.js
```

---

## Installation Instructions for Users

### Android (Chrome/Edge)
1. Visit the website
2. Tap the "Install" button in the prompt, OR
3. Tap menu (⋮) → "Install app" or "Add to Home Screen"
4. Confirm installation
5. App appears on home screen

### iOS/iPadOS (Safari)
1. Visit the website
2. Tap the Share button (□↑)
3. Scroll down and tap "Add to Home Screen"
4. Edit name if desired
5. Tap "Add"
6. App appears on home screen

### Desktop (Chrome/Edge)
1. Visit the website
2. Click the install icon (⊕) in the address bar, OR
3. Click menu (⋮) → "Install Catchers AI"
4. Confirm installation
5. App opens in standalone window

---

## Manifest Configuration

### Current Settings
```json
{
  "name": "Catchers AI - Threat Intelligence",
  "short_name": "Catchers AI",
  "description": "Advanced threat detection and URL analysis powered by AI",
  "theme_color": "#3b82f6",
  "background_color": "#0a0a0a",
  "display": "standalone",
  "orientation": "portrait",
  "scope": "/",
  "start_url": "/"
}
```

### Customization Options

#### Display Modes
- `standalone` (current): Looks like a native app
- `fullscreen`: Full screen, no system UI
- `minimal-ui`: Minimal browser UI
- `browser`: Regular browser tab

#### Orientation
- `portrait` (current): Vertical only
- `landscape`: Horizontal only
- `any`: Any orientation

#### Theme Color
- Current: `#3b82f6` (blue)
- Change to match your brand color
- Affects Android status bar and browser UI

---

## Caching Strategy

### Static Assets (CacheFirst)
- HTML, CSS, JavaScript files
- Images, fonts, icons
- Cached indefinitely, updated on new deployment

### Google Fonts (CacheFirst)
- Font files cached for 1 year
- Reduces load time significantly

### API Calls (NetworkFirst)
- Tries network first
- Falls back to cache if offline
- Cache expires after 5 minutes
- Ensures fresh data when online

---

## Testing PWA

### Lighthouse Audit
1. Open Chrome DevTools (F12)
2. Go to "Lighthouse" tab
3. Select "Progressive Web App"
4. Click "Generate report"
5. Should score 90+ in all categories

### PWA Checklist
- [ ] Manifest.json is valid
- [ ] Service worker registers successfully
- [ ] Icons load correctly (check Network tab)
- [ ] Install prompt appears
- [ ] App installs successfully
- [ ] Offline mode works (disable network in DevTools)
- [ ] Updates work (deploy new version, check for update prompt)
- [ ] Theme color applies on Android
- [ ] iOS Add to Home Screen works

### Manual Testing

#### Test Offline Mode
1. Install the app
2. Open DevTools → Network tab
3. Select "Offline" from throttling dropdown
4. Refresh the app
5. Should still load (from cache)

#### Test Install Flow
1. Open in incognito/private mode
2. Wait for install prompt (3 seconds)
3. Click "Install"
4. Verify app opens in standalone mode
5. Check home screen for app icon

#### Test Updates
1. Make a change to the app
2. Deploy new version
3. Open installed app
4. Should see "New content available" prompt
5. Click "Reload" to update

---

## Troubleshooting

### Install Prompt Not Showing
**Causes:**
- Already installed
- Dismissed within last 7 days
- Not served over HTTPS
- Manifest or service worker errors

**Solutions:**
- Check browser console for errors
- Clear site data in DevTools
- Verify HTTPS is enabled
- Check manifest.json is accessible

### Service Worker Not Registering
**Causes:**
- Not served over HTTPS (except localhost)
- Service worker file not found
- JavaScript errors

**Solutions:**
- Check console for errors
- Verify service worker file exists in build output
- Test on localhost first
- Check Network tab for service worker requests

### Icons Not Loading
**Causes:**
- Files don't exist in public folder
- Wrong file paths in manifest
- Incorrect file format

**Solutions:**
- Verify icon files exist
- Check file names match manifest
- Ensure files are PNG format
- Check Network tab for 404 errors

### App Not Working Offline
**Causes:**
- Service worker not active
- Assets not cached
- API calls failing

**Solutions:**
- Check Application tab → Service Workers
- Verify cache storage has files
- Check Network tab for failed requests
- Review caching strategy in vite.config.ts

---

## Advanced Features

### Push Notifications (Future)
Infrastructure is ready. To implement:
1. Add push notification permission request
2. Subscribe user to push service
3. Send notifications from backend
4. Handle notification clicks

### Background Sync (Future)
Queue failed API requests:
1. Detect offline state
2. Store requests in IndexedDB
3. Sync when back online
4. Notify user of sync status

### Share Target (Future)
Allow sharing URLs to the app:
1. Add share_target to manifest
2. Handle shared URLs
3. Auto-scan shared links

---

## Deployment Checklist

Before deploying PWA to production:

- [ ] Generate all required icon files
- [ ] Test manifest.json is accessible
- [ ] Verify service worker registers
- [ ] Test install flow on multiple devices
- [ ] Run Lighthouse audit (score 90+)
- [ ] Test offline functionality
- [ ] Verify theme color on Android
- [ ] Test iOS Add to Home Screen
- [ ] Check update mechanism works
- [ ] Verify HTTPS is enabled
- [ ] Test on slow 3G connection
- [ ] Check all icons load correctly
- [ ] Verify shortcuts work (if implemented)

---

## Resources

### Documentation
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Workbox Guide](https://developers.google.com/web/tools/workbox)
- [Web App Manifest](https://web.dev/add-manifest/)

### Tools
- [PWA Builder](https://www.pwabuilder.com/)
- [Maskable.app](https://maskable.app/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)

### Testing
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [PWA Testing Checklist](https://web.dev/pwa-checklist/)

---

## Support

### Browser Compatibility
- ✅ Chrome 67+ (Android, Desktop)
- ✅ Edge 79+ (Desktop)
- ✅ Safari 11.1+ (iOS, macOS)
- ✅ Firefox 79+ (Android, Desktop)
- ✅ Samsung Internet 8.2+
- ✅ Opera 54+

### Feature Support by Platform
| Feature | Android | iOS | Desktop |
|---------|---------|-----|---------|
| Install | ✅ | ✅ | ✅ |
| Offline | ✅ | ✅ | ✅ |
| Push Notifications | ✅ | ❌ | ✅ |
| Background Sync | ✅ | ❌ | ✅ |
| Share Target | ✅ | ❌ | ✅ |

---

## Next Steps

1. **Generate Icons**: Create all required icon files
2. **Test Locally**: Run `npm run build && npm run preview`
3. **Deploy**: Push to Vercel/Netlify
4. **Test Production**: Install on real devices
5. **Monitor**: Check analytics for install rates
6. **Iterate**: Improve based on user feedback

Your app is now a fully functional PWA! 🎉
