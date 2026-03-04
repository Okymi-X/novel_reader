export type ThemeType = 'paper' | 'light' | 'dark' | 'sepia';

export const themeConfig: Record<ThemeType, any> = {
    paper: {
        bg: 'bg-[#F5E9D9]',
        text: 'text-[#2D2D2D]',
        activeBg: 'bg-black/5',
        activeBorder: 'border-primary/30',
        activeGlow: 'shadow-[0_0_30px_rgba(255,107,53,0.06)]',
        dimmed: 'text-[#2D2D2D]/35',
        future: 'text-[#2D2D2D]/50',
        divider: 'bg-[#2D2D2D]/10',
    },
    light: {
        bg: 'bg-card',
        text: 'text-card-foreground',
        activeBg: 'bg-muted/50',
        activeBorder: 'border-primary/20',
        activeGlow: 'shadow-[0_0_30px_rgba(0,0,0,0.03)]',
        dimmed: 'text-card-foreground/30',
        future: 'text-card-foreground/45',
        divider: 'bg-border',
    },
    dark: {
        bg: 'bg-background',
        text: 'text-foreground',
        activeBg: 'bg-muted/30',
        activeBorder: 'border-primary/20',
        activeGlow: 'shadow-[0_0_40px_rgba(255,107,53,0.05)]',
        dimmed: 'text-foreground/20',
        future: 'text-foreground/35',
        divider: 'bg-border',
    },
    sepia: {
        bg: 'bg-[#F4ECD8]',
        text: 'text-[#433422]',
        activeBg: 'bg-[#EAE0C8]',
        activeBorder: 'border-[#D9A05B]/40',
        activeGlow: 'shadow-[0_0_30px_rgba(217,160,91,0.06)]',
        dimmed: 'text-[#433422]/35',
        future: 'text-[#433422]/50',
        divider: 'bg-[#433422]/10',
    },
};

export function getPastColor(theme: string): string {
    if (theme === 'dark') return 'text-stone-600';
    return 'text-stone-400';
}
