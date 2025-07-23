/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // PBS NewsHour inspired color palette
        pbs: {
          // Primary blues (like PBS branding)
          blue: '#1f4e79',
          'dark-blue': '#1a3f66',
          'light-blue': '#2563eb',
          // News red accent
          red: '#dc2626',
          'dark-red': '#b91c1c',
          // Neutral grays
          gray: {
            50: '#f9fafb',
            100: '#f3f4f6',
            200: '#e5e7eb',
            300: '#d1d5db',
            400: '#9ca3af',
            500: '#6b7280',
            600: '#4b5563',
            700: '#374151',
            800: '#1f2937',
            900: '#111827',
          },
          // Category colors (muted, professional)
          politics: '#dc2626',
          'social-justice': '#2563eb',
          labor: '#059669',
          // Background colors
          'bg-light': '#fafafa',
          'bg-section': '#f8f9fa',
        },
        // Keep existing colors for backward compatibility
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43',
        },
      },
      fontFamily: {
        // PBS NewsHour uses clean, professional fonts
        'serif': ['Georgia', 'Times New Roman', 'serif'],
        'sans': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'headline': ['Georgia', 'Times New Roman', 'serif'],
        'body': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
        '6xl': '3.75rem',
        // PBS-style headline sizes
        'headline-sm': '1.375rem',
        'headline-md': '1.75rem',
        'headline-lg': '2.25rem',
        'headline-xl': '2.75rem',
      },
      borderWidth: {
        '0': '0',
        '2': '2px',
        '3': '3px',
        '4': '4px',
        '8': '8px',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}