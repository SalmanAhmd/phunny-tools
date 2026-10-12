import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { ACHIEVEMENT_MAP, rankFor, type Achievement } from '@/lib/achievements'
import { notify } from '@/lib/toastBus'
import { sound } from '@/lib/sound'

const STORAGE_KEY = 'useless-tools:stats:v1'
const START_KEY = 'useless-tools:started:v1'

export interface NonsenseStats {
  buttonsClicked: number
  toolsUsed: string[]
  gamesPlayed: string[]
  filesSuffered: number
  achievements: string[]
  gamesPlayedCount: number
  secondsDoingNothing: number
  recentTools: string[]
  firstVisit: number
}

const EMPTY: NonsenseStats = {
  buttonsClicked: 0,
  toolsUsed: [],
  gamesPlayed: [],
  filesSuffered: 0,
  achievements: [],
  gamesPlayedCount: 0,
  secondsDoingNothing: 0,
  recentTools: [],
  firstVisit: 0,
}

interface NonsenseContextValue {
  stats: NonsenseStats
  nonsenseLevel: number
  rank: ReturnType<typeof rankFor>
  achievements: Achievement[]
  unlock: (id: string) => boolean
  registerClick: (amount?: number) => void
  registerTool: (id: string) => void
  registerGame: (id: string) => void
  registerFile: () => void
  reset: () => void
  has: (id: string) => boolean
}

const NonsenseContext = createContext<NonsenseContextValue | null>(null)

function loadStats(): NonsenseStats {
  if (typeof window === 'undefined') return { ...EMPTY }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...EMPTY, firstVisit: Date.now() }
    const parsed = JSON.parse(raw) as Partial<NonsenseStats>
    return { ...EMPTY, ...parsed, firstVisit: parsed.firstVisit || Date.now() }
  } catch {
    return { ...EMPTY, firstVisit: Date.now() }
  }
}

export function NonsenseProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<NonsenseStats>(loadStats)
  const startRef = useRef<number>(0)

  // Persist stats.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
    } catch {
      /* storage full of nonsense, ignore */
    }
  }, [stats])

  // "Time spent doing nothing" counter — deliberately generous with its maths.
  useEffect(() => {
    startRef.current = Date.now()
    const seen = window.sessionStorage.getItem(START_KEY)
    if (!seen) window.sessionStorage.setItem(START_KEY, String(Date.now()))
    const tick = window.setInterval(() => {
      setStats((s) => ({ ...s, secondsDoingNothing: s.secondsDoingNothing + 1 }))
    }, 1000)
    return () => window.clearInterval(tick)
  }, [])

  const unlock = useCallback((id: string) => {
    const achievement = ACHIEVEMENT_MAP[id]
    if (!achievement) return false
    let didUnlock = false
    setStats((s) => {
      if (s.achievements.includes(id)) return s
      didUnlock = true
      return { ...s, achievements: [...s.achievements, id] }
    })
    if (didUnlock) {
      sound.fanfare()
      notify.achievement('Achievement Unlocked!', `${achievement.title} — ${achievement.description}`, achievement.emoji)
    }
    return didUnlock
  }, [])

  const registerClick = useCallback(
    (amount = 1) => {
      setStats((s) => {
        const next = { ...s, buttonsClicked: s.buttonsClicked + amount }
        // Achievement thresholds evaluated inline so we avoid stale closures.
        const unlockedNow: string[] = []
        if (next.buttonsClicked >= 1 && !next.achievements.includes('first-click')) unlockedNow.push('first-click')
        if (next.buttonsClicked >= 50 && !next.achievements.includes('click-50')) unlockedNow.push('click-50')
        if (next.buttonsClicked >= 250 && !next.achievements.includes('click-250')) unlockedNow.push('click-250')
        if (next.buttonsClicked >= 1000 && !next.achievements.includes('click-1000')) unlockedNow.push('click-1000')
        if (unlockedNow.length) {
          next.achievements = [...next.achievements, ...unlockedNow]
        }
        return next
      })
    },
    [],
  )

  const registerTool = useCallback((id: string) => {
    setStats((s) => ({
      ...s,
      toolsUsed: s.toolsUsed.includes(id) ? s.toolsUsed : [...s.toolsUsed, id],
      recentTools: [id, ...s.recentTools.filter((t) => t !== id)].slice(0, 6),
    }))
  }, [])

  const registerGame = useCallback((id: string) => {
    setStats((s) => ({
      ...s,
      gamesPlayed: s.gamesPlayed.includes(id) ? s.gamesPlayed : [...s.gamesPlayed, id],
      gamesPlayedCount: s.gamesPlayedCount + 1,
      recentTools: [id, ...s.recentTools.filter((t) => t !== id)].slice(0, 6),
    }))
  }, [])

  const registerFile = useCallback(() => {
    setStats((s) => ({ ...s, filesSuffered: s.filesSuffered + 1 }))
  }, [])

  // Keep debug timers honest: unlock achievements based on elapsed screen time.
  useEffect(() => {
    if (stats.secondsDoingNothing >= 60) unlock('time')
  }, [stats.secondsDoingNothing, unlock])

  const reset = useCallback(() => {
    setStats({ ...EMPTY, firstVisit: Date.now() })
    notify.info('Progress erased', 'Your nonsense has been professionally deleted.', '🧹')
  }, [])

  // If every single tool + game has been visited, hand out the completionist badge.
  useEffect(() => {
    if (stats.toolsUsed.length >= 20) unlock('all-tools')
  }, [stats.toolsUsed.length, unlock])

  const nonsenseLevel = useMemo(() => {
    return Math.round(
      stats.buttonsClicked * 0.5 +
        stats.toolsUsed.length * 6 +
        stats.gamesPlayedCount * 8 +
        stats.achievements.length * 12 +
        stats.secondsDoingNothing / 20 +
        stats.filesSuffered * 5,
    )
  }, [stats])

  const value: NonsenseContextValue = {
    stats,
    nonsenseLevel,
    rank: rankFor(nonsenseLevel),
    achievements: stats.achievements.map((id) => ACHIEVEMENT_MAP[id]).filter(Boolean),
    unlock,
    registerClick,
    registerTool,
    registerGame,
    registerFile,
    reset,
    has: (id: string) => stats.achievements.includes(id),
  }

  return <NonsenseContext.Provider value={value}>{children}</NonsenseContext.Provider>
}

export function useNonsense(): NonsenseContextValue {
  const ctx = useContext(NonsenseContext)
  if (!ctx) throw new Error('useNonsense must be used inside <NonsenseProvider>')
  return ctx
}
