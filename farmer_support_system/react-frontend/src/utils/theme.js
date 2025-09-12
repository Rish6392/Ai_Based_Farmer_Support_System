// Enhanced Theme Configuration for Digital Krishi Officer
export const theme = {
  // Primary Colors - Agricultural Green Theme
  colors: {
    // Primary greens for agricultural theme
    primary: {
      50: '#f0fdf4',
      100: '#dcfce7', 
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e', // Main primary
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    
    // Secondary colors - Earth tones
    secondary: {
      50: '#fefdf8',
      100: '#fef7e0',
      200: '#fdecc8',
      300: '#fbd893',
      400: '#f9c74f', // Golden yellow for accents
      500: '#f7b32b',
      600: '#f59e0b',
      700: '#d97706',
      800: '#b45309',
      900: '#92400e',
    },
    
    // Background colors
    background: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9',
      dark: '#0f172a',
      darkSecondary: '#1e293b',
      darkTertiary: '#334155',
    },
    
    // Text colors
    text: {
      primary: '#1e293b',
      secondary: '#475569',
      tertiary: '#64748b',
      light: '#ffffff',
      muted: '#94a3b8',
    },
    
    // Status colors
    status: {
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
    
    // Border colors
    border: {
      light: '#e2e8f0',
      medium: '#cbd5e1',
      dark: '#475569',
    }
  },
  
  // Spacing scale
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem',    // 64px
  },
  
  // Typography
  typography: {
    fonts: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['Fira Code', 'monospace'],
    },
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    }
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
  
  // Border radius
  radius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px',
  },
  
  // Transitions
  transitions: {
    fast: '150ms ease',
    base: '250ms ease',
    slow: '350ms ease',
  }
};

// CSS Custom Properties for dynamic theming
export const cssVariables = `
  :root {
    /* Primary Colors */
    --color-primary-50: ${theme.colors.primary[50]};
    --color-primary-500: ${theme.colors.primary[500]};
    --color-primary-600: ${theme.colors.primary[600]};
    --color-primary-700: ${theme.colors.primary[700]};
    
    /* Secondary Colors */
    --color-secondary-400: ${theme.colors.secondary[400]};
    --color-secondary-500: ${theme.colors.secondary[500]};
    
    /* Background Colors */
    --color-bg-primary: ${theme.colors.background.primary};
    --color-bg-secondary: ${theme.colors.background.secondary};
    --color-bg-tertiary: ${theme.colors.background.tertiary};
    
    /* Text Colors */
    --color-text-primary: ${theme.colors.text.primary};
    --color-text-secondary: ${theme.colors.text.secondary};
    --color-text-light: ${theme.colors.text.light};
    
    /* Status Colors */
    --color-success: ${theme.colors.status.success};
    --color-warning: ${theme.colors.status.warning};
    --color-error: ${theme.colors.status.error};
    --color-info: ${theme.colors.status.info};
    
    /* Shadows */
    --shadow-base: ${theme.shadows.base};
    --shadow-md: ${theme.shadows.md};
    --shadow-lg: ${theme.shadows.lg};
    
    /* Transitions */
    --transition-fast: ${theme.transitions.fast};
    --transition-base: ${theme.transitions.base};
  }
`;

export default theme;
