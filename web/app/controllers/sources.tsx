import type { BuildAction } from 'remix/fetch-router'

import type { routes } from '../routes.ts'
import { fetchSources, type Source } from '../data/api.ts'
import { SourcesPage } from '../ui/sources-page.tsx'
import { render } from '../utils/render.tsx'
import { getTheme } from '../utils/theme.ts'
import { getLocale } from '../utils/i18n.ts'

export const sources: BuildAction<'GET', typeof routes.sources> = {
  async handler({ request }) {
    const sources = await fetchSources()
    const theme = getTheme(request)
    const locale = getLocale(request)
    return render(<SourcesPage sources={sources.data} theme={theme} locale={locale} />, request)
  },
}