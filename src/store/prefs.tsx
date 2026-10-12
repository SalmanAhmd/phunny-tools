import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { sound } from '@/lib/sound'

type Theme = 'light' | 'dark'

interface PrefsValue {
  theme: Theme
  toggleTheme: () => void
  soundOn: boolean
  toggleSound: () => void
  reducedMotion: boolean
}

const PrefsContext = createContext<PrefsValue | null>(null)

const THEME_KEY = 'useless-tools:theme'
const SOUND_KEY = 'useless-tools:sound'

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light'
    const stored = window.localStorage.getItem(THEME_KEY)
    if (stored === 'dark' || stored === 'light') return stored
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  const [soundOn, setSoundOn] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(SOUND_KEY) === 'on'
  })
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    window.localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  useEffect(() => {
    sound.setEnabled(soundOn)
    window.localStorage.setItem(SOUND_KEY, soundOn ? 'on' : 'off')
  }, [soundOn])

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const handler = () => setReducedMotion(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const toggleTheme = useCallback(() => setTheme((t) => (t === 'light' ? 'dark' : 'light')), [])
  const toggleSound = useCallback(() => {
    setSoundOn((s) => {
      const next = !s
      if (next) {
        sound.setEnabled(true)
        sound.pop()
      }
      return next
    })
  }, [])

  const value = useMemo(
    () => ({ theme, toggleTheme, soundOn, toggleSound, reducedMotion }),
    [theme, toggleTheme, soundOn, toggleSound, reducedMotion],
  )

  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>
}

export function usePrefs(): PrefsValue {
  const ctx = useContext(PrefsContext)
  if (!ctx) throw new Error('usePrefs must be used inside <PrefsProvider>')
  return ctx
}
