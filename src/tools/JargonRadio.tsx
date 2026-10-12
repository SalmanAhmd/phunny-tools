import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Pause, Play, Radio, Volume2 } from 'lucide-react'
import { ToolShell, ResultPanel, ReportRow } from '@/components/ui/ToolShell'
import { Button } from '@/components/ui/Button'
import { Card, Chip } from '@/components/ui/Primitives'
import { notify } from '@/lib/toastBus'
import { useNonsense } from '@/store/nonsense'
import { CORPORATE_JARGON } from '@/lib/content'
import { pick } from '@/lib/random'
import { cn } from '@/lib/utils'

const STATIONS = [
  { id: 'synergy', name: 'Synergy FM', freq: '98.4', style: 'Relentlessly positive strategy noise.' },
  { id: 'deepdive', name: 'Deep Dive 104.2', freq: '104.2', style: 'Long-form analysis of nothing in particular.' },
  { id: 'circle', name: 'Circle Back Radio', freq: '87.9', style: 'We will return to this topic shortly. Forever.' },
  { id: 'offline', name: 'Take It Offline AM', freq: '612', style: 'All discussion, no resolution, ever.' },
]

const SENTENCE_TEMPLATES = [
  'Let us leverage {j} to drive {j} across all verticals.',
  'Quick one: can we double-click on {j} before we all socialise {j}?',
  'Per my last transmission, we need to align on {j} and park {j}.',
  'Breaking news: {j} has been escalated to {j}. Nobody knows why.',
  'Today on the show: why {j} is the north star of {j}.',
  'We are going to boil the ocean and call it {j}.',
  'Reminder to all listeners: {j} is not a strategy, it is {j}.',
  'And now, a word from our sponsor: {j}.',
]

