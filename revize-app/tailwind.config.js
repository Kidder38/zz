/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1e40af', // blue-800
          50: '#eff6ff',  // blue-50
          100: '#dbeafe', // blue-100
          200: '#bfdbfe', // blue-200
          300: '#93c5fd', // blue-300
          400: '#60a5fa', // blue-400
          500: '#3b82f6', // blue-500
          600: '#2563eb', // blue-600
          700: '#1d4ed8', // blue-700
          800: '#1e40af', // blue-800
          900: '#1e3a8a', // blue-900
          950: '#172554', // blue-950
        },
        secondary: {
          DEFAULT: '#475569', // slate-600
          50: '#f8fafc',  // slate-50
          100: '#f1f5f9', // slate-100
          200: '#e2e8f0', // slate-200
          300: '#cbd5e1', // slate-300
          400: '#94a3b8', // slate-400
          500: '#64748b', // slate-500
          600: '#475569', // slate-600
          700: '#334155', // slate-700
          800: '#1e293b', // slate-800
          900: '#0f172a', // slate-900
          950: '#020617', // slate-950
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
};