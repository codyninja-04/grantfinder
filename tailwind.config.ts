import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#F8FAFC',
        surface: '#FFFFFF',
        ink: '#0B1B2B',
        muted: '#5B6B7C',
        faint: '#94A3B8',
        hairline: '#E2E8F0',
        primary: {
          DEFAULT: '#0F4C81',
          dark: '#0A3A63',
          soft: '#E8F0F8',
          ring: '#9DBAD6',
        },
        eligible: { DEFAULT: '#16A34A', soft: '#EAF7EE', ink: '#11652F' },
        ineligible: { DEFAULT: '#DC2626', soft: '#FDEEEE', ink: '#991B1B' },
        caution: { DEFAULT: '#B45309', soft: '#FDF4E7', ink: '#8A4207' },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 35, 60, 0.04), 0 1px 1px rgba(15, 35, 60, 0.03)',
        lift: '0 10px 30px -12px rgba(15, 50, 90, 0.18), 0 2px 6px rgba(15, 35, 60, 0.05)',
      },
      keyframes: {
        rise: { from: { opacity: '0', transform: 'translateY(6px)' }, to: { opacity: '1', transform: 'none' } },
        shimmer: { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
      },
      animation: {
        rise: 'rise 0.45s cubic-bezier(0.2, 0.7, 0.2, 1) both',
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
