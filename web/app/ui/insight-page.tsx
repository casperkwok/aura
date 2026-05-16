import { css, type SerializableProps } from 'remix/ui'

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
      <div
        mix={css({
          maxWidth: '720px',
          margin: '0 auto',
          padding: '20px 20px 100px',
        })}
      >
        {/* Stats */}
        <div
          mix={css({
            marginBottom: '8px',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
          })}
        >
          {t('insights.weekly', lc, { n: total })}
        </div>

        {insights.length === 0 ? (
          <div
            mix={css({
              textAlign: 'center',
              padding: '100px 0',
              color: 'var(--text-muted)',
            })}
          >
            <p mix={css({ fontSize: '14px', margin: 0 })}>{t('insights.empty', lc)}</p>
            <p mix={css({ fontSize: '12px', margin: '6px 0 0', fontFamily: 'var(--font-mono)' })}>
              {t('insights.emptyHint', lc)}
            </p>
          </div>
        ) : (
          <div
            mix={css({
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                left: '28px',
                top: 0,
                bottom: 0,
                width: '1px',
                background: 'var(--line)',
              },
            })}
          >
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
    <div
      mix={css({
        marginBottom: '36px',
      })}
    >
      {/* Week marker */}
      <div
        mix={css({
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px',
        })}
      >
        <span
          mix={css({
            position: 'relative',
            zIndex: 1,
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: 'var(--dot)',
            marginLeft: '24px',
            boxShadow: '0 0 6px var(--line-glow)',
            flexShrink: 0,
          })}
        ></span>
        <span
          mix={css({
            fontSize: '13px',
            fontWeight: 600,
            fontFamily: 'var(--font-mono)',
            color: 'var(--text)',
            background: 'var(--date-bg)',
            padding: '2px 8px',
            borderRadius: '4px',
          })}
        >
          {insight.WeekLabel}
        </span>
      </div>

      {/* Summary block */}
      <div
        mix={css({
          paddingLeft: '56px',
          marginBottom: '20px',
        })}
      >
        <p
          mix={css({
            fontSize: '14px',
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            margin: 0,
          })}
        >
          {insight.SummaryCn}
        </p>
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
      <div
        mix={css({
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0',
          padding: '10px 0',
        })}
      >
        {/* Left: timeline dot + lifecycle badge */}
        <div
          mix={css({
            width: '56px',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
          })}
        >
          <span
            mix={css({
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: statusColor,
              marginTop: '8px',
              position: 'relative',
              zIndex: 1,
            })}
          ></span>
          {/* Transition badge */}
          {trend.PrevStatus && trend.PrevStatus !== trend.Status && (
            <span
              mix={css({
                fontSize: '9px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                marginTop: '6px',
                textAlign: 'center',
                lineHeight: 1.3,
              })}
            >
              {trend.PrevStatus}
            </span>
          )}
        </div>

        {/* Right: content */}
        <div
          mix={css({
            flex: '1 1 0',
            paddingLeft: '16px',
            paddingTop: '3px',
          })}
        >
          {/* Status badge + name */}
          <div
            mix={css({
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '4px',
            })}
          >
            <span
              mix={css({
                fontSize: '10px',
                fontWeight: 600,
                color: statusColor,
                fontFamily: 'var(--font-mono)',
                padding: '1px 6px',
                borderRadius: '3px',
                background: 'var(--bg-surface)',
              })}
            >
              {sl}
            </span>
            <span
              mix={css({
                fontSize: '14px',
                fontWeight: 500,
                color: 'var(--text)',
                lineHeight: 1.4,
              })}
            >
              {trend.Name}
            </span>
          </div>

          {/* Dimension bars + confidence */}
          <div
            mix={css({
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginBottom: '6px',
            })}
          >
            {dimensions.map(dim => (
              <span
                mix={css({
                  width: '3px',
                  height: '12px',
                  borderRadius: '1px',
                  background: DIMENSION_COLORS[dim] ?? 'var(--text-muted)',
                  flexShrink: 0,
                })}
              ></span>
            ))}
            <span
              mix={css({
                fontSize: '9px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                marginLeft: '4px',
              })}
            >
              {t(`confidence.${trend.Confidence}`, lc)}
            </span>
          </div>

          {/* Summary */}
          <p
            mix={css({
              fontSize: '13px',
              lineHeight: 1.55,
              margin: 0,
              color: 'var(--text-secondary)',
            })}
          >
            {trend.SummaryCn}
          </p>
        </div>
      </div>
    )
  }
}