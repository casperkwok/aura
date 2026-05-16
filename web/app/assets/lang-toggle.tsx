import { clientEntry, css, on, type Handle, type SerializableProps } from 'remix/ui'

interface LangToggleProps extends SerializableProps {
  locale: string
}

export const LangToggle = clientEntry(
  import.meta.url,
  function LangToggle(handle: Handle<LangToggleProps>) {
    let currentLocale = handle.props.locale

    return () => {
      const isZh = currentLocale === 'zh'
      const label = isZh ? 'EN' : '中'

      return (
        <button
          type="button"
          mix={[buttonStyle, on('click', () => {
            const next = isZh ? 'en' : 'zh'
            currentLocale = next
            localStorage.setItem('aura-lang', next)
            document.cookie = `aura-lang=${next};path=/;max-age=31536000`
            window.location.reload()
          })]}
          aria-label={isZh ? 'Switch to English' : '切换为中文'}
          title={isZh ? 'English' : '中文'}
        >
          {label}
        </button>
      )
    }
  },
)

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
  fontSize: '11px',
  fontWeight: 600,
  fontFamily: 'var(--font-mono)',
  transition: 'border-color 100ms, color 100ms',
  '&:hover': {
    borderColor: 'var(--accent)',
    color: 'var(--accent)',
  },
})