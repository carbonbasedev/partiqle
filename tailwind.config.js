const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'pages/**/*.{ts,tsx}'
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', ...fontFamily.sans],
        mono: ['var(--font-mono)', ...fontFamily.mono]
      },
      colors: {
        pq: {
          bg: 'var(--pq-bg)',
          surface: {
            0: 'var(--pq-surface-0)',
            1: 'var(--pq-surface-1)',
            2: 'var(--pq-surface-2)',
            3: 'var(--pq-surface-3)'
          },
          border: 'var(--pq-border)',
          accent: 'var(--pq-accent)',
          violet: 'var(--pq-violet)',
          amber: 'var(--pq-amber)',
          rose: 'var(--pq-rose)',
          ink: {
            0: 'var(--pq-ink-0)',
            1: 'var(--pq-ink-1)',
            2: 'var(--pq-ink-2)',
            3: 'var(--pq-ink-3)',
            4: 'var(--pq-ink-4)'
          }
        }
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
};
