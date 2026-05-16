import { css, type SerializableProps } from 'remix/ui'

import { Layout } from './layout.tsx'
import type { Source } from '../data/api.ts'
import { t, type Locale } from '../utils/i18n.ts'

interface SourcesPageProps {
  sources: Source[]
  theme?: string
  locale?: string
}

const DIMENSION_COLORS: Record<string, string> = {
  Tech: 'var(--dimension-tech)',
  Product: 'var(--dimension-product)',
  Capital: 'var(--dimension-capital)',
  Talent: 'var(--dimension-talent)',
  Opinion: 'var(--dimension-opinion)',
}

export function SourcesPage() {
  return ({ sources, theme, locale }: SourcesPageProps) => {
    const lc = (locale ?? 'zh') as Locale
    return (
    <Layout title={`Aura · ${t('nav.sources', lc)}`} theme={theme} locale={locale}>
      <div
        mix={css({
          maxWidth: '720px',
          margin: '0 auto',
          padding: '20px 20px 100px',
        })}
      >
        <h1
          mix={css({
            fontSize: '16px',
            fontWeight: 600,
            margin: '0 0 24px',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.04em',
            color: 'var(--text)',
          })}
        >
          {t('sources.title', lc)}
        </h1>
        <div mix={css({ display: 'flex', flexDirection: 'column', gap: '8px' })}>
          {sources.map(source => (
            <SourceRow source={source} lc={lc} />
          ))}
        </div>
      </div>
    </Layout>
      )
    }
  }

function SourceRow() {
  return ({ source, lc }: { source: Source; lc: Locale }) => {
    const color = DIMENSION_COLORS[source.Dimension] ?? 'var(--dimension-tech)'
    const scraped = source.LastScrapedAt
      ? new Date(source.LastScrapedAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
      : t('sources.never', lc)

    return (
      <div
        mix={css({
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '12px 16px',
          borderRadius: '8px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          transition: 'border-color 100ms',
          '&:hover': { borderColor: 'var(--border)' },
        })}
      >
        {/* Status indicator */}
        <span
          mix={css({
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: source.IsActive ? '#3fb950' : 'var(--text-muted)',
            flexShrink: 0,
            boxShadow: source.IsActive ? '0 0 4px #3fb95040' : 'none',
          })}
        ></span>

        {/* Source color dot */}
        <span
          mix={css({
            width: '4px',
            height: '14px',
            borderRadius: '2px',
            background: color,
            flexShrink: 0,
          })}
        ></span>

        {/* Name + category */}
        <div mix={css({ flex: '1 1 0', minWidth: 0 })}>
          <div
            mix={css({
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            })}
          >
            <span
              mix={css({
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--text)',
              })}
            >
              {source.Name}
            </span>
            <span
              mix={css({
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                color: color,
              })}
            >
              {source.Dimension}
            </span>
          </div>
        </div>

        {/* Last scraped */}
        <span
          mix={css({
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            flexShrink: 0,
          })}
        >
          {scraped}
        </span>

        {/* Error count */}
        {source.ErrorCount > 0 && (
          <span
            mix={css({
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              color: '#f85149',
              flexShrink: 0,
            })}
          >
            {t('sources.errors', lc, { n: source.ErrorCount })}
          </span>
        )}
      </div>
    )
  }
}