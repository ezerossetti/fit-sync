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
        background: '#090F18',
        surface: '#101A28',
        'surface-dim': '#090F18',
        'surface-bright': '#383938',
        'surface-container-lowest': '#090F18',
        'surface-container-low': '#0E1825',
        'surface-container': '#121E2D',
        'surface-container-high': '#1B2B3D',
        'surface-container-highest': '#24384C',
        'on-surface': '#F0F5FA',
        'on-surface-variant': '#9EAFBF',
        outline: '#8e909b',
        'outline-variant': '#26374A',

        // Brand
        primary: '#0A2E6E',
        'primary-light': '#7d98de',
        'on-primary': '#F4F3F0',
        'primary-container': '#132a5c',
        'on-primary-container': '#b1c5ff',

        accent: '#62D5ED',
        'accent-dim': '#1a7fac',
        'on-accent': '#00202b',

        success: '#1D9E75',
        'success-container': '#00291d',
        'on-success-container': '#68dbae',

        error: '#ffb4ab',
        'error-container': '#93000a',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'sans-serif'],
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
        'container-max': '680px',
      },
      boxShadow: {
        'plate': '0 4px 14px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
}
