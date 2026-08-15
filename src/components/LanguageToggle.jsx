import { useLanguage } from '../i18n/LanguageContext.jsx'

export default function LanguageToggle({ className = '' }) {
  const { lang, setLang } = useLanguage()

  return (
    <div className={`lang-toggle ${className}`.trim()} role="group" aria-label="Idioma / Language">
      <button
        type="button"
        className={lang === 'es' ? 'active' : undefined}
        onClick={() => setLang('es')}
        aria-pressed={lang === 'es'}
      >
        ES
      </button>
      <span aria-hidden="true">/</span>
      <button
        type="button"
        className={lang === 'en' ? 'active' : undefined}
        onClick={() => setLang('en')}
        aria-pressed={lang === 'en'}
      >
        EN
      </button>
    </div>
  )
}
