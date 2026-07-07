/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                // Основная палитра
                cream: '#E8DCC8',
                terracotta: '#B8734A',
                dark: '#2C241B',
                olive: '#556B4A',
                gold: '#C9A961',

                // Системные цвета (на основе палитры)
                primary: {
                    DEFAULT: '#B8734A', // терракотовый
                    light: '#D4A07A',
                    dark: '#8B5A3A',
                },
                secondary: {
                    DEFAULT: '#C9A961', // золотистый
                    light: '#DDC98A',
                    dark: '#A8884A',
                },
                success: {
                    DEFAULT: '#556B4A', // оливковый
                    light: '#7A8F6A',
                    dark: '#3A4F30',
                },
                background: '#E8DCC8',
                surface: '#F5EFE4', // чуть светлее для карточек
                text: '#2C241B',
            },
            fontFamily: {
                // Можно добавить шрифт с поддержкой кириллицы и тувинского
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                card: '0 4px 12px rgba(44, 36, 27, 0.08)',
                button: '0 2px 8px rgba(184, 115, 74, 0.3)',
            },
            borderRadius: {
                xl: '16px',
            },
        },
    },
    plugins: [],
};
