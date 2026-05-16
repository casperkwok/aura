export function getTheme(request: Request): 'dark' | 'light' {
  const cookie = request.headers.get('cookie') ?? ''
  const match = cookie.match(/aura-theme=(dark|light)/)
  if (match) return match[1] as 'dark' | 'light'

  // Fallback to system preference
  const secCH = request.headers.get('sec-ch-prefers-color-scheme')
  if (secCH === 'light') return 'light'

  return 'dark'
}