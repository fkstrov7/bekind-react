import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import useMotionPrefs from '../hooks/useMotionPrefs.js'
import useActiveSection from '../hooks/useActiveSection.js'
import { scrollToTarget } from '../hooks/useSmoothScroll.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import LanguageToggle from './LanguageToggle.jsx'
import ThemeToggle from './ThemeToggle.jsx'

const SECTION_IDS = ['manifesto', 'sonidos', 'movement', 'connect']
const HEADER_OFFSET = -110

export default function Header() {
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { canRender3D } = useMotionPrefs()
  const { t } = useLanguage()

  const onHome = location.pathname === '/'

  // Only spy on sections when they're actually on the page.
  const activeSection = useActiveSection(onHome ? SECTION_IDS : [])

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the mobile drawer whenever the route changes.
  useEffect(() => setOpen(false), [location.pathname])

  /**
   * Hash links are plain anchors, not NavLinks — NavLink's isActive matches
   * pathname only, so on "/" all three lit up at once. Active state now
   * comes from the scroll-spy, and the scroll itself is handled here
   * (via Lenis) because the router won't do it.
   */
  function handleSectionClick(e, id) {
    setOpen(false)
    if (!onHome) return // let the router navigate to /#id, ScrollManager finishes the job

    e.preventDefault()
    const el = document.getElementById(id)
    if (!el) return
    scrollToTarget(el, { offset: HEADER_OFFSET })
    // Keep the URL honest without triggering a router scroll.
    navigate(`/#${id}`, { replace: true })
  }

  return (
    <header className={solid ? 'solid' : ''}>
      {/* For 3D-capable visitors this is an empty (but still clickable)
          hit-target — the docked 3D logo (see LogoCanvas/useLogoChoreography)
          visually lands here once scrolled past the hero. Everyone else
          keeps the static image, with no spin. */}
      <NavLink to="/" className="logo-mark" aria-label={t('nav.logoAriaLabel')}>
        {!canRender3D && <img src="/Logosvg.svg" alt={t('nav.logoAlt')} />}
      </NavLink>

      {/* Ordered after logo-mark but before the toggle button on purpose:
          on mobile, <nav>'s <ul> goes position:fixed (the off-canvas
          drawer), collapsing <nav> itself to zero width — but it's still a
          real flex item in this space-between row. With the toggle button
          BEFORE it in DOM order, that invisible zero-width box sat between
          the button and the header's right edge, so space-between reserved
          a gap for it and the button never actually touched the edge. The
          toggle needs to be the LAST flex child to land flush right. */}
      <nav>
        <ul className={open ? 'open' : ''}>
          <li>
            <a
              href="/#manifesto"
              className={onHome && activeSection === 'manifesto' ? 'active' : undefined}
              onClick={(e) => handleSectionClick(e, 'manifesto')}
            >
              {t('nav.manifiesto')}
            </a>
          </li>
          <li>
            <a
              href="/#sonidos"
              className={onHome && activeSection === 'sonidos' ? 'active' : undefined}
              onClick={(e) => handleSectionClick(e, 'sonidos')}
            >
              {t('nav.sonidos')}
            </a>
          </li>
          <li>
            <NavLink
              to="/drops"
              className={({ isActive }) => (isActive ? 'active' : undefined)}
              onClick={() => setOpen(false)}
            >
              {t('nav.drops')}
            </NavLink>
          </li>
          <li>
            <a
              href="/#connect"
              className={onHome && activeSection === 'connect' ? 'active' : undefined}
              onClick={(e) => handleSectionClick(e, 'connect')}
            >
              {t('nav.conecta')}
            </a>
          </li>
          {/* Lives inside the same <ul> as the nav links on purpose — it
              rides along with the existing desktop/mobile-drawer layout
              (and open/close state) for free, rather than needing its own
              duplicate positioning logic at each breakpoint. */}
          <li className="nav-controls">
            <LanguageToggle />
            <ThemeToggle />
          </li>
        </ul>
      </nav>

      <button
        className="nav-toggle"
        aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </header>
  )
}
