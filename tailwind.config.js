/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  safelist: [
    { pattern: /bg-(void|solar|energy|grid)-(50|100|200|300|400|500|600|700|800|900|cyan|green|amber|orange|rose|blue)\/(5|8|10|12|15|20|25|30|40|50|60|70)/ },
    { pattern: /border-(void|solar|energy|grid)-(50|100|200|300|400|500|600|700|800|900|cyan|green|amber|orange|rose|blue)\/(10|15|20|25|30|40|60)/ },
    { pattern: /text-(solar|energy|void|grid)-(50|100|200|300|400|500|600|700|800|900|cyan|green|amber|orange|rose|blue)/ },
    { pattern: /ring-(solar|energy)-(50|100|200|300|400|500|600|700|800|900|cyan|green|amber|orange|rose|blue)/ },
    { pattern: /hover:bg-(void|solar|energy)-(400|500|600|700)\/(15|20|30|40|50|60|70)/ },
  ],
  theme: {
    extend: {
      colors: {
        solar: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        grid: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
        },
        void: {
          900: '#06080C',
          800: '#0A0D14',
          700: '#0F1520',
          600: '#141C2A',
          500: '#1A2336',
          400: '#222D42',
          300: '#2D3A52',
          200: '#3D4E6A',
          100: '#536080',
        },
        energy: {
          cyan:   '#00E5FF',
          green:  '#00E5A0',
          amber:  '#FFB800',
          orange: '#FF7A00',
          rose:   '#FF4C6A',
          blue:   '#3FA9F5',
        }
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        mono:    ['Space Mono', 'monospace'],
        body:    ['DM Sans', 'sans-serif'],
      },
      backgroundImage: {
        'solar-glow': 'radial-gradient(ellipse at top, rgba(251,191,36,0.08) 0%, transparent 60%)',
        'grid-glow':  'radial-gradient(ellipse at bottom right, rgba(0,229,160,0.06) 0%, transparent 60%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'spin-slow':  'spin 12s linear infinite',
        'float':      'float 6s ease-in-out infinite',
        'glow':       'glow 2s ease-in-out infinite alternate',
        'slide-up':   'slideUp 0.4s ease forwards',
        'fade-in':    'fadeIn 0.5s ease forwards',
        'blink':      'blink 1.2s ease-in-out infinite',
      },
      keyframes: {
        float:   { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
        glow:    { from: { boxShadow: '0 0 12px rgba(251,191,36,0.3)' }, to: { boxShadow: '0 0 28px rgba(251,191,36,0.7)' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        blink:   { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.2' } },
      },
      boxShadow: {
        'solar': '0 0 20px rgba(251,191,36,0.25), 0 0 60px rgba(251,191,36,0.1)',
        'green': '0 0 20px rgba(0,229,160,0.2)',
        'card':  '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
      },
    },
  },
  plugins: [],
}
