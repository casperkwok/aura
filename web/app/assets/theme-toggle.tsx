import { clientEntry, css, on, type Handle, type SerializableProps } from 'remix/ui'

interface ThemeToggleProps extends SerializableProps {
  theme: string
}

export const ThemeToggle = clientEntry(
  import.meta.url,
  function ThemeToggle(handle: Handle<ThemeToggleProps>) {
    let currentTheme = handle.props.theme

    return () => {
      const isDark = currentTheme === 'dark'

      return (
        <button
          type="button"
          mix={[
            buttonStyle,
            on('click', () => {
              const next = isDark ? 'light' : 'dark'
              currentTheme = next
              localStorage.setItem('aura-theme', next)
              document.documentElement.setAttribute('data-theme', next)
              handle.update()
            }),
          ]}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Light' : 'Dark'}
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </button>
      )
    }
  },
)

function SunIcon() {
  return () => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round">
      <circle cx="8" cy="8" r="3.5" />
      <line x1="8" y1="1" x2="8" y2="3" />
      <line x1="8" y1="13" x2="8" y2="15" />
      <line x1="1" y1="8" x2="3" y2="8" />
      <line x1="13" y1="8" x2="15" y2="8" />
      <line x1="3.05" y1="3.05" x2="4.5" y2="4.5" />
      <line x1="11.5" y1="11.5" x2="12.95" y2="12.95" />
      <line x1="3.05" y1="12.95" x2="4.5" y2="11.5" />
      <line x1="11.5" y1="4.5" x2="12.95" y2="3.05" />
    </svg>
  )
}

function MoonIcon() {
  return () => (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round">
      <path d="M8.5 2.5a5.5 5.5 0 1 0 5 8.5 4.5 4.5 0 0 1-5-8.5z" />
    </svg>
  )
}

const buttonStyle = css({
  appearance: 'none',
  background: 'transparent',
  border: '1px solid var(--border)',
  borderRadius: '6px',
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: 'var(--text-muted)',
  padding: '0',
  transition: 'border-color 100ms, color 100ms',
  '&:hover': {
    borderColor: 'var(--accent)',
    color: 'var(--accent)',
  },
  '& svg': {
    width: '16px',
    height: '16px',
    display: 'block',
  },
})