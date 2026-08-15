import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Reveal from './Reveal.jsx'
import useMotionPrefs from '../hooks/useMotionPrefs.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'

// Low damping on purpose — the slight overshoot is the whole effect.
const STAMP_SPRING = { type: 'spring', stiffness: 400, damping: 15 }

export default function ConnectSection() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | pending | done | error
  const { motionOk } = useMotionPrefs()
  const { t } = useLanguage()

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('pending')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error('subscribe failed')
      setStatus('done')
      setEmail('')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="section connect" id="connect">
      <div className="wrap">
        <div className="connect-inner">
          <Reveal>
            <h2 className="connect-title">
              {t('connect.titleBefore')}<span>{t('connect.titleHighlight')}</span>
            </h2>
            <p className="connect-copy">{t('connect.copy')}</p>
            <form className="signup" onSubmit={handleSubmit}>
              <label htmlFor="email" style={{ position: 'absolute', left: '-9999px' }}>
                {t('connect.emailLabel')}
              </label>
              <input
                id="email"
                type="email"
                placeholder={t('connect.emailPlaceholder')}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit" disabled={status === 'pending'}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={status}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                  >
                    {status === 'done'
                      ? t('connect.submitDone')
                      : status === 'error'
                        ? t('connect.submitError')
                        : t('connect.submitIdle')}
                  </motion.span>
                </AnimatePresence>
              </button>
            </form>
            <p className="form-note">{t('connect.formNote')}</p>
          </Reveal>
          <Reveal delay={0.1} direction="right">
            <div className="social-stamps">
              {/* whileHover overshoots slightly past the resting offset,
                  which is what gives the slide its spring. */}
              <motion.a
                className="stamp"
                href="https://www.instagram.com/bekindstreetwear/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={motionOk ? { x: 10 } : undefined}
                transition={STAMP_SPRING}
              >
                {t('connect.stampInstagram')} <span className="arrow">→</span>
              </motion.a>
              <motion.a
                className="stamp"
                href="https://www.tiktok.com/@bekindstreetwear"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={motionOk ? { x: 10 } : undefined}
                transition={STAMP_SPRING}
              >
                {t('connect.stampTikTok')} <span className="arrow">→</span>
              </motion.a>
              <motion.a
                className="stamp"
                href="https://bekindcr.com/"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={motionOk ? { x: 10 } : undefined}
                transition={STAMP_SPRING}
              >
                {t('connect.stampWebsite')} <span className="arrow">→</span>
              </motion.a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
