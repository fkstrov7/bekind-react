import { Link } from 'react-router-dom'
import Reveal from './Reveal.jsx'
import DropsTeaser from './DropsTeaser.jsx'
import { useLanguage } from '../i18n/LanguageContext.jsx'

export default function DropsPreview() {
  const { t } = useLanguage()

  return (
    <section className="section drops" id="drops-preview">
      <div className="wrap">
        <Reveal>
          <div className="section-head">
            <span className="section-num">05</span>
            <h2 className="section-title">{t('drops.previewTitle')}</h2>
            <span className="section-rule"></span>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <DropsTeaser />
        </Reveal>
        <div className="movement-cta">
          <Link className="btn btn-line" to="/drops">
            {t('drops.previewCta')}
          </Link>
        </div>
      </div>
    </section>
  )
}
