const API_BASE = process.env.AURA_API_URL ?? 'http://localhost:8081/api'

export interface Entry {
  ID: number
  Source: string
  Dimension: string
  Title: string
  TitleCn: string
  Description: string
  SummaryCn: string
  Link: string
  PublishedAt: string
}

export interface Source {
  ID: number
  Name: string
  URL: string
  IsActive: boolean
  Dimension: string
  LastScrapedAt: string | null
  ErrorCount: number
  LastError: string
}

export interface EntriesResponse {
  data: Entry[]
  total: number
  page: number
  limit: number
}

export interface Trend {
  ID: number
  InsightID: number
  Name: string
  Status: string
  PrevStatus: string
  Confidence: string
  Dimensions: string
  EvidenceIDs: string
  SummaryCn: string
  ParentTrendID: number | null
}

export interface Insight {
  ID: number
  WeekLabel: string
  ParentID: number | null
  SummaryCn: string
  Status: string
  Trends: Trend[]
}

export async function fetchEntries(params?: { source?: string; page?: number; limit?: number }): Promise<EntriesResponse> {
  const query = new URLSearchParams()
  if (params?.source) query.set('source', params.source)
  if (params?.page) query.set('page', String(params.page))
  if (params?.limit) query.set('limit', String(params.limit))

  const url = `${API_BASE}/entries${query.toString() ? '?' + query.toString() : ''}`
  const res = await fetch(url)
  return res.json()
}

export async function fetchSources(): Promise<{ data: Source[] }> {
  const res = await fetch(`${API_BASE}/sources`)
  return res.json()
}

export async function fetchInsights(params?: { page?: number; limit?: number }): Promise<{ data: Insight[]; total: number; page: number; limit: number }> {
  const query = new URLSearchParams()
  if (params?.page) query.set('page', String(params.page))
  if (params?.limit) query.set('limit', String(params.limit))

  const url = `${API_BASE}/insights${query.toString() ? '?' + query.toString() : ''}`
  const res = await fetch(url)
  return res.json()
}

export async function triggerScrape(sourceId?: number): Promise<{ message: string }> {
  const body = sourceId ? { source_id: sourceId } : {}
  const res = await fetch(`${API_BASE}/scrape`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return res.json()
}

export async function triggerInsightGeneration(): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/insights/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  })
  return res.json()
}