import type { BuildAction } from 'remix/fetch-router'

import type { routes } from '../routes.ts'
import { fetchEntries, fetchSources, type Entry, type Source } from '../data/api.ts'
import { AuraPage } from '../ui/aura-page.tsx'
import { render } from '../utils/render.tsx'
import { getTheme } from '../utils/theme.ts'
import { getLocale } from '../utils/i18n.ts'

export const home: BuildAction<'GET', typeof routes.home> = {
  async handler({ request }) {
    const url = new URL(request.url)
    const sourceFilter = url.searchParams.get('source') ?? undefined
    const entries = await fetchEntries({ source: sourceFilter, limit: 50 })
    const sources = await fetchSources()
    const theme = getTheme(request)
    const locale = getLocale(request)
    return render(
      <AuraPage entries={entries.data} sources={sources.data} total={entries.total} activeSource={sourceFilter} theme={theme} locale={locale} />,
      request,
    )
  },
}