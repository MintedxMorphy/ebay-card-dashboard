// Color Palette Reference - VHS/Retro Theme
// Extracted from design scheme (Mar 25, 2026)

export const colorPalette = {
  // Primary UI Colors (Keep for main navigation/stats)
  terminalGreen: '#00ff41',    // Neon green - primary accent
  cyberMagenta: '#ff006e',     // Hot pink/magenta - secondary accent

  // Chart & Section Colors (New - for data visualization)
  neonCyan: '#00ffff',         // Bright cyan - alternate data viz
  vhsPurple: '#8b00ff',        // Deep purple - category/trend colors
  alertOrange: '#ff6b00',      // Orange - warning/alert states
  
  // Neutral/Background
  black: '#000000',            // Main background
  darkGray: '#1a1a1a',         // Subtle backgrounds
  lightGray: '#808080',        // Text muted states
} as const;

export const chartColors = {
  // Chart 1: Profit Over Time
  profitLine: colorPalette.neonCyan,
  profitArea: 'rgba(0, 255, 255, 0.1)',
  profitBorder: colorPalette.neonCyan,
  
  // Chart 2: Category Breakdown
  sportsBar: colorPalette.vhsPurple,
  pokemonBar: colorPalette.alertOrange,
  categoryBorder: colorPalette.alertOrange,
} as const;

export const borderColors = {
  primary: 'rgba(0, 255, 65, 0.3)',    // Green - keep existing
  secondary: 'rgba(255, 0, 110, 0.3)', // Magenta - keep existing
  charts: 'rgba(139, 0, 255, 0.3)',    // Purple - new for charts
} as const;

export const glowColors = {
  primary: '0 0 15px rgba(0, 255, 65, 0.1)',
  secondary: '0 0 15px rgba(255, 0, 110, 0.1)',
  charts: '0 0 15px rgba(139, 0, 255, 0.1)',
  cyan: '0 0 15px rgba(0, 255, 255, 0.1)',
} as const;
