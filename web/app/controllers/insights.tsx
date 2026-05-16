import type { BuildAction } from 'remix/fetch-router'

import type { routes } from '../routes.ts'
import { fetchInsights, type Insight } from '../data/api.ts'
import { InsightPage } from '../ui/insight-page.tsx'
import { render } from '../utils/render.tsx'
import { getTheme } from '../utils/theme.ts'
import { getLocale } from '../utils/i18n.ts'

export const insights: BuildAction<'GET', typeof routes.insights> = {
  async handler({ request }) {
    const result = await fetchInsights({ limit: 20 })
    const theme = getTheme(request)
    const locale = getLocale(request)
    return render(<InsightPage insights={result.data} total={result.total} theme={theme} locale={locale} />, request)
  },
}