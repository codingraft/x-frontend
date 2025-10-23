import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				yap: {
					50: '#fafafa',
					100: '#f5f5f5',
					200: '#e5e5e5',
					300: '#d4d4d4',
					400: '#a3a3a3',
					500: '#737373',
					600: '#525252',
					700: '#404040',
					800: '#262626',
					900: '#171717',
					950: '#0a0a0a',
				},
				primary: {
					DEFAULT: '#171717',
					light: '#404040',
					dark: '#0a0a0a',
				},
				accent: {
					DEFAULT: '#262626',
					light: '#404040',
					dark: '#171717',
				}
			},
			fontFamily: {
				sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
			},
			boxShadow: {
				'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
				'card': '0 1px 3px rgba(0, 0, 0, 0.12)',
			},
			borderRadius: {
				'xl': '1rem',
				'2xl': '1.5rem',
			}
		},
	},
	plugins: [daisyui],
	daisyui: {
		themes: [
			{
				yap: {
					"primary": "#171717",
					"secondary": "#f5f5f5",
					"accent": "#262626",
					"neutral": "#171717",
					"base-100": "#ffffff",
					"base-200": "#fafafa",
					"base-300": "#f5f5f5",
					"info": "#404040",
					"success": "#22c55e",
					"warning": "#f59e0b",
					"error": "#ef4444",
				},
			},
			"dark",
		],
		darkTheme: "dark",
	},
};