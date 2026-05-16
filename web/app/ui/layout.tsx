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
                fontSize: '16px',
                letterSpacing: '0.12em',
                fontFamily: 'var(--font-mono)',
                '&:hover': { color: 'var(--accent)' },
              })}
            >
              AURA
            </a>
            <div
              mix={css({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              })}
            >
              <NavLink href={routes.home.href()}>{t('nav.timeline', lc)}</NavLink>
              <NavLink href={routes.insights.href()}>{t('nav.insights', lc)}</NavLink>
              <NavLink href={routes.sources.href()}>{t('nav.sources', lc)}</NavLink>
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
        fontFamily: 'var(--font-mono)',
        fontSize: '12px',
        '&:hover': { color: 'var(--accent)' },
      })}
    >
      {children}
    </a>
  )
}