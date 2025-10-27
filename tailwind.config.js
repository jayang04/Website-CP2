/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary colors matching existing design
        primary: {
          DEFAULT: '#0d47a1',
          light: '#1565c0',
          dark: '#0a3d91',
        },
        // Secondary & accent
        secondary: '#f8f9fa',
        accent: '#e3f2fd',
        // Greens (for success/actions)
        green: {
          DEFAULT: '#4CAF50',
          dark: '#45a049',
        },
        // Status colors
        danger: '#f44336',
        warning: '#FFC107',
        success: '#4CAF50',
        // Text colors
        text: {
          primary: '#263238',
          secondary: '#666',
          muted: '#999',
        },
        // Grays
        gray: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          border: '#e0e0e0',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
      },
      boxShadow: {
        'light': '0 2px 8px rgba(0,0,0,0.04)',
        'medium': '0 4px 16px rgba(0,0,0,0.08)',
        'heavy': '0 8px 32px rgba(0,0,0,0.12)',
        'card': '0 2px 8px rgba(0,0,0,0.1)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.15)',
        'modal': '0 10px 40px rgba(0,0,0,0.3)',
      },
      borderRadius: {
        DEFAULT: '8px',
        'lg': '12px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'fadeIn': 'celebrationFadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 2s ease-in-out infinite',
        'spin-slow': 'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        celebrationFadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      transitionDuration: {
        DEFAULT: '200ms',
      },
    },
  },
  plugins: [],
}
