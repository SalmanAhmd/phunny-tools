import { sound } from "./sound";

export interface PlayOptions {
  freq: number;
  duration?: number;
  type?: OscillatorType;
  gain?: number;
  /** Optional detuned second voice, for that premium hold-music shimmer. */
  detune?: number;
}

export type StepHandler = (step: number, time: number, play: (opts: PlayOptions) => void) => void;

/**
 * A tiny lookahead step sequencer built on the Web Audio API. Used by the
 * audio-based "tools". It shares the global mute state so the navbar toggle
 * silences everything, and it never autoplays — the user always presses play.
 */
export class Loop {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private timer: number | null = null;
  private nextTime = 0;
  private step = 0;
  private running = false;

  constructor(
    private handler: StepHandler,
    private steps = 8,
    private bpm = 96,
    private volume = 0.35,
  ) {}

  get isRunning() {
    return this.running;
  }

  private ensure(): AudioContext | null {
    if (typeof window === "undefined") return null;
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    if (!this.ctx) {
      try {
        this.ctx = new Ctor();
        this.master = this.ctx.createGain();
        this.master.gain.value = this.volume;
        this.master.connect(this.ctx.destination);
      } catch {
        return null;
      }
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  setBpm(bpm: number) {
    this.bpm = Math.max(40, Math.min(240, bpm));
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.02);
    }
  }

  start() {
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    if (this.running) return;
    this.running = true;
    this.step = 0;
    this.nextTime = ctx.currentTime + 0.08;

    const scheduler = () => {
      const audio = this.ensure();
      if (!audio || !this.master) return;
      const secondsPerStep = 60 / this.bpm / 2; // eighth notes
      while (this.nextTime < audio.currentTime + 0.15) {
        const time = this.nextTime;
        const step = this.step;
        const play = ({ freq, duration = 0.22, type = "sine", gain = 0.4, detune }: PlayOptions) => {
          if (sound.muted) return;
          this.schedule(freq, time, duration, type, gain, detune);
        };
        try {
          this.handler(step, time, play);
        } catch {
          /* a bad step should never kill the loop */
        }
        this.step = (this.step + 1) % this.steps;
        this.nextTime += secondsPerStep;
      }
      this.timer = window.setTimeout(scheduler, 25);
    };
    scheduler();
  }

  stop() {
    this.running = false;
    if (this.timer !== null) {
      window.clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private schedule(
    freq: number,
    time: number,
    duration: number,
    type: OscillatorType,
    gain: number,
    detune?: number,
  ) {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);
    if (detune) osc.detune.setValueAtTime(detune, time);
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), time + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    osc.connect(g);
    g.connect(this.master);
    osc.start(time);
    osc.stop(time + duration + 0.05);
  }
}

/** Equal-temperament helper: note name → frequency. */
const NOTE_INDEX: Record<string, number> = {
  C: 0, "C#": 1, D: 2, "D#": 3, E: 4, F: 5, "F#": 6, G: 7, "G#": 8, A: 9, "A#": 10, B: 11,
};

export function noteFreq(note: string): number {
  const match = /^([A-G]#?)(-?\d)$/.exec(note);
  if (!match) return 440;
  const semitone = NOTE_INDEX[match[1]] ?? 0;
  const octave = Number(match[2]);
  const midi = (octave + 1) * 12 + semitone;
  return 440 * Math.pow(2, (midi - 69) / 12);
}
