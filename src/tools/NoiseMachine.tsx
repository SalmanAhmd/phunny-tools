import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Square, Volume2 } from 'lucide-react'
import { ToolShell, ResultPanel, ReportRow } from '@/components/ui/ToolShell'
import { Button } from '@/components/ui/Button'
import { Card, Chip } from '@/components/ui/Primitives'
import { notify } from '@/lib/toastBus'
import { useNonsense } from '@/store/nonsense'
import { cn } from '@/lib/utils'

interface Colour {
  id: string
  label: string
  swatch: string
  filter: { type: BiquadFilterType; freq: number; q?: number }
  note: string
}

const COLOURS: Colour[] = [
  { id: 'white', label: 'White noise', swatch: 'bg-white', filter: { type: 'highpass', freq: 20 }, note: 'The classic. Still sounds like a broken television.' },
  { id: 'pink', label: 'Pink noise', swatch: 'bg-[#FFD6EC]', filter: { type: 'lowpass', freq: 1800, q: 0.6 }, note: 'Warmer. Slightly ashamed of itself.' },
  { id: 'brown', label: 'Brown noise', swatch: 'bg-[#C9A227]', filter: { type: 'lowpass', freq: 520, q: 0.9 }, note: 'Deep. Rumbly. Sounds like an approaching lorry.' },
  { id: 'blue', label: 'Blue noise', swatch: 'bg-[#7CC7FF]', filter: { type: 'highpass', freq: 2400 }, note: 'Piercing. Best enjoyed briefly and from a distance.' },
  { id: 'beige', label: 'Beige noise (silent office ambience)', swatch: 'bg-[#E7DCC4]', filter: { type: 'lowpass', freq: 900, q: 0.4 }, note: 'We could not afford real office ambience. This is brown noise with a nicer name.' },
]

