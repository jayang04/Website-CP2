# CSS Architecture - Rehab Hub

This project uses a **modular CSS architecture** for better maintainability and organization.

## 📁 File Structure

```
css/
├── main.css          # Main stylesheet that imports all modules
├── base.css          # Reset, variables, typography, utilities
├── navigation.css    # Header, navigation, mobile menu
├── footer.css        # Footer styles
├── home.css          # Homepage-specific styles
├── forms.css         # Login/signup form styles
├── dashboard.css     # Dashboard and page header styles
├── exercises.css     # Knee/ankle rehab page styles
└── responsive.css    # Media queries for all breakpoints
```

## 🎯 CSS Modules Explained

### **main.css**
- Central import file that loads all CSS modules
- All HTML pages link to this single file
- Uses CSS `@import` to load modular stylesheets

### **base.css**
- CSS reset and box-sizing
- CSS custom properties (variables)
- Typography (h1-h6, paragraphs)
- Utility classes (.container, main)
- Global body and HTML styles

### **navigation.css**
- Site header and navigation bar
- Logo and main navigation links
- Hamburger menu and mobile navigation
- Mobile menu overlay and animations
- Active page indicators

### **footer.css**
- Footer layout and styling
- Footer logo and content sections
- Contact information and links
- Footer bottom copyright area
- Multi-column footer layout

### **home.css**
- Homepage hero header
- Intro section with image and text
- Features grid layout
- Testimonials section
- Homepage-specific cards and layouts

### **forms.css**
- Login and signup form containers
- Form input styling and focus states
- Form button styling and hover effects
- Form validation states
- Form typography and spacing

### **dashboard.css**
- Dashboard layout (sidebar + main content)
- Sidebar navigation and styling
- Dashboard widgets and cards
- Page headers for internal pages
- Dashboard-specific components

### **exercises.css**
- Exercise program overview sections
- Exercise card layouts and styling
- Exercise list and grid layouts
- Exercise-specific components
- Knee and ankle rehab page styles

### **responsive.css**
- All media queries for mobile/tablet
- Responsive navigation (hamburger menu)
- Mobile-specific layouts
- Tablet and phone breakpoints
- Grid and layout adjustments

## 🎨 CSS Variables

The project uses CSS custom properties for consistency:

```css
:root {
  --primary-color: #0d47a1;
  --primary-light: #1565c0;
  --primary-dark: #0a3d91;
  --text-primary: #263238;
  --shadow-light: 0 2px 8px rgba(0,0,0,0.04);
  --border-radius: 8px;
  --transition: all 0.2s ease;
}
```

## 📱 Responsive Breakpoints

- **Desktop**: > 768px (full navigation)
- **Tablet**: ≤ 768px (hamburger menu)
- **Mobile**: ≤ 480px (optimized layouts)

## 🔧 How to Add New Styles

1. **Page-specific styles**: Add to relevant page CSS file
2. **New components**: Create new CSS file and import in main.css
3. **Global utilities**: Add to base.css
4. **Responsive changes**: Add to responsive.css

## 🎯 Benefits

- **Maintainable**: Easy to find and edit specific styles
- **Modular**: Components are separated and reusable  
- **Scalable**: Easy to add new pages or components
- **Performance**: Browser can cache individual modules
- **Team-friendly**: Multiple developers can work on different modules
