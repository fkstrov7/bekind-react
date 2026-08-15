import { Link } from 'react-router-dom'
import { HoodieIcon, TeeIcon, CapIcon, CrewneckIcon } from './DropIcons.jsx'
import { useLanguage } from '../i18n/LanguageContext.jsx'

/**
 * The shared visual core of the Drops teaser — dimmed, blurred garment
 * silhouettes loosely scattered behind a short mood statement, rather
 * than named products with descriptions. BeKind doesn't have merch yet;
 * this reads as an intentional mystery instead of an empty product page.
 *
 * Used by both DropsPreview (the Home section) and DropsPage (/drops) —
 * `large` just gives the dedicated page a bit more room to breathe.
 */
export default function DropsTeaser({ large = false }) {
  const { t } = useLanguage()

  return (
    <div className={`drops-teaser${large ? ' drops-teaser-large' : ''}`}>
      <div className="drops-teaser-icons" aria-hidden="true">
        <HoodieIcon className="drops-teaser-icon icon-a" />
        <TeeIcon className="drops-teaser-icon icon-b" />
        <CapIcon className="drops-teaser-icon icon-c" />
        <CrewneckIcon className="drops-teaser-icon icon-d" />
      </div>
      <p className="drops-teaser-headline">{t('drops.headline')}</p>
      <p className="drops-teaser-body">{t('drops.body')}</p>
      <Link className="btn btn-line" to="/#connect">
        {t('drops.cta')}
      </Link>
    </div>
  )
}
