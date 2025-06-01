import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    'm-0',
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))', // Gold: HSL(40, 96%, 38%) from #c28604
  				foreground: 'hsl(var(--primary-foreground))' // Darker gold for text
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))', // Muted Rose (more saturated): HSL(340, 50%, 45%) -> now Neutral Dark Grey HSL(240, 4%, 25%) for slider tracks
  				foreground: 'hsl(var(--secondary-foreground))' // Light text on secondary
  			},
        muted: {
          DEFAULT: "hsl(var(--muted))", // #212121
          foreground: "hsl(var(--muted-foreground))", // #808080
        },
  			accent: {
  				DEFAULT: 'hsl(var(--accent))', // Light Grey
  				foreground: 'hsl(var(--accent-foreground))' // Dark text for on-accent
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
        'slide-up-fade-in': {
          'from': { opacity: '0', transform: 'translateY(10px)' },
          'to': { opacity: '1', transform: 'translateY(0px)' },
        },
        'spinning-disc': {
          '0%': { transform: 'rotate(0deg)' },
          '60%': { transform: 'rotate(1080deg)' }, 
          '65%': { transform: 'rotate(1060deg)' }, 
          '70%': { transform: 'rotate(1100deg)' }, 
          '75%': { transform: 'rotate(1080deg)' }, 
          '100%': { transform: 'rotate(1440deg)' }, 
        },
        'fake-progress-bar': {
          '0%': { backgroundPosition: '200% 0' }, // Start gradient off-screen to the right
          '100%': { backgroundPosition: '-200% 0' }, // Move gradient off-screen to the left
        },
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
        'slide-up-fade-in': 'slide-up-fade-in 0.4s ease-out forwards',
        'spinning-disc': 'spinning-disc 4s infinite linear',
        'fake-progress-bar': 'fake-progress-bar 1.5s linear infinite', // Adjust duration as needed
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
