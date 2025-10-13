import { type Theme } from '../contexts/ThemeContext';

/**
 * Get theme-specific class names for components
 */
export const getThemeClass = (theme: Theme, baseClass: string = '') => {
    return `theme-${theme} ${baseClass}`.trim();
};

/**
 * Get theme-specific colors
 */
export const getThemeColors = (theme: Theme) => {
    if (theme === 'dark') {
        return {
            background: '#000000',
            foreground: '#ffffff',
            muted: '#111827',
            border: '#374151',
            accent: '#ffffff',
            card: '#1f2937',
            cardHover: '#374151',
            text: {
                primary: '#ffffff',
                secondary: '#d1d5db',
                muted: '#9ca3af',
                accent: '#60a5fa'
            }
        };
    }

    return {
        background: '#ffffff',
        foreground: '#000000',
        muted: '#f9fafb',
        border: '#e5e7eb',
        accent: '#000000',
        card: '#ffffff',
        cardHover: '#f3f4f6',
        text: {
            primary: '#1f2937',
            secondary: '#374151',
            muted: '#6b7280',
            accent: '#2563eb'
        }
    };
};

/**
 * Apply theme-aware styles to elements
 */
export const applyThemeStyles = (theme: Theme, element: HTMLElement) => {
    const colors = getThemeColors(theme);
    element.style.setProperty('--theme-background', colors.background);
    element.style.setProperty('--theme-foreground', colors.foreground);
    element.style.setProperty('--theme-muted', colors.muted);
    element.style.setProperty('--theme-border', colors.border);
    element.style.setProperty('--theme-accent', colors.accent);
    element.style.setProperty('--theme-card', colors.card);
    element.style.setProperty('--theme-card-hover', colors.cardHover);
};

/**
 * Generate theme-aware CSS custom properties
 */
export const generateThemeVars = (theme: Theme) => {
    const colors = getThemeColors(theme);
    return {
        '--theme-background': colors.background,
        '--theme-foreground': colors.foreground,
        '--theme-muted': colors.muted,
        '--theme-border': colors.border,
        '--theme-accent': colors.accent,
        '--theme-card': colors.card,
        '--theme-card-hover': colors.cardHover,
        '--theme-text-primary': colors.text.primary,
        '--theme-text-secondary': colors.text.secondary,
        '--theme-text-muted': colors.text.muted,
        '--theme-text-accent': colors.text.accent,
    } as React.CSSProperties;
}; 