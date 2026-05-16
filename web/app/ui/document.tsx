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

const THEME_CSS = `
:root {
  --bg: #090d14;
  --bg-surface: #101620;
  --bg-card: #151d2a;
  --bg-hover: #1b2435;
  --bg-active: #222d40;
  --border: #242f3f;
  --border-subtle: #1a2433;
  --line: #1e2a3a;
  --line-glow: #4499ff40;
  --dot: #4499ff;
  --text: #d6dde6;
  --text-secondary: #8591a3;
  --text-muted: #657080;
  --accent: #4499ff;
  --accent-bg: #4499ff12;
  --accent-border: #4499ff33;
  --date-bg: #101620;
  --dimension-tech: #4499ff;
  --dimension-product: #ff8a3d;
  --dimension-capital: #d4a829;
  --dimension-talent: #3fbd61;
  --dimension-opinion: #a37cf0;
  --status-emerging: #4499ff;
  --status-accelerating: #3fbd61;
  --status-stable: #d4a829;
  --status-decelerating: #ff8a3d;
  --status-fading: #657080;
}
:root[data-theme="light"] {
  --bg: #f4f6f9;
  --bg-surface: #edf0f3;
  --bg-card: #ffffff;
  --bg-hover: #f0f3f7;
  --bg-active: #e8ecf2;
  --border: #d3d9e2;
  --border-subtle: #e2e6ed;
  --line: #d0d7e0;
  --line-glow: #1a6fe020;
  --dot: #1a6fe0;
  --text: #192030;
  --text-secondary: #4d5663;
  --text-muted: #7d8594;
  --accent: #1a6fe0;
  --accent-bg: #1a6fe00a;
  --accent-border: #1a6fe028;
  --date-bg: #edf0f3;
  --dimension-tech: #1a6fe0;
  --dimension-product: #d46a0c;
  --dimension-capital: #b8920c;
  --dimension-talent: #1e7b34;
  --dimension-opinion: #7635e6;
  --status-emerging: #1a6fe0;
  --status-accelerating: #1e7b34;
  --status-stable: #b8920c;
  --status-decelerating: #d46a0c;
  --status-fading: #7d8594;
}
:root:not([data-theme]) {
  @media (prefers-color-scheme: light) {
    --bg: #f4f6f9;
    --bg-surface: #edf0f3;
    --bg-card: #ffffff;
    --bg-hover: #f0f3f7;
    --bg-active: #e8ecf2;
    --border: #d3d9e2;
    --border-subtle: #e2e6ed;
    --line: #d0d7e0;
    --line-glow: #1a6fe020;
    --dot: #1a6fe0;
    --text: #192030;
    --text-secondary: #4d5663;
    --text-muted: #7d8594;
    --accent: #1a6fe0;
    --accent-bg: #1a6fe00a;
    --accent-border: #1a6fe028;
    --date-bg: #edf0f3;
    --dimension-tech: #1a6fe0;
    --dimension-product: #d46a0c;
    --dimension-capital: #b8920c;
    --dimension-talent: #1e7b34;
    --dimension-opinion: #7635e6;
    --status-emerging: #1a6fe0;
    --status-accelerating: #1e7b34;
    --status-stable: #b8920c;
    --status-decelerating: #d46a0c;
    --status-fading: #7d8594;
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