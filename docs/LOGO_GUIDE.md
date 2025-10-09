# 🎨 Logo & Branding

## Current Logo

The Rehab Hub logo is a **medical cross with activity indicators** representing health, rehabilitation, and movement tracking.

### Files

- **`public/logo.svg`** - Full logo (200x200px) used in headers and footer
- **`public/favicon.svg`** - Favicon (32x32px) displayed in browser tabs
- **Color Scheme:**
  - Primary: `#4CAF50` (Green - represents health/wellness)
  - Dark: `#2E7D32` (Dark green)
  - Accent: White

### Usage in App

**Header (Desktop & Mobile):**
```tsx
<img src="/logo.svg" alt="Rehab Hub Logo" 
     style={{ width: '40px', height: '40px' }} />
```

**Footer:**
```tsx
<img src="/logo.svg" alt="Rehab Hub Logo" 
     style={{ width: '50px', height: '50px' }} />
```

**Favicon (Browser Tab):**
```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
```

## Design Elements

The logo includes:
1. **Medical Cross** - Classic healthcare symbol
2. **Activity Indicators** - Small dots representing movement/tracking
3. **Heart Rate Line** - Subtle accent suggesting health monitoring
4. **Clean & Professional** - Suitable for medical/rehabilitation context

## Customization

### Change Colors

Edit `public/logo.svg`:
```svg
<!-- Change primary color -->
<circle cx="100" cy="100" r="95" fill="#YOUR_COLOR" />

<!-- Change cross color -->
<rect fill="white" />  <!-- or any color -->
```

### Use Different Logo

If you have your own logo:

1. **SVG (recommended):**
   - Replace `public/logo.svg` with your file
   - Replace `public/favicon.svg` with smaller version

2. **PNG/JPG:**
   - Add your image to `public/` folder
   - Update image src in App.tsx:
     ```tsx
     <img src="/your-logo.png" alt="Logo" />
     ```

3. **Update favicon:**
   - Update `index.html`:
     ```html
     <link rel="icon" type="image/png" href="/your-favicon.png" />
     ```

## Logo Generator Tools

If you want a custom logo:

- **Free:**
  - [Canva](https://www.canva.com) - Logo maker
  - [Hatchful](https://hatchful.shopify.com) - Free logo generator
  - [LogoMakr](https://logomakr.com) - Simple online tool

- **AI-Powered:**
  - [Looka](https://looka.com)
  - [Brandmark](https://brandmark.io)

- **Custom SVG:**
  - [Figma](https://figma.com) - Professional design tool
  - [Inkscape](https://inkscape.org) - Free vector editor

## Brand Guidelines

**Colors:**
- Primary: `#4CAF50` (Green)
- Secondary: `#2E7D32` (Dark Green)
- Text: `#333333` (Dark Gray)
- Background: `#FFFFFF` (White)
- Accent: `#2196F3` (Blue)

**Typography:**
- Headers: System font stack (sans-serif)
- Body: System font stack
- Logo Text: Bold weight

**Spacing:**
- Header logo: 40px × 40px
- Footer logo: 50px × 50px
- Minimum clear space: 10px around logo

## Files to Update When Changing Logo

1. `public/logo.svg` - Main logo
2. `public/favicon.svg` - Browser tab icon
3. `index.html` - Favicon reference
4. `src/App.tsx` - Logo images in header/footer (already done)
5. Optional: `public/apple-touch-icon.png` - iOS home screen icon
6. Optional: `public/android-chrome-192x192.png` - Android icon

## Generate Favicon Variants

Use [RealFaviconGenerator](https://realfavicongenerator.net/) to create:
- favicon.ico (for older browsers)
- apple-touch-icon.png (iOS)
- android-chrome icons (Android)
- browserconfig.xml (Windows tiles)
- site.webmanifest (PWA)

---

**Current Status:** ✅ Logo implemented and displayed in header, mobile menu, and footer
