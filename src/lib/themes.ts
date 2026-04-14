export const themes: Record<string, Record<string, string>> = {
  "brass-luxe": {
    "--color-bg": "#0B0B0D",
    "--color-surface": "#141414",
    "--color-primary": "#D4AF37",
    "--color-accent": "#C8860A",
    "--color-text": "#F5F0E8",
    "--color-muted": "#888880",
    "--color-border": "#2A2A2A",
    "--color-cta-bg": "#D4AF37",
    "--color-cta-text": "#0B0B0D",
    "--overlay-opacity": "0.65",
  },
  "day-party-summer": {
    "--color-bg": "#FAF6EF",
    "--color-surface": "#FFFFFF",
    "--color-primary": "#C9A84C",
    "--color-accent": "#8B2020",
    "--color-text": "#1A1A1A",
    "--color-muted": "#7A7060",
    "--color-border": "#E8E0D0",
    "--color-cta-bg": "#C9A84C",
    "--color-cta-text": "#FAF6EF",
    "--overlay-opacity": "0.45",
  },
  "holiday-patriotic": {
    "--color-bg": "#0A0A0F",
    "--color-surface": "#12121A",
    "--color-primary": "#D4AF37",
    "--color-accent": "#8B0000",
    "--color-text": "#F0EEE8",
    "--color-muted": "#777788",
    "--color-border": "#1E1E28",
    "--color-cta-bg": "#8B0000",
    "--color-cta-text": "#F0EEE8",
    "--overlay-opacity": "0.70",
  },
  "vip-after-dark": {
    "--color-bg": "#080808",
    "--color-surface": "#101010",
    "--color-primary": "#E8D5A0",
    "--color-accent": "#D4AF37",
    "--color-text": "#EDE8E0",
    "--color-muted": "#666660",
    "--color-border": "#1C1C1C",
    "--color-cta-bg": "#D4AF37",
    "--color-cta-text": "#080808",
    "--overlay-opacity": "0.75",
  },
};

export function applyTheme(preset: string) {
  const vars = themes[preset];
  if (!vars) return;
  const root = document.documentElement;
  Object.entries(vars).forEach(([key, val]) => {
    root.style.setProperty(key, val);
  });
}
