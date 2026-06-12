import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // رنگ‌های اصلی برند SoundWave
        brand: {
          primary: '#1DB954',    // سبز اسپاتیفای
          dark: '#121212',       // پس‌زمینه تاریک
          surface: '#181818',    // کارت‌ها
          elevated: '#282828',   // hover
          text: '#FFFFFF',
          muted: '#B3B3B3',
          gold: '#F59E0B',       // اشتراک طلایی
          silver: '#9CA3AF',     // اشتراک نقره‌ای
        },
      },
      fontFamily: {
        sans: ['Vazirmatn', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
