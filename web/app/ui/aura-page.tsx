import { css } from 'remix/ui'

import { Layout } from './layout.tsx'
import { routes } from '../routes.ts'
import type { Entry, Source } from '../data/api.ts'
import { t, type Locale } from '../utils/i18n.ts'

interface AuraPageProps {
  entries: Entry[]
  sources: Source[]
  total: number
  page: number
  limit: number
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
  return ({ entries, sources, total, page, limit, activeSource, theme, locale }: AuraPageProps) => {
    const lc = (locale ?? 'zh') as Locale
    return (
    <Layout title={activeSource ? `Aura · ${activeSource}` : `Aura · ${t('nav.timeline', lc)}`} theme={theme} locale={locale}>
      <div mix={css({ maxWidth: '720px', margin: '0 auto', padding: '24px 20px 100px' })}>
        <FilterBar sources={sources} activeSource={activeSource} lc={lc} />
        <Timeline entries={entries} sources={sources} total={total} page={page} limit={limit} activeSource={activeSource} lc={lc} />
      </div>
    </Layout>
    )
  }
}

// ── Filter Bar ──

function FilterBar() {
  return ({ sources, activeSource, lc }: { sources: Source[]; activeSource?: string; lc: Locale }) => (
    <div mix={css({ display: 'flex', gap: '4px', marginBottom: '32px', overflowX: 'auto', '&::-webkit-scrollbar': { height: '0' } })}>
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
        textDecoration: 'none', padding: '5px 12px', borderRadius: '6px',
        fontSize: '12px', fontWeight: active ? 600 : 400,
        lineHeight: 1.4, whiteSpace: 'nowrap',
        transition: 'all 120ms ease',
        display: 'flex', alignItems: 'center', gap: '6px',
        background: active ? 'var(--accent-bg)' : 'transparent',
        color: active ? 'var(--accent)' : 'var(--text-muted)',
        border: active ? '1px solid var(--accent-border)' : '1px solid transparent',
        '&:hover': { background: active ? 'var(--accent-bg)' : 'var(--bg-hover)', color: active ? 'var(--accent)' : 'var(--text-secondary)' },
      })}
    >
      {dotColor && <span mix={css({ width: '6px', height: '6px', borderRadius: '50%', background: dotColor, flexShrink: 0, opacity: active ? 1 : 0.5 })}></span>}
      {label}
    </a>
  )
}

// ── Timeline ──

function Timeline() {
  return ({ entries, sources, total, page, limit, activeSource, lc }: { entries: Entry[]; sources: Source[]; total: number; page: number; limit: number; activeSource?: string; lc: Locale }) => {
    if (entries.length === 0) {
      return (
        <div mix={css({ textAlign: 'center', padding: '120px 0', color: 'var(--text-muted)' })}>
          <p mix={css({ fontSize: '15px', margin: 0, color: 'var(--text-secondary)' })}>{t('timeline.empty', lc)}</p>
          <p mix={css({ fontSize: '13px', margin: '8px 0 0', lineHeight: 1.6 })}>{t('timeline.emptyHint', lc)}</p>
        </div>
      )
    }

    const activeSrcCount = sources.filter(s => s.IsActive).length
    const groups = groupByDate(entries)
    return (
      <div>
        <div mix={css({ marginBottom: '16px', fontSize: '12px', color: 'var(--text-muted)' })}>
          {t('timeline.entries', lc, { n: total })} &middot; {t('timeline.sources', lc, { n: activeSrcCount })}
        </div>
        <div mix={css({
          position: 'relative',
          '&::before': { content: '""', position: 'absolute', left: '27px', top: '4px', bottom: '12px', width: '2px', background: 'var(--line)', opacity: 0.6, borderRadius: '1px' },
        })}>
          {groups.map((group, gi) => (
            <DateGroup date={group.date} entries={group.entries} sources={sources} isFirst={gi === 0} />
          ))}
        </div>

        <Pagination page={page} total={total} limit={limit} activeSource={activeSource} lc={lc} />
      </div>
    )
  }
}

