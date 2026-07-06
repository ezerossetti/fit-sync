/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Base surfaces (tonal layering, dark-first)
        background: '#0D0D0F',
        surface: '#121412',
        'surface-dim': '#0D0D0F',
        'surface-bright': '#383938',
        'surface-container-lowest': '#0A0A0C',
        'surface-container-low': '#16181D',
        'surface-container': '#1B1D22',
        'surface-container-high': '#22242A',
        'surface-container-highest': '#2C2E35',
        'on-surface': '#e3e2df',
        'on-surface-variant': '#c4c6d2',
        outline: '#8e909b',
        'outline-variant': '#33353d',

        // Brand
        primary: '#0A2E6E',
        'primary-light': '#7d98de',
        'on-primary': '#F4F3F0',
        'primary-container': '#132a5c',
        'on-primary-container': '#b1c5ff',

        accent: '#29B0E8',
        'accent-dim': '#1a7fac',
        'on-accent': '#00202b',

        success: '#1D9E75',
        'success-container': '#00291d',
        'on-success-container': '#68dbae',

        error: '#ffb4ab',
        'error-container': '#93000a',
      },
      fontFamily: {
        display: ['Lexend', 'sans-serif'],
        body: ['Lexend', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        'headline-xl': ['40px', { lineHeight: '48px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.01em', fontWeight: '700' }],
        'headline-lg-mobile': ['28px', { lineHeight: '36px', fontWeight: '700' }],
        'headline-md': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'headline-sm': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'label-md': ['12px', { lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '600' }],
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
      },
      spacing: {
        gutter: '16px',
        'margin-mobile': '16px',
        'margin-desktop': '32px',
      },
      maxWidth: {
        'container-max': '1200px',
      },
      boxShadow: {
        'plate': '0 4px 14px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
}
