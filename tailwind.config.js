module.exports = {
	content: [
	  "./src/**/*.{html,js,ts,jsx,tsx}",
	  "app/**/*.{ts,tsx}",
	  "components/**/*.{ts,tsx}",
	],
	theme: {
	  extend: {
		colors: {
		  border: "hsl(var(--border))",
		  input: "hsl(var(--input))",
		  ring: "hsl(var(--ring))",
		  background: "hsl(var(--background))",
		  foreground: "hsl(var(--foreground))",
		  primary: {
			DEFAULT: "hsl(var(--primary))",
			foreground: "hsl(var(--primary-foreground))",
		  },
		  secondary: {
			DEFAULT: "hsl(var(--secondary))",
			foreground: "hsl(var(--secondary-foreground))",
		  },
		  destructive: {
			DEFAULT: "hsl(var(--destructive))",
			foreground: "hsl(var(--destructive-foreground))",
		  },
		  muted: {
			DEFAULT: "hsl(var(--muted))",
			foreground: "hsl(var(--muted-foreground))",
		  },
		  accent: {
			DEFAULT: "hsl(var(--accent))",
			foreground: "hsl(var(--accent-foreground))",
		  },
		  popover: {
			DEFAULT: "hsl(var(--popover))",
			foreground: "hsl(var(--popover-foreground))",
		  },
		  card: {
			DEFAULT: "hsl(var(--card))",
			foreground: "hsl(var(--card-foreground))",
		  },
		},
		borderRadius: {
		  lg: "var(--radius)",
		  md: "calc(var(--radius) - 2px)",
		  sm: "calc(var(--radius) - 4px)",
		},
		fontFamily: {
		  sans: [
			"ui-sans-serif",
			"system-ui",
			"sans-serif",
			'"Apple Color Emoji"',
			'"Segoe UI Emoji"',
			'"Segoe UI Symbol"',
			'"Noto Color Emoji"',
		  ],
		},
		keyframes: {
			'float-right': {
			  '0%, 100%': { transform: 'translateX(0)' },
			  '50%': { transform: 'translateX(350%)' }
			},
			'float-left': {
			  '0%, 100%': { transform: 'translateX(0)' },
			  '50%': { transform: 'translateX(-350%)' }
			}
		  },
		  animation: {
			'float-right': 'float-right 150s ease-in-out infinite',
			'float-left': 'float-left 150s ease-in-out infinite'
		  },

	  },
	  container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
	},
	plugins: [],
	darkMode: ["class"],
  }