function Pagination() {
  return ({ page, total, limit, activeSource, lc }: { page: number; total: number; limit: number; activeSource?: string; lc: Locale }) => {
    const totalPages = Math.ceil(total / limit)
    if (totalPages <= 1) return null

    const sourceParam = activeSource ? '&source=' + encodeURIComponent(activeSource) : ''
    const prevHref = routes.home.href() + '?page=' + (page - 1) + sourceParam
    const nextHref = routes.home.href() + '?page=' + (page + 1) + sourceParam

    return (
      <div mix={css({
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px',
        paddingTop: '28px',
        fontSize: '13px',
      })}>
        {page > 1 ? (
          <a href={prevHref} mix={css({ textDecoration: 'none', color: 'var(--accent)', padding: '6px 16px', borderRadius: '6px', border: '1px solid var(--accent-border)', transition: 'background 120ms', '&:hover': { background: 'var(--accent-bg)' }, })}>
            ← {t('pagination.prev', lc)}
          </a>
        ) : (
          <span mix={css({ color: 'var(--text-muted)', padding: '6px 16px', })}>← {t('pagination.prev', lc)}</span>
        )}
        <span mix={css({ color: 'var(--text-muted)' })}>{page} / {totalPages}</span>
        {page < totalPages ? (
          <a href={nextHref} mix={css({ textDecoration: 'none', color: 'var(--accent)', padding: '6px 16px', borderRadius: '6px', border: '1px solid var(--accent-border)', transition: 'background 120ms', '&:hover': { background: 'var(--accent-bg)' }, })}>
            {t('pagination.next', lc)} →
          </a>
        ) : (
          <span mix={css({ color: 'var(--text-muted)', padding: '6px 16px', })}>{t('pagination.next', lc)} →</span>
        )}
      </div>
    )
  }
}

// ── Date Group ──

function DateGroup() {
  return ({ date, entries, sources, isFirst }: { date: string; entries: Entry[]; sources: Source[]; isFirst: boolean }) => (
    <div mix={css({ marginBottom: '24px' })}>
      <div mix={css({ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', marginTop: isFirst ? '0' : '12px' })}>
        <span mix={css({ position: 'relative', zIndex: 1, width: '8px', height: '8px', borderRadius: '50%', background: 'var(--dot)', marginLeft: '24px', boxShadow: '0 0 8px var(--line-glow)', flexShrink: 0, })}></span>
        <span mix={css({ fontSize: '13px', fontWeight: 600, color: 'var(--text)', padding: '2px 10px', borderRadius: '4px', background: 'var(--date-bg)', })}>{date}</span>
      </div>
      {entries.map(entry => {
        const src = sources.find(s => s.Name === entry.Source)
        const color = src ? sourceColor(src) : 'var(--dimension-tech)'
        const pubTime = new Date(entry.PublishedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
        return (
          <TimelineEntry link={entry.Link} time={pubTime} sourceName={entry.Source} sourceColor={color} title={entry.TitleCn || entry.Title} summary={entry.SummaryCn} />
        )
      })}
    </div>
  )
}

// ── Timeline Entry ──

function TimelineEntry() {
  return ({ link, time, sourceName, sourceColor, title, summary }: { link: string; time: string; sourceName: string; sourceColor: string; title: string; summary: string }) => (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      mix={css({
        textDecoration: 'none', color: 'inherit',
        display: 'flex', alignItems: 'flex-start', gap: '0',
        padding: '10px 12px 10px 0',
        marginBottom: '2px',
        borderRadius: '8px',
        transition: 'background 120ms',
        '&:hover': { background: 'var(--bg-hover)' },
      })}
    >
      {/* Left track */}
      <div mix={css({ width: '56px', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' })}>
        <span mix={css({ width: '6px', height: '6px', borderRadius: '50%', background: sourceColor, marginTop: '7px', position: 'relative', zIndex: 1, opacity: 0.8, })}></span>
        <span mix={css({ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', })}>{time}</span>
      </div>
      {/* Content */}
      <div mix={css({ flex: '1 1 0', paddingLeft: '16px', paddingTop: '1px' })}>
        <div mix={css({ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' })}>
          <span mix={css({ fontSize: '11px', fontWeight: 600, color: sourceColor, padding: '1px 7px', borderRadius: '3px', background: 'var(--bg-surface)', flexShrink: 0, })}>{sourceName}</span>
        </div>
        <h3 mix={css({ fontSize: '15px', fontWeight: 500, lineHeight: 1.55, margin: 0, color: 'var(--text)', })}>{title}</h3>
        {summary && <p mix={css({ fontSize: '13px', lineHeight: 1.6, margin: '4px 0 0', color: 'var(--text-secondary)', })}>{summary}</p>}
      </div>
    </a>
  )
}