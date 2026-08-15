import Reveal from './Reveal.jsx'
import DropsTeaser from './DropsTeaser.jsx'
import { useLanguage } from '../i18n/LanguageContext.jsx'

export default function DropsPage() {
  const { t } = useLanguage()

  return (
    <section className="section drops drops-page" id="drops">
      <div className="wrap">
        <Reveal>
          <div className="eyebrow">{t('drops.pageEyebrow')}</div>
          <div className="section-head">
            <span className="section-num">—</span>
            <h2 className="section-title">{t('drops.pageTitle')}</h2>
            <span className="section-rule"></span>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <DropsTeaser large />
        </Reveal>
      </div>
    </section>
  )
}
