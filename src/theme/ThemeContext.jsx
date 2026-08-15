import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)
const STORAGE_KEY = 'bekind-theme'

/**
 * Always defaults to 'dark' for first-time visitors, regardless of system
 * preference — light mode is opt-in only, remembered after that.
 *
 * The initial flash on a RETURNING light-mode visitor is handled by a
 * small inline script in index.html that runs before first paint (theme
 * is CSS-driven and applies to elements React hasn't even mounted yet, so
 * a lazy useState initializer alone — which is what LanguageContext uses —
 * isn't enough here). This provider just keeps things in sync after that.
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark'
    return localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark'
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>')
  return ctx
}
