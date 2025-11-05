# 🎨 RehabMotion Logo Guide

## Logo Location

The logo is located at:
```
public/logo.png
```

## Logo Details

- **Format**: PNG with transparency
- **Current Logo**: Simple text-based "RehabMotion" logo
- **Recommended Size**: 200x60 pixels (flexible)
- **Color Scheme**: Primary brand colors

## Usage Guidelines

### In React Components

```tsx
import logo from '../public/logo.png';

function Header() {
  return (
    <img src={logo} alt="RehabMotion Logo" className="logo" />
  );
}
```

### In HTML

```html
<img src="/logo.png" alt="RehabMotion Logo" />
```

### In CSS

```css
.header-logo {
  background-image: url('/logo.png');
  background-size: contain;
  background-repeat: no-repeat;
}
```

## Design Recommendations

### Primary Brand Colors
- **Primary Blue**: `#007bff` - Main actions, primary buttons
- **Success Green**: `#28a745` - Completed exercises, achievements
- **Warning Orange**: `#fd7e14` - Cautions, pain warnings
- **Danger Red**: `#dc3545` - Stop signals, serious warnings
- **Info Blue**: `#17a2b8` - Informational elements

### Typography
- **Headings**: Bold, modern sans-serif
- **Body**: Clean, readable sans-serif
- **Consistency**: Maintain hierarchy

## Logo Variations (Future)

### Recommended Variations to Create:
1. **Full Logo**: Text + icon (main usage)
2. **Icon Only**: For mobile, favicons
3. **Text Only**: For narrow spaces
4. **Inverted**: White version for dark backgrounds

### Sizes to Prepare:
- 512x512 - App icon
- 192x192 - PWA icon
- 32x32 - Favicon
- 16x16 - Browser tab icon

## Branding Tips

### Do's:
✅ Maintain consistent spacing around logo  
✅ Use on clean, contrasting backgrounds  
✅ Scale proportionally  
✅ Keep clear space around logo  

### Don'ts:
❌ Don't distort or stretch  
❌ Don't rotate or skew  
❌ Don't place on busy backgrounds  
❌ Don't use low-resolution versions  

## Future Enhancements

Consider creating:
- Animated logo for loading screens
- SVG version for scalability
- Dark mode variant
- Favicon set
- Social media versions (square format)

---

**Note**: This is a placeholder guide. Update with actual logo specifications when final branding is established.
