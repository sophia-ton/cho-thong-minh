/** Fluent 2-inspired token mapping. All colors come from CSS variables in src/index.css */
const v = (n) => `rgb(var(--${n}) / <alpha-value>)`;
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        canvas: v('bg-canvas'), surface: v('bg-surface'), subtle: v('bg-subtle'), hover: v('bg-hover'),
        brand: { DEFAULT: v('brand'), hover: v('brand-hover'), pressed: v('brand-pressed'), soft: v('brand-soft'), fg: v('brand-fg') },
        fg: { DEFAULT: v('fg-primary'), 2: v('fg-secondary'), 3: v('fg-muted'), inv: v('fg-inverse') },
        line: { DEFAULT: v('border-subtle'), strong: v('border-strong') },
        ok: { DEFAULT: v('ok'), soft: v('ok-soft') }, warn: { DEFAULT: v('warn'), soft: v('warn-soft') },
        bad: { DEFAULT: v('bad'), soft: v('bad-soft') }, info: { DEFAULT: v('info'), soft: v('info-soft') },
        idle: { DEFAULT: v('idle'), soft: v('idle-soft') },
      },
      borderRadius: { control: '4px', card: '8px', panel: '12px' },
      boxShadow: { card: 'var(--shadow-card)', flyout: 'var(--shadow-flyout)', dialog: 'var(--shadow-dialog)' },
      fontFamily: { sans: ['"Segoe UI Variable Text"', '"Segoe UI"', '"Be Vietnam Pro"', 'system-ui', 'sans-serif'], mono: ['"Cascadia Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'] },
      fontSize: { cap: ['12px', '16px'], body: ['14px', '20px'], sub: ['16px', '22px'], title3: ['20px', '28px'], title2: ['24px', '32px'], title1: ['28px', '36px'], hero: ['32px', '40px'] },
    },
  },
  safelist: ['text-ok','text-warn','text-bad','text-info','text-idle','text-brand'],
  plugins: [],
};
