
import type { Config } from "tailwindcss";

export default {
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
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
				sans: ['Inter', 'system-ui', 'sans-serif'],
				display: ['Cal Sans', 'Inter', 'system-ui', 'sans-serif'],
			},
			colors: {
				border: '#393E46',
				input: '#393E46',
				ring: '#948979',
				background: '#222831',
				foreground: '#DFD0B8',
				primary: {
					DEFAULT: '#948979',
					foreground: '#222831'
				},
				secondary: {
					DEFAULT: '#393E46',
					foreground: '#DFD0B8'
				},
				destructive: {
					DEFAULT: '#ef4444',
					foreground: '#DFD0B8'
				},
				muted: {
					DEFAULT: '#393E46',
					foreground: '#948979'
				},
				accent: {
					DEFAULT: '#DFD0B8',
					foreground: '#222831'
				},
				popover: {
					DEFAULT: '#393E46',
					foreground: '#DFD0B8'
				},
				card: {
					DEFAULT: '#393E46',
					foreground: '#DFD0B8'
				},
				sidebar: {
					DEFAULT: '#222831',
					foreground: '#DFD0B8',
					primary: '#948979',
					'primary-foreground': '#222831',
					accent: '#393E46',
					'accent-foreground': '#DFD0B8',
					border: '#393E46',
					ring: '#948979'
				},
				success: '#22c55e',
				warning: '#f59e0b',
				info: '#3b82f6',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'slide-in-right': {
					'0%': { transform: 'translateX(100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				'pulse-glow': {
					'0%, 100%': { 
						boxShadow: '0 0 30px rgba(148, 137, 121, 0.4)',
						transform: 'scale(1)'
					},
					'50%': { 
						boxShadow: '0 0 60px rgba(148, 137, 121, 0.8)',
						transform: 'scale(1.05)'
					}
				},
				'bounce-gentle': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'rotate-slow': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
					'33%': { transform: 'translateY(-20px) rotate(2deg)' },
					'66%': { transform: 'translateY(-10px) rotate(-2deg)' }
				},
				'wave': {
					'0%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' },
					'100%': { backgroundPosition: '0% 50%' }
				},
				'glow': {
					'0%, 100%': { opacity: '0.7' },
					'50%': { opacity: '1' }
				},
				'shimmer': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.6s ease-out',
				'slide-in-right': 'slide-in-right 0.3s ease-out',
				'pulse-glow': 'pulse-glow 3s infinite',
				'bounce-gentle': 'bounce-gentle 2s infinite',
				'rotate-slow': 'rotate-slow 20s linear infinite',
				'float': 'float 6s ease-in-out infinite',
				'wave': 'wave 8s ease-in-out infinite',
				'glow': 'glow 2s ease-in-out infinite',
				'shimmer': 'shimmer 2s infinite'
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
				'custom-gradient': 'radial-gradient(125% 125% at 50% 10%, rgba(255,255,255,0) 40%, rgba(148,137,121,1) 100%)',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
