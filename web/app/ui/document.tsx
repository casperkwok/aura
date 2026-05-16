import type { RemixNode } from 'remix/ui'
import { css } from 'remix/ui'

import { routes } from '../routes.ts'

export interface DocumentProps {
  children?: RemixNode
  title?: string
  theme?: 'dark' | 'light'
}

const DEFAULT_TITLE = 'Aura'

const FONT_BODY =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif"
const FONT_MONO = "'JetBrains Mono', 'Fira Code', ui-monospace, monospace"

// Global theme variables as a <style> block, driven by data-theme attribute
const THEME_CSS = `
:root {
  --bg: #0c0f15;
  --bg-surface: #141922;
  --bg-card: #1a2130;
  --bg-hover: #222a3a;
  --bg-active: #2a3348;
  --border: #2a3545;
  --border-subtle: #1e2838;
  --line: #2a3545;
  --line-glow: #58a6ff40;
  --dot: #58a6ff;
  --text: #d4dbe5;
  --text-secondary: #8b9ab5;
  --text-muted: #5a6878;
  --accent: #58a6ff;
  --accent-bg: #58a6ff18;
  --accent-border: #58a6ff40;
  --source-industry: #f0883e;
  --source-research: #bc8cff;
  --source-opensource: #56d364;
  --source-default: #8b9ab5;
  --date-bg: #141922;
  --dimension-tech: #58a6ff;
  --dimension-product: #f0883e;
  --dimension-capital: #e6b422;
  --dimension-talent: #56d364;
  --dimension-opinion: #bc8cff;
  --status-emerging: #58a6ff;
  --status-accelerating: #3fb950;
  --status-stable: #e6b422;
  --status-decelerating: #f0883e;
  --status-fading: #8b9ab5;
}
:root[data-theme="light"] {
  --bg: #f5f7f9;
  --bg-surface: #eef0f4;
  --bg-card: #ffffff;
  --bg-hover: #f0f2f6;
  --bg-active: #e6e8ec;
  --border: #d4dae3;
  --border-subtle: #e4e8ee;
  --line: #c8d0dc;
  --line-glow: #0969da20;
  --dot: #0969da;
  --text: #1c2433;
  --text-secondary: #4b5565;
  --text-muted: #8a94a0;
  --accent: #0969da;
  --accent-bg: #0969da10;
  --accent-border: #0969da30;
  --source-industry: #c67500;
  --source-research: #7c3aed;
  --source-opensource: #168a3c;
  --source-default: #4b5565;
  --date-bg: #eef0f4;
  --dimension-tech: #0969da;
  --dimension-product: #c67500;
  --dimension-capital: #bf8700;
  --dimension-talent: #1a7f37;
  --dimension-opinion: #8250df;
  --status-emerging: #0969da;
  --status-accelerating: #1a7f37;
  --status-stable: #bf8700;
  --status-decelerating: #c67500;
  --status-fading: #656d76;
}
/* When no explicit theme is set, respect system preference */
:root:not([data-theme]) {
  @media (prefers-color-scheme: light) {
    --bg: #f5f7f9;
    --bg-surface: #eef0f4;
    --bg-card: #ffffff;
    --bg-hover: #f0f2f6;
    --bg-active: #e6e8ec;
    --border: #d4dae3;
    --border-subtle: #e4e8ee;
    --line: #c8d0dc;
    --line-glow: #0969da20;
    --dot: #0969da;
    --text: #1c2433;
    --text-secondary: #4b5565;
    --text-muted: #8a94a0;
    --accent: #0969da;
    --accent-bg: #0969da10;
    --accent-border: #0969da30;
    --source-industry: #c67500;
    --source-research: #7c3aed;
    --source-opensource: #168a3c;
    --source-default: #4b5565;
    --date-bg: #eef0f4;
  }
}
`

export function Document() {
  return ({ title = DEFAULT_TITLE, children, theme }: DocumentProps) => (
    <html lang="zh-CN" data-theme={theme ?? 'dark'}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="dark light" />
        <title>{title}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700&family=JetBrains+Mono:wght@400;600&display=swap"
        />
        <style>{THEME_CSS}</style>
        <script type="module" src={routes.assets.href({ path: 'app/assets/entry.ts' })}></script>
      </head>
      <body
        mix={css({
          '--font-body': FONT_BODY,
          '--font-mono': FONT_MONO,
          '& *, & *::before, & *::after': { boxSizing: 'border-box' },
          margin: 0,
          padding: 0,
          minHeight: '100vh',
          background: 'var(--bg)',
          color: 'var(--text)',
          fontFamily: 'var(--font-body)',
          fontSize: '15px',
          lineHeight: 1.6,
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        })}
      >
        {children}
      </body>
    </html>
  )
}