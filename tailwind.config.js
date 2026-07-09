/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                'dark-bg': '#0A0F1C',
                'dark-card': '#121A2E',
                'dark-cardHover': '#1A2744',
                gold: {
                    DEFAULT: '#F59E0B',
                    dark: '#D97706',
                    light: '#FBBF24',
                },
                success: '#22C55E',
                error: '#EF4444',
                'text-primary': '#E2E8F0',
                'text-secondary': '#94A3B8',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            backgroundImage: {
                'steppe-gradient':
                    'linear-gradient(135deg, #0A0F1C 0%, #121A2E 50%, #1A2744 100%)',
                'gold-gradient':
                    'linear-gradient(90deg, #F59E0B 0%, #D97706 100%)',
            },
            boxShadow: {
                gold: '0 4px 20px rgba(245, 158, 11, 0.3)',
                'gold-lg': '0 8px 40px rgba(245, 158, 11, 0.4)',
                card: '0 8px 32px rgba(0, 0, 0, 0.4)',
                'card-lg': '0 12px 48px rgba(0, 0, 0, 0.6)',
            },
        },
    },
    plugins: [],
};
