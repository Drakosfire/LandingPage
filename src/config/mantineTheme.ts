import { createTheme, MantineColorsTuple, DefaultMantineColor } from '@mantine/core';

// Extend Mantine's color types to include our custom colors
type ExtendedCustomColors = 'parchment' | 'rarity-common' | 'rarity-uncommon' | 'rarity-rare' | 'rarity-epic' | 'rarity-legendary' | DefaultMantineColor;

declare module '@mantine/core' {
    export interface MantineThemeColorsOverride {
        colors: Record<ExtendedCustomColors, MantineColorsTuple>;
    }
}

// Map existing design tokens to Mantine theme
export const dungeonMindTheme = createTheme({
    // Color System - Preserving existing design tokens
    colors: {
        // Primary color palette
        blue: [
            '#e7f3ff',
            '#d1e7ff',
            '#a3ceff',
            '#74b5ff',
            '#4a90e2', // --primary-blue (index 4 = Mantine's default primary)
            '#357abd', // --primary-blue-dark
            '#2968a3',
            '#1e5789',
            '#13456f',
            '#083355'
        ],

        // Custom parchment colors
        parchment: [
            '#fefcf9',
            '#faf7f2',
            '#f7f4ed',
            '#f4f1e8', // --parchment-base (index 3)
            '#f0eddf',
            '#ebe7d5',
            '#e6e1cb',
            '#e0dbc1',
            '#dbd5b7',
            '#d5cfad'
        ],

        // Success/Error colors
        green: [
            '#f0fff4',
            '#c6f6d5',
            '#9ae6b4',
            '#68d391',
            '#7ed321', // --success-green
            '#48bb78',
            '#38a169',
            '#2f855a',
            '#276749',
            '#22543d'
        ],

        red: [
            '#fff5f5',
            '#fed7d7',
            '#feb2b2',
            '#fc8181',
            '#d0021b', // --error-red
            '#e53e3e',
            '#c53030',
            '#9b2c2c',
            '#822727',
            '#63171b'
        ],

        // Rarity colors as custom color tuples
        'rarity-common': [
            '#f7f7f7',
            '#f0f0f0',
            '#e0e0e0',
            '#cfcfcf',
            '#9b9b9b', // --common-gray
            '#8a8a8a',
            '#787878',
            '#666666',
            '#545454',
            '#424242'
        ],

        'rarity-uncommon': [
            '#f0fff4',
            '#c6f6d5',
            '#9ae6b4',
            '#68d391',
            '#1eff00', // --uncommon-green
            '#48bb78',
            '#38a169',
            '#2f855a',
            '#276749',
            '#22543d'
        ],

        'rarity-rare': [
            '#e6f3ff',
            '#bfd9ff',
            '#99bfff',
            '#73a5ff',
            '#0070dd', // --rare-blue
            '#4d8aff',
            '#2670ff',
            '#0056b3',
            '#003d80',
            '#00244d'
        ],

        'rarity-epic': [
            '#f3e8ff',
            '#e9d5ff',
            '#d8b4fe',
            '#c084fc',
            '#a335ee', // --epic-purple
            '#9333ea',
            '#7c3aed',
            '#6d28d9',
            '#5b21b6',
            '#4c1d95'
        ],

        'rarity-legendary': [
            '#fff7ed',
            '#ffedd5',
            '#fed7aa',
            '#fdba74',
            '#ff8000', // --legendary-orange
            '#fb923c',
            '#f97316',
            '#ea580c',
            '#dc2626',
            '#b91c1c'
        ]
    },

    // Primary color
    primaryColor: 'blue',

    // Font System - Preserving existing typography
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", system-ui, sans-serif', // --font-system
    headings: {
        fontFamily: 'Balgruf, serif', // --font-primary
        sizes: {
            h1: { fontSize: '2rem', lineHeight: '1.25' },     // --text-2xl, --leading-tight
            h2: { fontSize: '1.5rem', lineHeight: '1.25' },   // --text-xl, --leading-tight  
            h3: { fontSize: '1.125rem', lineHeight: '1.5' },  // --text-lg, --leading-normal
            h4: { fontSize: '1rem', lineHeight: '1.5' },      // --text-base, --leading-normal
            h5: { fontSize: '0.875rem', lineHeight: '1.5' },  // --text-sm, --leading-normal
            h6: { fontSize: '0.75rem', lineHeight: '1.5' }    // --text-xs, --leading-normal
        }
    },

    fontSizes: {
        xs: '0.75rem',  // --text-xs (12px)
        sm: '0.875rem', // --text-sm (14px)  
        md: '1rem',     // --text-base (16px)
        lg: '1.125rem', // --text-lg (18px)
        xl: '1.5rem',   // --text-xl (24px)
        xxl: '2rem'     // --text-2xl (32px)
    },

    lineHeights: {
        xs: '1.25',  // --leading-tight
        sm: '1.5',   // --leading-normal  
        md: '1.5',   // --leading-normal
        lg: '1.75'   // --leading-relaxed
    },

    // Spacing System - Preserving existing spacing tokens
    spacing: {
        xs: '0.25rem', // --space-1 (4px)
        sm: '0.5rem',  // --space-2 (8px)
        md: '1rem',    // --space-4 (16px)
        lg: '1.5rem',  // --space-6 (24px)
        xl: '2rem',    // --space-8 (32px)
        xxl: '3rem'    // --space-12 (48px)
    },

    // Border Radius - Preserving existing radius tokens
    radius: {
        xs: '0.25rem', // --radius-sm (4px)
        sm: '0.5rem',  // --radius-base (8px)
        md: '0.75rem', // --radius-lg (12px)
        lg: '1rem',    // --radius-xl (16px)
        xl: '9999px'   // --radius-full
    },

    // Shadow System - Preserving existing shadows
    shadows: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',                                    // --shadow-sm
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',  // --shadow-base
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // --shadow-md
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', // --shadow-lg
        xl: '0 4px 12px rgba(74, 144, 226, 0.3)'  // --shadow-primary
    },

    // Breakpoints - Preserving existing breakpoint system
    breakpoints: {
        xs: '480px',
        sm: '768px',  // --breakpoint-mobile
        md: '1024px', // --breakpoint-tablet  
        lg: '1280px', // --breakpoint-desktop
        xl: '1440px'
    },

    // Component-specific overrides
    components: {
        Container: {
            defaultProps: {
                sizes: {
                    xs: '100%',
                    sm: '100%',
                    md: '100%',
                    lg: '1280px', // Match existing max-width
                    xl: '1280px'
                }
            }
        },

        Grid: {
            defaultProps: {
                gutter: 'md' // --space-4 equivalent
            }
        },

        Card: {
            defaultProps: {
                shadow: 'sm',
                radius: 'md',
                withBorder: true
            },
            styles: {
                root: {
                    backgroundColor: 'var(--mantine-color-parchment-3)', // --parchment-base equivalent
                    borderColor: 'var(--mantine-color-blue-4)',          // --primary-blue equivalent
                    borderWidth: '2px'
                }
            }
        },

        Button: {
            defaultProps: {
                size: 'md',
                radius: 'sm'
            },
            styles: {
                root: {
                    fontWeight: 600, // --font-semibold
                    transition: 'all 0.2s ease'
                }
            }
        },

        Paper: {
            defaultProps: {
                shadow: 'sm',
                radius: 'md',
                p: 'lg'
            },
            styles: {
                root: {
                    backgroundColor: 'var(--mantine-color-parchment-3)'
                }
            }
        }
    }
});

export default dungeonMindTheme; 