import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { sound } from "./sound";
import { loadString, saveString } from "./storage";
import { uid } from "./random";
import type { ToastMessage } from "./types";

interface ConfettiBurst {
  id: string;
  x: number;
  y: number;
}

interface UIContextValue {
  theme: "light" | "dark";
  toggleTheme: () => void;
  soundOn: boolean;
  toggleSound: () => void;
  cursorOn: boolean;
  toggleCursor: () => void;
  reducedMotion: boolean;
  pushToast: (toast: Omit<ToastMessage, "id">) => void;
  fireConfetti: (at?: { x: number; y: number }, count?: number) => void;
}

const UIContext = createContext<UIContextValue | null>(null);

export function useUI(): UIContextValue {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used inside <UIProvider>");
  return ctx;
}

const CONFETTI_COLORS = ["#FF5A1F", "#7C3AED", "#FFD12E", "#B6F02E", "#FF4D8D", "#22D3EE"];
const CONFETTI_SHAPES = ["■", "●", "▲", "★", "◆"];

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = () => setReduced(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

export function UIProvider({ children }: { children: ReactNode }) {
  const reducedMotion = usePrefersReducedMotion();

  const [theme, setTheme] = useState<"light" | "dark">(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
      ? "dark"
      : "light",
  );
  const [soundOn, setSoundOn] = useState(() => loadString("sound", "on") === "on");
  const [cursorOn, setCursorOn] = useState(
    () => loadString("cursor", "on") === "on" && window.matchMedia("(pointer: fine)").matches,
  );
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [bursts, setBursts] = useState<ConfettiBurst[]>([]);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [cursorDown, setCursorDown] = useState(false);
  const toastId = useRef(0);

  useEffect(() => {
    sound.setMuted(!soundOn);
    saveString("sound", soundOn ? "on" : "off");
  }, [soundOn]);

  useEffect(() => {
    saveString("cursor", cursorOn ? "on" : "off");
    document.body.classList.toggle("custom-cursor", cursorOn);
  }, [cursorOn]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    saveString("theme", theme);
  }, [theme]);

  // Track the pointer for the custom cursor and the confetti origin.
  useEffect(() => {
    if (!cursorOn) return;
    const move = (e: PointerEvent) => setCursorPos({ x: e.clientX, y: e.clientY });
    const down = () => setCursorDown(true);
    const up = () => setCursorDown(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, [cursorOn]);

  const pushToast = useCallback((toast: Omit<ToastMessage, "id">) => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev.slice(-3), { ...toast, id }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5200);
  }, []);

  const fireConfetti = useCallback(
    (at?: { x: number; y: number }, count = 26) => {
      if (reducedMotion) return;
      const id = uid();
      const origin = at ?? { x: window.innerWidth / 2, y: window.innerHeight / 3 };
      setBursts((prev) => [...prev, { id, ...origin }]);
      window.setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== id));
      }, 1600);
      void count;
    },
    [reducedMotion],
  );

  const value = useMemo<UIContextValue>(
    () => ({
      theme,
      toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
      soundOn,
      toggleSound: () => setSoundOn((s) => !s),
      cursorOn,
      toggleCursor: () => setCursorOn((c) => !c),
      reducedMotion,
      pushToast,
      fireConfetti,
    }),
    [theme, soundOn, cursorOn, reducedMotion, pushToast, fireConfetti],
  );

  return (
    <UIContext.Provider value={value}>
      {children}
      <Toaster toasts={toasts} />
      <ConfettiLayer bursts={bursts} reducedMotion={reducedMotion} />
      {cursorOn && <CustomCursor pos={cursorPos} down={cursorDown} reducedMotion={reducedMotion} />}
    </UIContext.Provider>
  );
}

const TONE_STYLES: Record<ToastMessage["tone"], string> = {
  info: "bg-white text-ink dark:bg-ink-soft dark:text-cream",
  success: "bg-zing-lime text-ink",
  danger: "bg-zing-pink text-white",
  chaos: "bg-zing-purple text-white",
};

function Toaster({ toasts }: { toasts: ToastMessage[] }) {
  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[70] flex w-[min(92vw,22rem)] flex-col gap-3"
      aria-live="polite"
      aria-atomic="false"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 24, scale: 0.9, rotate: -2 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, x: 40, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 420, damping: 26 }}
            className={`pointer-events-auto rounded-2xl border-2 border-ink p-4 shadow-pop-sm dark:border-cream ${
              TONE_STYLES[toast.tone]
            }`}
            role="status"
          >
            <div className="flex items-start gap-3">
              {toast.icon && <span className="text-2xl leading-none">{toast.icon}</span>}
              <div>
                <p className="font-display text-sm font-bold">{toast.title}</p>
                {toast.body && <p className="mt-0.5 text-xs opacity-80">{toast.body}</p>}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function ConfettiLayer({
  bursts,
  reducedMotion,
}: {
  bursts: ConfettiBurst[];
  reducedMotion: boolean;
}) {
  if (reducedMotion) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[65] overflow-hidden">
      {bursts.map((burst) => (
        <div key={burst.id} className="absolute" style={{ left: burst.x, top: burst.y }}>
          {Array.from({ length: 26 }).map((_, i) => {
            const angle = (i / 26) * Math.PI * 2 + Math.random();
            const distance = 70 + Math.random() * 150;
            return (
              <motion.span
                key={i}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
                animate={{
                  x: Math.cos(angle) * distance,
                  y: Math.sin(angle) * distance + 120,
                  opacity: 0,
                  scale: 0.4,
                  rotate: Math.random() * 540 - 270,
                }}
                transition={{ duration: 1.2 + Math.random() * 0.4, ease: "easeOut" }}
                className="absolute text-lg font-bold"
                style={{ color: CONFETTI_COLORS[i % CONFETTI_COLORS.length] }}
              >
                {CONFETTI_SHAPES[i % CONFETTI_SHAPES.length]}
              </motion.span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function CustomCursor({
  pos,
  down,
  reducedMotion,
}: {
  pos: { x: number; y: number };
  down: boolean;
  reducedMotion: boolean;
}) {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed z-[80] hidden md:block"
      animate={{ x: pos.x - 14, y: pos.y - 14, scale: down ? 0.75 : 1 }}
      transition={
        reducedMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 900, damping: 42, mass: 0.4 }
      }
      style={{ left: 0, top: 0 }}
    >
      <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink bg-zing-yellow text-[11px] shadow-pop-sm dark:border-cream">
        🔨
      </div>
    </motion.div>
  );
}
