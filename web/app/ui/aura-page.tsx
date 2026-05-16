import { css, type SerializableProps } from 'remix/ui'

import { Layout } from './layout.tsx'
import { routes } from '../routes.ts'
import type { Entry, Source } from '../data/api.ts'
import { t, type Locale } from '../utils/i18n.ts'

interface AuraPageProps {
  entries: Entry[]
  sources: Source[]
  total: number
  activeSource?: string
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

function sourceColor(src: Source): string {
  return DIMENSION_COLORS[src.Dimension] ?? 'var(--dimension-tech)'
}

// Group entries by date
function groupByDate(entries: Entry[]): { date: string; entries: Entry[] }[] {
  const groups: Map<string, Entry[]> = new Map()
  for (const e of entries) {
    const d = new Date(e.PublishedAt)
    const key = d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
    const existing = groups.get(key)
    if (existing) existing.push(e)
    else groups.set(key, [e])
  }
  return Array.from(groups, ([date, entries]) => ({ date, entries }))
}

export function AuraPage() {
  return ({ entries, sources, total, activeSource, theme, locale }: AuraPageProps) => {
    const lc = (locale ?? 'zh') as Locale
    return (
    <Layout title={activeSource ? `Aura · ${activeSource}` : `Aura · ${t('nav.timeline', lc)}`} theme={theme} locale={locale}>
      <div
        mix={css({
          maxWidth: '720px',
          margin: '0 auto',
          padding: '20px 20px 100px',
        })}
      >
        {/* Filter tabs */}
        <FilterBar sources={sources} activeSource={activeSource} lc={lc} />
        {/* Timeline */}
        <Timeline entries={entries} sources={sources} total={total} activeSource={activeSource} lc={lc} />
      </div>
    </Layout>
    )
  }
}

// ── Filter Bar ──

function FilterBar() {
  return ({ sources, activeSource, lc }: { sources: Source[]; activeSource?: string; lc: Locale }) => (
    <div
      mix={css({
        display: 'flex',
        gap: '4px',
        marginBottom: '32px',
        overflowX: 'auto',
        '&::-webkit-scrollbar': { height: '0' },
      })}
    >
      <Tab href={routes.home.href()} label={t('timeline.all', lc)} active={!activeSource} />
      {sources.filter(s => s.IsActive).map(s => (
        <Tab
          href={routes.home.href() + '?source=' + encodeURIComponent(s.Name)}
          label={s.Name}
          active={activeSource === s.Name}
          dotColor={sourceColor(s)}
        />
      ))}
    </div>
  )
}

function Tab() {
  return ({ href, label, active, dotColor }: { href: string; label: string; active: boolean; dotColor?: string }) => (
    <a
      href={href}
      mix={css({
        textDecoration: 'none',
        padding: '5px 12px',
        borderRadius: '5px',
        fontSize: '12px',
        fontWeight: active ? 600 : 400,
        fontFamily: 'var(--font-mono)',
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
        transition: 'all 100ms ease',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: active ? 'var(--accent-bg)' : 'transparent',
        color: active ? 'var(--accent)' : 'var(--text-muted)',
        border: active ? '1px solid var(--accent-border)' : '1px solid transparent',
        '&:hover': {
          background: active ? 'var(--accent-bg)' : 'var(--bg-hover)',
          color: active ? 'var(--accent)' : 'var(--text-secondary)',
        },
      })}
    >
      {dotColor && (
        <span
          mix={css({
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: dotColor,
            flexShrink: 0,
            opacity: active ? 1 : 0.5,
          })}
        ></span>
      )}
      {label}
    </a>
  )
}

// ── Timeline ──

function Timeline() {
  return ({ entries, sources, total, activeSource, lc }: { entries: Entry[]; sources: Source[]; total: number; activeSource?: string; lc: Locale }) => {
    if (entries.length === 0) {
      return (
        <div
          mix={css({
            textAlign: 'center',
            padding: '100px 0',
            color: 'var(--text-muted)',
          })}
        >
          <p mix={css({ fontSize: '14px', margin: 0 })}>{t('timeline.empty', lc)}</p>
          <p mix={css({ fontSize: '12px', margin: '6px 0 0', fontFamily: 'var(--font-mono)' })}>
            {t('timeline.emptyHint', lc)}
          </p>
        </div>
      )
    }

    const activeSrcCount = sources.filter(s => s.IsActive).length
    const groups = groupByDate(entries)
    return (
      <div>
        {/* Stats */}
        <div
          mix={css({
            marginBottom: '8px',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
          })}
        >
          {t('timeline.entries', lc, { n: total })} · {t('timeline.sources', lc, { n: activeSrcCount })}
        </div>
        {/* Timeline track */}
        <div
          mix={css({
            position: 'relative',
            // Vertical line
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
          {groups.map((group, gi) => (
            <DateGroup
              date={group.date}
              entries={group.entries}
              sources={sources}
              isFirst={gi === 0}
            />
          ))}
        </div>
      </div>
    )
  }
}

// ── Date Group ──

function DateGroup() {
  return ({ date, entries, sources, isFirst }: { date: string; entries: Entry[]; sources: Source[]; isFirst: boolean }) => (
    <div
      mix={css({
        marginBottom: '28px',
      })}
    >
      {/* Date marker */}
      <div
        mix={css({
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '12px',
          marginTop: isFirst ? '0' : '8px',
        })}
      >
        {/* Timeline dot */}
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
          {date}
        </span>
      </div>
      {/* Entries under this date */}
      {entries.map(entry => {
        const src = sources.find(s => s.Name === entry.Source)
        const color = src ? sourceColor(src) : 'var(--source-default)'
        const pubTime = new Date(entry.PublishedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        return (
          <TimelineEntry
            link={entry.Link}
            time={pubTime}
            sourceName={entry.Source}
            sourceColor={color}
            title={entry.TitleCn || entry.Title}
            summary={entry.SummaryCn}
          />
        )
      })}
    </div>
  )
}

// ── Timeline Entry ──

function TimelineEntry() {
  return ({
    link,
    time,
    sourceName,
    sourceColor,
    title,
    summary,
  }: {
    link: string
    time: string
    sourceName: string
    sourceColor: string
    title: string
    summary: string
  }) => (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      mix={css({
        textDecoration: 'none',
        color: 'inherit',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0',
        padding: '8px 0',
        transition: 'background 100ms',
        borderRadius: '6px',
        '&:hover': { background: 'var(--bg-hover)' },
      })}
    >
      {/* Left: timeline dot + time */}
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
        {/* Small dot on the timeline */}
        <span
          mix={css({
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            background: sourceColor,
            marginTop: '8px',
            position: 'relative',
            zIndex: 1,
            opacity: 0.7,
          })}
        ></span>
        <span
          mix={css({
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            marginTop: '6px',
          })}
        >
          {time}
        </span>
      </div>
      {/* Right: content */}
      <div
        mix={css({
          flex: '1 1 0',
          paddingLeft: '16px',
          paddingTop: '3px',
        })}
      >
        {/* Source badge + title */}
        <div
          mix={css({
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '2px',
          })}
        >
          <span
            mix={css({
              fontSize: '10px',
              fontWeight: 600,
              color: sourceColor,
              fontFamily: 'var(--font-mono)',
              padding: '1px 6px',
              borderRadius: '3px',
              background: 'var(--bg-surface)',
              flexShrink: 0,
            })}
          >
            {sourceName}
          </span>
        </div>
        <h3
          mix={css({
            fontSize: '14px',
            fontWeight: 500,
            lineHeight: 1.55,
            margin: 0,
            color: 'var(--text)',
          })}
        >
          {title}
        </h3>
        {summary && (
          <p
            mix={css({
              fontSize: '13px',
              lineHeight: 1.55,
              margin: '3px 0 0',
              color: 'var(--text-secondary)',
            })}
          >
            {summary}
          </p>
        )}
      </div>
    </a>
  )
}