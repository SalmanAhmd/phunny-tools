/**
 * Sound effects synthesised with the Web Audio API — no asset files, no
 * network, no cost. If audio is unavailable or muted, every call is a no-op,
 * so nothing on the site can break because of sound. All clearances for these
 * recordings were handled by the legal department of Absolutely Nothing Inc.
 */

type Wave = OscillatorType;

interface ToneOptions {
  freq: number;
  to?: number;
  duration: number;
  type?: Wave;
  gain?: number;
  delay?: number;
}

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  muted = false;

  private ensure(): AudioContext | null {
    if (this.muted) return null;
    if (typeof window === "undefined") return null;
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    if (!this.ctx) {
      try {
        this.ctx = new Ctor();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.26;
        this.master.connect(this.ctx.destination);
      } catch {
        return null;
      }
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  /** Preferred API: pass true to switch sound on, false to go silent. */
  setEnabled(on: boolean) {
    this.setMuted(!on);
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(muted ? 0 : 0.26, this.ctx.currentTime, 0.01);
    }
  }

  private tone(opts: ToneOptions) {
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    const { freq, to, duration, type = "sine", gain = 0.5, delay = 0 } = opts;
    const start = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (to && to !== freq) osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), start + duration);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(gain, start + Math.min(0.02, duration / 3));
    g.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(g);
    g.connect(this.master);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  private noise(duration: number, gain = 0.4, filterFreq = 900) {
    const ctx = this.ensure();
    if (!ctx || !this.master) return;
    const frames = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = filterFreq;
    const g = ctx.createGain();
    g.gain.value = gain;
    src.connect(filter);
    filter.connect(g);
    g.connect(this.master);
    src.start();
  }

  /* ------------------------------- named sounds ------------------------------ */

  click() {
    this.tone({ freq: 520, to: 380, duration: 0.07, type: "square", gain: 0.28 });
  }

  pop() {
    this.tone({ freq: 300, to: 900, duration: 0.12, type: "sine", gain: 0.5 });
  }

  whoosh() {
    this.noise(0.35, 0.35, 1400);
  }

  thud() {
    this.tone({ freq: 150, to: 50, duration: 0.22, type: "sine", gain: 0.8 });
    this.noise(0.18, 0.5, 400);
  }

  smash() {
    this.noise(0.28, 0.9, 2600);
    this.tone({ freq: 220, to: 60, duration: 0.3, type: "triangle", gain: 0.7 });
  }

  /** The one you get for winning anything. Fictional celebratory fanfare. */
  fanfare() {
    [523, 659, 784, 1047].forEach((f, i) =>
      this.tone({ freq: f, duration: 0.2, type: "sine", gain: 0.45, delay: i * 0.1 }),
    );
    this.tone({ freq: 1319, duration: 0.5, type: "sine", gain: 0.3, delay: 0.42 });
  }

  success() {
    [523, 659, 784].forEach((f, i) =>
      this.tone({ freq: f, duration: 0.16, type: "sine", gain: 0.5, delay: i * 0.09 }),
    );
  }

  error() {
    this.tone({ freq: 200, to: 120, duration: 0.3, type: "sawtooth", gain: 0.4 });
  }

  /** For when something almost worked. As featured on every project here. */
  fail() {
    this.tone({ freq: 330, to: 120, duration: 0.35, type: "triangle", gain: 0.5 });
    this.tone({ freq: 220, to: 90, duration: 0.4, type: "sawtooth", gain: 0.3, delay: 0.12 });
  }

  ding() {
    this.tone({ freq: 880, duration: 0.4, type: "sine", gain: 0.4 });
    this.tone({ freq: 1320, duration: 0.4, type: "sine", gain: 0.2 });
  }

  boing() {
    this.tone({ freq: 160, to: 640, duration: 0.28, type: "triangle", gain: 0.5 });
    this.tone({ freq: 320, to: 1280, duration: 0.28, type: "sine", gain: 0.2, delay: 0.03 });
  }

  tick() {
    this.tone({ freq: 1200, duration: 0.03, type: "square", gain: 0.2 });
  }

  coin() {
    this.tone({ freq: 988, duration: 0.09, type: "square", gain: 0.35 });
    this.tone({ freq: 1319, duration: 0.18, type: "square", gain: 0.35, delay: 0.08 });
  }

  sad() {
    this.tone({ freq: 400, to: 180, duration: 0.5, type: "sawtooth", gain: 0.35 });
  }

  /** Old-style positional API for anyone who still prefers switch statements. */
  play(name: string) {
    if (this.muted) return;
    switch (name) {
      case "click":
        this.click();
        break;
      case "pop":
        this.pop();
        break;
      case "whoosh":
        this.whoosh();
        break;
      case "thud":
        this.thud();
        break;
      case "smash":
        this.smash();
        break;
      case "success":
        this.success();
        break;
      case "error":
        this.error();
        break;
      case "fail":
        this.fail();
        break;
      case "ding":
        this.ding();
        break;
      case "boing":
        this.boing();
        break;
      case "tick":
        this.tick();
        break;
      case "coin":
        this.coin();
        break;
      case "sad":
        this.sad();
        break;
      case "hammer":
        this.hammer();
        break;
      case "fanfare":
        this.fanfare();
        break;
    }
  }

  /** For when a file has been struck with a blunt instrument. */
  hammer() {
    this.smash();
    this.tone({ freq: 90, to: 40, duration: 0.25, type: "sine", gain: 0.9 });
  }
}

export const sound = new SoundEngine();

/** Fires a sound only if the user hasn't asked for quiet. */
export function sfx(name: string) {
  sound.play(name);
}