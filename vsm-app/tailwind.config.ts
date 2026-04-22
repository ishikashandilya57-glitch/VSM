import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F4F5F7',  // Very light grey
          100: '#EBECF0', // Light border
          200: '#DFE1E6', // Border
          300: '#C1C7D0', // Darker border
          400: '#7A869A', // Secondary text
          500: '#5E6C84', // Primary text muted
          600: '#0052CC', // Jira Blue (primary action)
          700: '#0747A6', // Jira Blue Hover
          800: '#172B4D', // Jira Navy (text & header)
          900: '#091E42', // Jira Darker Navy
          950: '#000000',
        },
        jira: {
          blue: {
            50: '#DEEBFF', // Light blue background for active
            100: '#B3D4FF',
            400: '#4C9AFF',
            500: '#0052CC', // Main blue
            600: '#0747A6', // Darker blue
          },
          navy: '#172B4D',
          border: '#DFE1E6',
        }
      },
    },
  },
  plugins: [],
};

export default config;
