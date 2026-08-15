import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import Reveal from './Reveal.jsx'
import DropsPreview from './DropsPreview.jsx'
import ConnectSection from './ConnectSection.jsx'
import SplitText from './SplitText.jsx'
import Marquee from './Marquee.jsx'
import MagneticButton from './MagneticButton.jsx'
import LogoFallback from './LogoFallback.jsx'
import useMotionPrefs from '../hooks/useMotionPrefs.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'

// Staggered entrance for the hero — each child animates in slightly after
// the last, driven off this shared parent variant.
const heroContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}
const heroItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export default function Home() {
  const { motionOk, canRender3D } = useMotionPrefs()
  const { t } = useLanguage()
  const heroRef = useRef(null)

  // Hero parallax — tagline and sub-copy leave upward as the 3D logo
  // (the sole hero visual now) docks into the header.
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const copyY = useTransform(scrollYProgress, [0, 1], ['0%', '-18%'])
  const heroFade = useTransform(scrollYProgress, [0, 0.75], [1, 0])
  // The scroll cue used to keep dripping forever, including well past the
  // hero. Retire it as soon as you've started scrolling.
  const cueFade = useTransform(scrollYProgress, [0, 0.18], [1, 0])

  return (
    <>
      <section className="hero" ref={heroRef}>
        {/* Only shown when the 3D logo isn't running — phones, reduced
            motion, or a WebGL/model failure. It's the hero's sole visual
            now (no flat wordmark next to it — that was redundant with
            the 3D object saying the same thing). */}
        {!canRender3D && <LogoFallback />}

        {/* initial={false} renders straight at the "show" values with no
            animation. Without this, reduced-motion visitors would sit
            looking at a hero permanently stuck at opacity 0. */}
        <motion.div
          className="wrap"
          variants={heroContainer}
          initial={motionOk ? 'hidden' : false}
          animate="show"
          style={motionOk ? { opacity: heroFade } : undefined}
        >
          <motion.div variants={heroItem} className="eyebrow">
            {t('hero.eyebrow')}
          </motion.div>

          <motion.div style={motionOk ? { y: copyY } : undefined}>
            <motion.p variants={heroItem} className="tagline">
              {t('hero.taglineBefore')}<em>{t('hero.taglineHighlight')}</em>
            </motion.p>

            <motion.p variants={heroItem} className="hero-sub">
              {t('hero.sub')}
            </motion.p>

            <motion.div variants={heroItem} className="cta-row">
              <MagneticButton as={Link} className="btn btn-fill" to="/drops">
                {t('hero.ctaDrops')}
              </MagneticButton>
              <MagneticButton
                as="a"
                className="btn btn-line"
                href="https://www.instagram.com/bekindstreetwear/"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('hero.ctaFollow')}
              </MagneticButton>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div className="scroll-cue" style={motionOk ? { opacity: cueFade } : undefined}>
          <span></span>{t('hero.scroll')}
        </motion.div>
      </section>

      <section className="section manifesto" id="manifesto">
        <div className="wrap">
          <Reveal>
            <div className="section-head">
              <span className="section-num">01</span>
              <h2 className="section-title">
                <SplitText text={t('manifesto.sectionTitle')} by="char" />
              </h2>
              <span className="section-rule"></span>
            </div>
          </Reveal>
          <div className="manifesto-grid">
            <Reveal direction="left">
              <p className="manifesto-quote">
                {t('manifesto.quoteBefore')}
                <span className="hi">{t('manifesto.quoteHighlight')}</span>.
              </p>
              <ul className="manifesto-list">
                <li>{t('manifesto.list1')}</li>
                <li>{t('manifesto.list2')}</li>
                <li>{t('manifesto.list3')}</li>
              </ul>
            </Reveal>
            <Reveal delay={0.15} direction="right" blur>
              <div className="manifesto-card">
                <p>{t('manifesto.card1')}</p>
                <p>{t('manifesto.card2')}</p>
                <p>{t('manifesto.card3')}</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section sonidos" id="sonidos">
        <div className="wrap">
          <Reveal>
            <div className="section-head">
              <span className="section-num">02</span>
              <h2 className="section-title">
                <SplitText text={t('sonidos.sectionTitle')} by="char" />
              </h2>
              <span className="section-rule"></span>
            </div>
            <p className="sonidos-lede">{t('sonidos.lede')}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="sonidos-grid">
              <div className="sonido-card">
                <iframe
                  title={t('sonidos.track1Title')}
                  src="https://open.spotify.com/embed/track/6NDuYg5KklJi8XKkJxb7d8"
                  width="100%"
                  height="152"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                ></iframe>
              </div>
              <div className="sonido-card">
                <iframe
                  title={t('sonidos.track2Title')}
                  src="https://open.spotify.com/embed/track/3PS4nLdc573tCIvfjcgBWD"
                  width="100%"
                  height="152"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Marquee text="BE KIND · SÉ AMABLE · KINDNESS IS COOL" />

      <section className="section movement" id="movement">
        <div className="wrap">
          <Reveal>
            <div className="section-head">
              <span className="section-num">03</span>
              <h2 className="section-title">
                <SplitText text={t('movement.sectionTitle')} by="char" />
              </h2>
              <span className="section-rule"></span>
            </div>
          </Reveal>
          <div className="movement-grid">
            {/* Deliberately NOT run through t() — this mixed-language set
                reads as authentic multi-language social posts, not copy
                meant to be localized, so it stays exactly as-is regardless
                of the language toggle. Same reasoning for the Marquee's
                text prop above. */}
            {[
              'Cada paso deja una huella. 👣',
              'Left something behind… hope someone needs it.',
              '2025 → 2026',
              'Creative process and doodling for the BeKind mood board. #kindnessiscool',
            ].map((caption, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="movement-card">
                  <span className="ig-tag">@bekindstreetwear</span>
                  {caption}
                </div>
              </Reveal>
            ))}
          </div>
          <div className="movement-cta">
            <MagneticButton
              as="a"
              className="btn btn-line"
              href="https://www.instagram.com/bekindstreetwear/"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('movement.ctaInstagram')}
            </MagneticButton>
          </div>
        </div>
      </section>

      <section className="section design-studio" id="design-studio">
        <div className="wrap">
          <Reveal>
            <div className="section-head">
              <span className="section-num">04</span>
              <h2 className="section-title">
                <SplitText text={t('designStudio.sectionTitle')} by="char" />
              </h2>
              <span className="section-rule"></span>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            {/* Deliberately minimal — no fake content or icons implying
                media that doesn't exist yet. Easy to promote to a full
                page once there's something real to put here. */}
            <div className="design-studio-placeholder">
              <span className="design-studio-status">{t('designStudio.status')}</span>
              <p>{t('designStudio.body')}</p>
            </div>
          </Reveal>
        </div>
      </section>

      <DropsPreview />
      <ConnectSection />
    </>
  )
}