export default function NoiseMachine() {
  const [playing, setPlaying] = useState(false)
  const [colour, setColour] = useState<Colour>(COLOURS[0])
  const [volume, setVolume] = useState(0.15)
  const ctxRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)
  const filterRef = useRef<BiquadFilterNode | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  const { unlock } = useNonsense()

  const stop = useCallback(() => {
    try {
      sourceRef.current?.stop()
    } catch {
      /* already stopped */
    }
    sourceRef.current = null
    setPlaying(false)
  }, [])

  const start = useCallback(
    (target: Colour) => {
      try {
        sourceRef.current?.stop()
      } catch {
        /* ignore */
      }

      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctor) {
        notify.error('No audio support', 'Your browser has no Web Audio API. Silent, forever.', '🔇')
        return
      }
      if (!ctxRef.current) ctxRef.current = new Ctor()
      const ctx = ctxRef.current
      if (ctx.state === 'suspended') void ctx.resume()

      // 2 seconds of looping noise is plenty.
      const length = ctx.sampleRate * 2
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      let last = 0
      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1
        if (target.id === 'brown' || target.id === 'beige') {
          // simple brown-ish integration
          last = (last + 0.02 * white) / 1.02
          data[i] = last * 3.5
        } else {
          data[i] = white
        }
      }

      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.loop = true

      const filter = ctx.createBiquadFilter()
      filter.type = target.filter.type
      filter.frequency.value = target.filter.freq
      if (target.filter.q) filter.Q.value = target.filter.q

      const gain = ctx.createGain()
      gain.gain.value = volume

      source.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)
      source.start()

      sourceRef.current = source
      filterRef.current = filter
      gainRef.current = gain
      setPlaying(true)
      unlock('noisemachine')
    },
    [volume, unlock],
  )

  // react to colour/volume changes while playing
  useEffect(() => {
    if (!playing) return
    const filter = filterRef.current
    if (filter) {
      filter.type = colour.filter.type
      filter.frequency.value = colour.filter.freq
      if (colour.filter.q) filter.Q.value = colour.filter.q
    }
    if (gainRef.current) gainRef.current.gain.value = volume
  }, [colour, volume, playing])

  useEffect(
    () => () => {
      try {
        sourceRef.current?.stop()
      } catch {
        /* ignore */
      }
      void ctxRef.current?.close()
    },
    [],
  )

  return (
    <ToolShell
      id="noisemachine"
      name="Mislabelled Noise Machine"
      emoji="🔊"
      tagline="White noise in entirely the wrong colours."
      category="Audio Nonsense"
      accent="grape"
      honesty="The audio is genuinely synthesised in your browser with the Web Audio API — real noise, real filters. The colours are rough approximations and one of them is simply brown noise wearing a nicer name. Nothing plays until you press start."
      aside={
        <ResultPanel title="Signal analysis">
          <ReportRow label="Currently playing" value={playing ? colour.label : 'Silence'} verdict={playing ? 'good' : 'neutral'} />
          <ReportRow label="Filter" value={`${colour.filter.type} @ ${colour.filter.freq} Hz`} />
          <ReportRow label="Volume" value={`${Math.round(volume * 100)}%`} />
          <ReportRow label="Scientifically accurate" value="Roughly" verdict="neutral" />
          <ReportRow label="Relaxing (self-reported)" value="Unproven" verdict="bad" />
          <p className="mt-4 rounded-xl bg-cream-deep p-3 text-xs dark:bg-[#100F0D]">
            {colour.note}
          </p>
        </ResultPanel>
      }
    >
      <div className="rounded-3xl border-2 border-ink bg-cream-deep p-6 shadow-pop dark:border-cream dark:bg-[#100F0D]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <motion.span
              className={cn('grid h-14 w-14 place-items-center rounded-2xl border-2 border-ink text-2xl dark:border-cream', colour.swatch)}
              animate={playing ? { scale: [1, 1.06, 1] } : { scale: 1 }}
              transition={{ duration: 1.1, repeat: playing ? Infinity : 0 }}
              aria-hidden
            >
              🌫️
            </motion.span>
            <div>
              <div className="font-display text-lg font-bold leading-none">{colour.label}</div>
              <div className="font-mono text-[11px] uppercase tracking-widest text-ink-muted dark:text-cream/50">
                {playing ? 'Broadcasting noise' : 'Idle and silent'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={playing ? 'danger' : 'primary'}
              onClick={() => {
                if (playing) stop()
                else start(colour)
              }}
              icon={playing ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            >
              {playing ? 'Stop noise' : 'Play noise'}
            </Button>
          </div>
        </div>

        <label className="mt-6 flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-widest">
            <Volume2 className="h-3.5 w-3.5" /> Volume
          </span>
          <input
            type="range"
            min={0}
            max={0.5}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full max-w-xs"
            aria-label="Noise volume"
          />
          <span className="font-mono text-xs font-bold">{Math.round(volume * 200)}%</span>
        </label>

        <div className="mt-6 flex flex-wrap gap-2">
          {COLOURS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setColour(c)}
              aria-pressed={colour.id === c.id}
              className={cn(
                'flex items-center gap-2 rounded-2xl border-2 border-ink px-3 py-2 shadow-popsm transition hover:-translate-y-0.5 dark:border-cream',
                colour.id === c.id ? 'bg-sunrise' : 'bg-white dark:bg-[#171512]',
              )}
            >
              <span className={cn('h-4 w-4 rounded-full border-2 border-ink dark:border-cream', c.swatch)} aria-hidden />
              <span className="font-display text-xs font-bold">{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      <Card className="bg-grape text-white" tilt={-0.4}>
        <h2 className="font-display text-base font-bold">Why does this exist?</h2>
        <p className="mt-2 text-sm text-white/80">
          Noise-colour products are marketed as focus aids with impressive-sounding frequency graphs.
          This one is also a focus aid, in that it is so underwhelming you will probably go back to work
          out of sheer embarrassment.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Chip color="plain">Real Web Audio synthesis</Chip>
          <Chip color="sun">Zero servers</Chip>
          <Chip color="pink">Zero science</Chip>
        </div>
      </Card>
    </ToolShell>
  )
}
