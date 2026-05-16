import type { RemixNode } from 'remix/ui'
import { css } from 'remix/ui'

import { routes } from '../routes.ts'
import { Document } from './document.tsx'
import { ThemeToggle } from '../assets/theme-toggle.tsx'
import { LangToggle } from '../assets/lang-toggle.tsx'
import { t, type Locale } from '../utils/i18n.ts'

export interface LayoutProps {
  children?: RemixNode
  title?: string
  theme?: string
  locale?: string
}

export function Layout() {
  return ({ title, children, theme, locale }: LayoutProps) => {
    const lc = (locale ?? 'zh') as Locale
    return (
      <Document title={title} theme={theme as 'dark' | 'light' | undefined}>
        <header
          mix={css({
            position: 'sticky',
            top: 0,
            zIndex: 100,
            background: 'var(--bg)',
            borderBottom: '1px solid var(--border-subtle)',
          })}
        >
          <nav
            mix={css({
              maxWidth: '720px',
              margin: '0 auto',
              padding: '0 20px',
              height: '52px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            })}
          >
            <a
              href={routes.home.href()}
              mix={css({
                textDecoration: 'none',
                color: 'var(--text)',
                fontWeight: 700,
                fontSize: '15px',
                letterSpacing: '0.15em',
                fontFamily: 'var(--font-mono)',
                transition: 'color 120ms',
                '&:hover': { color: 'var(--accent)' },
              })}
            >
              AURA
            </a>
            <div
              mix={css({
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              })}
            >
              <NavLink href={routes.home.href()}>{t('nav.timeline', lc)}</NavLink>
              <NavLink href={routes.insights.href()}>{t('nav.insights', lc)}</NavLink>
              <NavLink href={routes.sources.href()}>{t('nav.sources', lc)}</NavLink>
              <div mix={css({ width: '1px', height: '16px', background: 'var(--border)', margin: '0 4px' })}></div>
              <LangToggle locale={lc} />
              <ThemeToggle theme={theme ?? 'dark'} />
            </div>
          </nav>
        </header>
        <main>{children}</main>
      </Document>
    )
  }
}

function NavLink() {
  return ({ href, children }: { href: string; children: string }) => (
    <a
      href={href}
      mix={css({
        textDecoration: 'none',
        color: 'var(--text-muted)',
        fontSize: '12px',
        fontWeight: 500,
        padding: '4px 8px',
        borderRadius: '5px',
        transition: 'color 120ms, background 120ms',
        '&:hover': { color: 'var(--accent)', background: 'var(--accent-bg)' },
      })}
    >
      {children}
    </a>
  )
}