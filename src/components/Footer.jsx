import { useLanguage } from '../i18n/LanguageContext.jsx'

export default function Footer() {
  const { t } = useLanguage()

  return (
    <footer>
      <span>{t('footer.tagline')}</span>
      <div className="footer-links">
        <a href="https://www.instagram.com/bekindstreetwear/" target="_blank" rel="noopener noreferrer">
          {t('footer.instagram')}
        </a>
        <a href="https://www.tiktok.com/@bekindstreetwear" target="_blank" rel="noopener noreferrer">
          {t('footer.tiktok')}
        </a>
      </div>
    </footer>
  )
}