export default function JargonRadio() {
  const [station, setStation] = useState(STATIONS[0])
  const [playing, setPlaying] = useState(false)
  const [urgency, setUrgency] = useState(1)
  const [history, setHistory] = useState<string[]>([])
  const [supported, setSupported] = useState(true)
  const timerRef = useRef<number | null>(null)
  const { unlock } = useNonsense()

  useEffect(() => {
    const supportedNow = typeof window !== 'undefined' && 'speechSynthesis' in window
    setSupported(supportedNow)
    return () => {
      if (supportedNow) window.speechSynthesis.cancel()
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [])

  const speak = useCallback(
    (text: string) => {
      if (!('speechSynthesis' in window)) return
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = Math.min(2, 0.85 * urgency)
      utterance.pitch = Math.min(2, 0.7 + urgency * 0.35)
      utterance.volume = 1
      const voices = window.speechSynthesis.getVoices()
      if (voices.length) {
        // Prefer an English voice, otherwise whatever the device offers.
        utterance.voice = pick(voices.filter((v) => v.lang.startsWith('en'))) ?? voices[0]
      }
      window.speechSynthesis.speak(utterance)
    },
    [urgency],
  )

  const line = () =>
    pick(SENTENCE_TEMPLATES)
      .replace('{j}', pick(CORPORATE_JARGON))
      .replace('{j}', pick(CORPORATE_JARGON))

  useEffect(() => {
    if (!playing) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel()
      if (timerRef.current) window.clearTimeout(timerRef.current)
      return
    }
    let cancelled = false
    const broadcast = () => {
      if (cancelled) return
      const text = line()
      setHistory((h) => [text, ...h].slice(0, 8))
      speak(text)
      const gap = Math.max(1200, 6200 / urgency)
      timerRef.current = window.setTimeout(broadcast, gap)
    }
    broadcast()
    unlock('jargonradio')
    return () => {
      cancelled = true
      if (timerRef.current) window.clearTimeout(timerRef.current)
      if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    }
  }, [playing, speak, urgency, unlock])

  return (
    <ToolShell
      id="jargonradio"
      name="Corporate Jargon Radio"
      emoji="📻"
      tagline="A radio station that only broadcasts synergy."
      category="Audio Nonsense"
      accent="orange"
      honesty="This uses your browser's built-in speech synthesis to read generated corporate nonsense aloud. Nothing is recorded, stored, or transmitted. Volume is entirely under your control and audio only starts when you press play."
      aside={
        <ResultPanel title="Broadcast log">
          <ReportRow label="Station" value={station.name} />
          <ReportRow label="Frequency" value={`${station.freq} FM (fictional)`} />
          <ReportRow label="Urgency" value={`${urgency.toFixed(1)}x`} />
          <ReportRow label="Statements aired" value={String(history.length)} />
          <ReportRow label="Meaning conveyed" value="None" verdict="bad" />
          <ReportRow label="Voice" value={supported ? 'Browser built-in' : 'Unavailable'} verdict={supported ? 'good' : 'bad'} />
          <p className="mt-4 rounded-xl bg-ink/5 p-3 text-xs text-ink-muted dark:bg-cream/10 dark:text-cream/60">
            Audio starts only when you press play, and stops the instant you press stop or leave this
            page.
          </p>
        </ResultPanel>
      }
    >
      {!supported && (
        <Card className="bg-bubblegum">
          <h2 className="font-display text-base font-bold">Your browser has declined to speak</h2>
          <p className="mt-2 text-sm">
            Speech synthesis is not available here, so the radio will broadcast silently. This is, in its
            own way, the most corporate outcome possible.
          </p>
        </Card>
      )}

      <div className="rounded-3xl border-2 border-ink bg-cream-deep p-5 shadow-pop dark:border-cream dark:bg-[#100F0D]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <motion.span
              className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-ink bg-tangerine text-2xl dark:border-cream"
              animate={playing ? { rotate: [-3, 3, -3] } : {}}
              transition={{ duration: 0.5, repeat: playing ? Infinity : 0 }}
              aria-hidden
            >
              📻
            </motion.span>
            <div>
              <div className="font-display text-lg font-bold leading-none">{station.name}</div>
              <div className="font-mono text-[11px] uppercase tracking-widest text-ink-muted dark:text-cream/50">
                {station.freq} FM · always on message
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={playing ? 'danger' : 'primary'}
              onClick={() => {
                setPlaying((p) => !p)
                if (!playing) notify.info('On air', 'Now broadcasting strategic vagueness.', '📡')
              }}
              icon={playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            >
              {playing ? 'Stop broadcast' : 'Start broadcast'}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                const text = line()
                setHistory((h) => [text, ...h].slice(0, 8))
                speak(text)
              }}
              icon={<Radio className="h-4 w-4" />}
            >
              One-off statement
            </Button>
          </div>
        </div>

        {/* fake VU meter */}
        <div className="mt-5 flex items-end gap-1" aria-hidden>
          {Array.from({ length: 28 }).map((_, i) => (
            <motion.span
              key={i}
              className="flex-1 rounded-t bg-tangerine"
              animate={playing ? { height: [6, 10 + Math.random() * 34, 6] } : { height: 6 }}
              transition={{ duration: 0.5 + Math.random() * 0.4, repeat: playing ? Infinity : 0, delay: i * 0.02 }}
            />
          ))}
        </div>

        <label className="mt-5 flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-widest">
            <Volume2 className="h-3.5 w-3.5" /> Urgency
          </span>
          <input
            type="range"
            min={0.5}
            max={2}
            step={0.1}
            value={urgency}
            onChange={(e) => setUrgency(Number(e.target.value))}
            className="w-full max-w-xs"
            aria-label="Urgency of delivery"
          />
          <span className="font-mono text-xs font-bold">{urgency.toFixed(1)}x</span>
        </label>

        <div className="mt-4 flex flex-wrap gap-2">
          {STATIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStation(s)}
              aria-pressed={station.id === s.id}
              className={cn(
                'rounded-2xl border-2 border-ink px-3 py-2 text-left shadow-popsm transition hover:-translate-y-0.5 dark:border-cream',
                station.id === s.id ? 'bg-sunrise' : 'bg-white dark:bg-[#171512]',
              )}
            >
              <div className="font-display text-xs font-bold">{s.name}</div>
              <div className="text-[11px] text-ink-muted dark:text-cream/60">{s.style}</div>
            </button>
          ))}
        </div>
      </div>

      <Card>
        <h2 className="font-display text-sm font-bold uppercase tracking-wide">Recently aired</h2>
        <div className="mt-3 space-y-2">
          {history.length === 0 ? (
            <p className="text-sm text-ink-muted dark:text-cream/50">Dead air. Beautiful, peaceful dead air.</p>
          ) : (
            history.map((h, i) => (
              <motion.div
                key={`${h}-${i}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-2 border-b-2 border-dashed border-ink/15 pb-2 text-sm last:border-0 dark:border-cream/15"
              >
                <Chip color={i === 0 ? 'orange' : 'plain'} className="shrink-0">
                  {i === 0 ? 'LIVE' : `-${i}`}
                </Chip>
                <span className="text-ink-muted dark:text-cream/70">{h}</span>
              </motion.div>
            ))
          )}
        </div>
      </Card>
    </ToolShell>
  )
}
