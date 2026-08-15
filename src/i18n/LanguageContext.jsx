import { createContext, useContext, useEffect, useState } from 'react'
import { translations } from './translations.js'

const LanguageContext = createContext(null)
const STORAGE_KEY = 'bekind-lang'

/**
 * Language state + the t() lookup. Initial state reads localStorage via a
 * lazy useState initializer, so the FIRST render already has the right
 * language — no flash-then-correct needed the way the theme toggle (CSS,
 * applies before React even mounts) does.
 */
export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    if (typeof window === 'undefined') return 'es'
    return localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'es'
  })

  // index.html's meta tags live outside the React tree, so they're synced
  // imperatively here rather than left at their static Spanish default.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang)
    document.documentElement.lang = lang

    const meta = translations[lang].meta
    document.title = meta.title

    const setMeta = (selector, attr, value) => {
      const el = document.querySelector(selector)
      if (el) el.setAttribute(attr, value)
    }
    setMeta('meta[property="og:locale"]', 'content', meta.ogLocale)
    setMeta('meta[name="description"]', 'content', meta.description)
    setMeta('meta[property="og:description"]', 'content', meta.description)
    setMeta('meta[name="twitter:description"]', 'content', meta.description)
  }, [lang])

  function t(key) {
    const node = key.split('.').reduce((acc, part) => acc?.[part], translations[lang])
    if (node === undefined) {
      console.warn(`[i18n] missing key "${key}" for lang "${lang}"`)
      return key
    }
    return node
  }

  return <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within <LanguageProvider>')
  return ctx
}
