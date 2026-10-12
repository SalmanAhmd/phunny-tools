import { useEffect, useRef, useState } from "react";

interface FakeProgressOptions {
  messages: string[];
  /** Approximate total run time in ms, ignoring random stalls. */
  duration?: number;
  onComplete?: () => void;
  stallChance?: number;
}

export interface FakeProgress {
  percent: number;
  message: string;
  running: boolean;
  /** Index of the current message, useful for dramatic highlighting. */
  step: number;
  start: () => void;
  reset: () => void;
  finishNow: () => void;
  setPercent: (value: number) => void;
}

/**
 * Drives a deliberately wonky progress bar: uneven steps, occasional stalls,
 * and aphorisms of questionable value. Purely presentational.
 */
export function useFakeProgress({
  messages,
  duration = 4200,
  onComplete,
  stallChance = 0.1,
}: FakeProgressOptions): FakeProgress {
  const [percent, setPercent] = useState(0);
  const [running, setRunning] = useState(false);
  const timer = useRef<number | null>(null);
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;

  const clear = () => {
    if (timer.current !== null) {
      window.clearInterval(timer.current);
      timer.current = null;
    }
  };

  useEffect(() => clear, []);

  const start = () => {
    clear();
    setPercent(0);
    setRunning(true);
    const tick = 90;
    const baseStep = (100 * tick) / Math.max(600, duration);
    timer.current = window.setInterval(() => {
      setPercent((p) => {
        if (p >= 100) return 100;
        const stalled = Math.random() < stallChance;
        const step = stalled ? 0 : baseStep * (0.45 + Math.random() * 1.4);
        const next = Math.min(100, p + step);
        if (next >= 100) {
          clear();
          setRunning(false);
          window.setTimeout(() => completeRef.current?.(), 420);
          return 100;
        }
        return next;
      });
    }, tick);
  };

  const reset = () => {
    clear();
    setPercent(0);
    setRunning(false);
  };

  const finishNow = () => {
    clear();
    setPercent(100);
    setRunning(false);
    window.setTimeout(() => completeRef.current?.(), 300);
  };

  const step = Math.min(messages.length - 1, Math.floor((percent / 100) * messages.length));

  return {
    percent,
    message: messages[step] ?? messages[messages.length - 1] ?? "",
    running,
    step,
    start,
    reset,
    finishNow,
    setPercent,
  };
}
