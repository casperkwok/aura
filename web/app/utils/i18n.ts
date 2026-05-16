export type Locale = 'zh' | 'en'

const zh: Record<string, string> = {
  'nav.timeline': '时间线',
  'nav.insights': '洞察',
  'nav.sources': '数据源',
  'insights.title': '洞察',
  'insights.empty': '暂无洞察',
  'insights.emptyHint': '从 API 触发生成，或等待下周一自动同步。',
  'insights.weekly': '{n} 条周洞察',
  'insights.summary': '综述',
  'timeline.all': '全部',
  'timeline.entries': '{n} 条条目',
  'timeline.sources': '{n} 个活跃源',
  'timeline.empty': '暂无条目',
  'timeline.emptyHint': '从数据源页面触发抓取，或等待下次定时同步。',
  'sources.title': '数据源',
  'sources.never': '从未',
  'sources.errors': '{n} 个错误',
  'status.emerging': '新兴',
  'status.accelerating': '加速',
  'status.stable': '稳定',
  'status.decelerating': '减速',
  'status.fading': '消退',
  'confidence.low': '低',
  'confidence.medium': '中',
  'confidence.high': '高',
  'theme.light': '浅色',
  'theme.dark': '深色',
  'lang.switch': 'Switch to English',
}

const en: Record<string, string> = {
  'nav.timeline': 'Timeline',
  'nav.insights': 'Insights',
  'nav.sources': 'Sources',
  'insights.title': 'Insights',
  'insights.empty': 'No insights yet',
  'insights.emptyHint': 'Trigger generation from the API, or wait for the next Monday sync.',
  'insights.weekly': '{n} weekly insights',
  'insights.summary': 'Summary',
  'timeline.all': 'All',
  'timeline.entries': '{n} entries',
  'timeline.sources': '{n} active sources',
  'timeline.empty': 'No entries yet',
  'timeline.emptyHint': 'Trigger a scrape from Sources, or wait for the next scheduled sync.',
  'sources.title': 'Sources',
  'sources.never': 'Never',
  'sources.errors': '{n} errors',
  'status.emerging': 'Emerging',
  'status.accelerating': 'Accelerating',
  'status.stable': 'Stable',
  'status.decelerating': 'Decelerating',
  'status.fading': 'Fading',
  'confidence.low': 'low',
  'confidence.medium': 'medium',
  'confidence.high': 'high',
  'theme.light': 'Light',
  'theme.dark': 'Dark',
  'lang.switch': '切换为中文',
}

const maps: Record<Locale, Record<string, string>> = { zh, en }

export function t(key: string, locale: Locale, params?: Record<string, string | number>): string {
  let text = maps[locale]?.[key] ?? maps.en[key] ?? key
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, String(v))
    }
  }
  return text
}

export function getLocale(request: Request): Locale {
  const cookie = request.headers.get('cookie') ?? ''
  const match = cookie.match(/aura-lang=(zh|en)/)
  if (match) return match[1] as Locale
  // Default to zh for Chinese-speaking user
  return 'zh'
}
