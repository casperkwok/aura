import { css } from 'remix/ui'

import { Layout } from './layout.tsx'
import type { Insight, Trend } from '../data/api.ts'
import { t, type Locale } from '../utils/i18n.ts'

interface InsightPageProps {
  insights: Insight[]
  total: number
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

const STATUS_COLORS: Record<string, string> = {
  emerging: 'var(--status-emerging)',
  accelerating: 'var(--status-accelerating)',
  stable: 'var(--status-stable)',
  decelerating: 'var(--status-decelerating)',
  fading: 'var(--status-fading)',
}

function statusLabel(status: string, lc: Locale): string {
  return t(`status.${status}`, lc)
}

export function InsightPage() {
  return ({ insights, total, theme, locale }: InsightPageProps) => {
    const lc = (locale ?? 'zh') as Locale
    return (
    <Layout title={`Aura · ${t('nav.insights', lc)}`} theme={theme} locale={locale}>
      <div mix={css({ maxWidth: '720px', margin: '0 auto', padding: '24px 20px 100px' })}>
        <div mix={css({ marginBottom: '16px', fontSize: '12px', color: 'var(--text-muted)' })}>
          {t('insights.weekly', lc, { n: total })}
        </div>

        {insights.length === 0 ? (
          <div mix={css({ textAlign: 'center', padding: '120px 0', color: 'var(--text-muted)' })}>
            <p mix={css({ fontSize: '15px', margin: 0, color: 'var(--text-secondary)' })}>{t('insights.empty', lc)}</p>
            <p mix={css({ fontSize: '13px', margin: '8px 0 0', lineHeight: 1.6 })}>{t('insights.emptyHint', lc)}</p>
          </div>
        ) : (
          <div mix={css({
            position: 'relative',
            '&::before': { content: '""', position: 'absolute', left: '27px', top: '4px', bottom: '12px', width: '2px', background: 'var(--line)', opacity: 0.6, borderRadius: '1px' },
          })}>
            {insights.map(insight => (
              <InsightWeekGroup insight={insight} lc={lc} />
            ))}
          </div>
        )}
      </div>
    </Layout>
    )
  }
}

function InsightWeekGroup() {
  return ({ insight, lc }: { insight: Insight; lc: Locale }) => (
    <div mix={css({ marginBottom: '32px' })}>
      {/* Week marker */}
      <div mix={css({ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' })}>
        <span mix={css({ position: 'relative', zIndex: 1, width: '8px', height: '8px', borderRadius: '50%', background: 'var(--dot)', marginLeft: '24px', boxShadow: '0 0 8px var(--line-glow)', flexShrink: 0, })}></span>
        <span mix={css({ fontSize: '13px', fontWeight: 600, color: 'var(--text)', padding: '2px 10px', borderRadius: '4px', background: 'var(--date-bg)', })}>{insight.WeekLabel}</span>
      </div>

      {/* Summary */}
      <div mix={css({ paddingLeft: '56px', marginBottom: '24px' })}>
        <p mix={css({ fontSize: '14px', lineHeight: 1.7, color: 'var(--text-secondary)', margin: 0, })}>{insight.SummaryCn}</p>
      </div>

      {/* Trends */}
      {insight.Trends.map(trend => (
        <TrendCard trend={trend} lc={lc} />
      ))}
    </div>
  )
}

function TrendCard() {
  return ({ trend, lc }: { trend: Trend; lc: Locale }) => {
    const statusColor = STATUS_COLORS[trend.Status] ?? 'var(--text-muted)'
    const sl = statusLabel(trend.Status, lc)
    const dimensions = trend.Dimensions ? trend.Dimensions.split(',') : []

    return (
      <div mix={css({ display: 'flex', alignItems: 'flex-start', gap: '0', padding: '8px 0', marginBottom: '4px' })}>
        {/* Left track */}
        <div mix={css({ width: '56px', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' })}>
          <span mix={css({ width: '6px', height: '6px', borderRadius: '50%', background: statusColor, marginTop: '9px', position: 'relative', zIndex: 1, })}></span>
          {trend.PrevStatus && trend.PrevStatus !== trend.Status && (
            <span mix={css({ fontSize: '9px', color: 'var(--text-muted)', marginTop: '6px', textAlign: 'center', lineHeight: 1.3, })}>
              {trend.PrevStatus}
            </span>
          )}
        </div>

        {/* Content */}
        <div mix={css({ flex: '1 1 0', paddingLeft: '16px', paddingTop: '1px' })}>
          {/* Status badge + name */}
          <div mix={css({ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' })}>
            <span mix={css({ fontSize: '11px', fontWeight: 600, color: statusColor, padding: '1px 7px', borderRadius: '3px', background: 'var(--bg-surface)', })}>{sl}</span>
            <span mix={css({ fontSize: '15px', fontWeight: 500, color: 'var(--text)', lineHeight: 1.45, })}>{trend.Name}</span>
          </div>

          {/* Dimension bars + confidence */}
          <div mix={css({ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' })}>
            {dimensions.map(dim => (
              <span mix={css({ width: '3px', height: '14px', borderRadius: '2px', background: DIMENSION_COLORS[dim] ?? 'var(--text-muted)', flexShrink: 0, })}></span>
            ))}
            <span mix={css({ fontSize: '10px', color: 'var(--text-muted)', marginLeft: '4px', })}>{t(`confidence.${trend.Confidence}`, lc)}</span>
          </div>

          {/* Trend summary */}
          <p mix={css({ fontSize: '13px', lineHeight: 1.6, margin: 0, color: 'var(--text-secondary)', })}>{trend.SummaryCn}</p>
        </div>
      </div>
    )
  }
}