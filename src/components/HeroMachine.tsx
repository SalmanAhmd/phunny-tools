import { motion } from 'framer-motion'
import { usePrefs } from '@/store/prefs'

/**
 * "The Unnecessarily Complicated Machine" — a tiny office worker desperately
 * operating an absurd contraption. Pure SVG, animated with Framer Motion.
 */
export function HeroMachine({ className }: { className?: string }) {
  const { reducedMotion } = usePrefs()
  const spin = reducedMotion
    ? {}
    : { animate: { rotate: 360 }, transition: { duration: 5, repeat: Infinity, ease: 'linear' as const } }

  return (
    <div className={className}>
      <svg viewBox="0 0 420 340" role="img" aria-label="A tiny office worker struggling to operate an absurd machine" className="h-full w-full">
        {/* backdrop blob */}
        <motion.g
          animate={reducedMotion ? {} : { y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ellipse cx="212" cy="312" rx="170" ry="16" fill="#0D0C0A" opacity="0.12" />
        </motion.g>

        {/* conveyor belt */}
        <rect x="30" y="270" width="360" height="18" rx="9" fill="#0D0C0A" />
        <rect x="38" y="274" width="344" height="10" rx="5" fill="#5B554A" />
        {[60, 110, 160, 210, 260, 310, 360].map((x) => (
          <motion.circle
            key={x}
            cx={x}
            cy="279"
            r="3"
            fill="#FFD400"
            animate={reducedMotion ? {} : { opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: x / 300 }}
          />
        ))}

        {/* machine body */}
        <motion.g
          animate={reducedMotion ? {} : { rotate: [-0.6, 0.6, -0.6] }}
          transition={{ duration: 0.35, repeat: Infinity }}
          style={{ transformOrigin: '250px 220px' }}
        >
          <rect x="150" y="120" width="200" height="150" rx="18" fill="#7C3AED" stroke="#0D0C0A" strokeWidth="4" />
          <rect x="164" y="136" width="172" height="46" rx="10" fill="#0D0C0A" />
          <text x="250" y="167" textAnchor="middle" fill="#B4E600" fontFamily="monospace" fontSize="17" fontWeight="700">
            CRUNCH-O-MATIC
          </text>
          {/* gears */}
          <motion.g {...spin} style={{ transformOrigin: '200px 225px' }}>
            <circle cx="200" cy="225" r="22" fill="#FFD400" stroke="#0D0C0A" strokeWidth="4" />
            {Array.from({ length: 8 }).map((_, i) => (
              <rect
                key={i}
                x="196"
                y="198"
                width="8"
                height="10"
                rx="2"
                fill="#0D0C0A"
                transform={`rotate(${i * 45} 200 225)`}
              />
            ))}
            <circle cx="200" cy="225" r="6" fill="#0D0C0A" />
          </motion.g>
          <motion.g
            animate={reducedMotion ? {} : { rotate: -360 }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '300px 232px' }}
          >
            <circle cx="300" cy="232" r="17" fill="#FF6A00" stroke="#0D0C0A" strokeWidth="4" />
            {Array.from({ length: 6 }).map((_, i) => (
              <rect
                key={i}
                x="297"
                y="211"
                width="7"
                height="9"
                rx="2"
                fill="#0D0C0A"
                transform={`rotate(${i * 60} 300 232)`}
              />
            ))}
            <circle cx="300" cy="232" r="5" fill="#0D0C0A" />
          </motion.g>
          {/* lights */}
          {[240, 262, 284].map((x, i) => (
            <motion.circle
              key={x}
              cx={x}
              cy="262"
              r="5"
              fill={['#B4E600', '#FF4FA3', '#FFD400'][i]}
              stroke="#0D0C0A"
              strokeWidth="2"
              animate={reducedMotion ? {} : { opacity: [1, 0.25, 1] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
          {/* smoke puffs */}
          {[190, 250, 310].map((x, i) => (
            <motion.g
              key={x}
              animate={reducedMotion ? {} : { y: [-4, -34], opacity: [0.75, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.6, ease: 'easeOut' }}
            >
              <circle cx={x} cy="112" r={10 + i * 2} fill="#EFE7D6" stroke="#0D0C0A" strokeWidth="2.5" />
            </motion.g>
          ))}
        </motion.g>

        {/* worker */}
        <motion.g
          animate={reducedMotion ? {} : { y: [0, -3, 0], rotate: [-2, 2, -2] }}
          transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '92px 250px' }}
        >
          {/* arm to lever */}
          <motion.line
            x1="96"
            y1="236"
            x2="140"
            y2="196"
            stroke="#0D0C0A"
            strokeWidth="7"
            strokeLinecap="round"
            animate={reducedMotion ? {} : { x2: [140, 132, 140], y2: [196, 206, 196] }}
            transition={{ duration: 1.1, repeat: Infinity }}
          />
          {/* head */}
          <circle cx="86" cy="212" r="15" fill="#FFD3A8" stroke="#0D0C0A" strokeWidth="3.5" />
          <path d="M72 205 q14 -12 28 0" fill="#0D0C0A" />
          <circle cx="80" cy="212" r="2.4" fill="#0D0C0A" />
          <circle cx="92" cy="212" r="2.4" fill="#0D0C0A" />
          <motion.path
            d="M80 220 q6 -4 12 0"
            stroke="#0D0C0A"
            strokeWidth="2.4"
            fill="none"
            strokeLinecap="round"
            animate={reducedMotion ? {} : { d: ['M80 221 q6 3 12 0', 'M80 219 q6 -3 12 0', 'M80 221 q6 3 12 0'] }}
            transition={{ duration: 1.1, repeat: Infinity }}
          />
          {/* body */}
          <rect x="72" y="226" width="28" height="44" rx="10" fill="#FF6A00" stroke="#0D0C0A" strokeWidth="3.5" />
          <rect x="78" y="226" width="16" height="14" rx="4" fill="#FFD400" stroke="#0D0C0A" strokeWidth="2.5" />
          {/* legs */}
          <rect x="74" y="266" width="10" height="26" rx="4" fill="#0D0C0A" />
          <rect x="88" y="266" width="10" height="26" rx="4" fill="#0D0C0A" />
        </motion.g>

        {/* the file being fed in */}
        <motion.g
          animate={reducedMotion ? {} : { x: [-6, 4, -6], rotate: [-3, 3, -3] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        >
          <rect x="10" y="236" width="46" height="34" rx="5" fill="#F7F2E7" stroke="#0D0C0A" strokeWidth="3.5" />
          <text x="33" y="258" textAnchor="middle" fontSize="13" fontFamily="monospace" fill="#0D0C0A">
            .zip
          </text>
        </motion.g>

        {/* output: a sad little box */}
        <motion.g
          animate={reducedMotion ? {} : { opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <rect x="360" y="240" width="40" height="30" rx="5" fill="#B4E600" stroke="#0D0C0A" strokeWidth="3.5" />
          <text x="380" y="260" textAnchor="middle" fontSize="11" fontFamily="monospace" fill="#0D0C0A">
            hmm
          </text>
        </motion.g>

        {/* impact star */}
        <motion.g
          animate={reducedMotion ? {} : { scale: [0.4, 1.15, 0.4], opacity: [0, 1, 0] }}
          transition={{ duration: 1.1, repeat: Infinity }}
          style={{ transformOrigin: '150px 172px' }}
        >
          <path
            d="M150 152 l6 14 15 -4 -11 11 8 13 -15 -6 -7 15 -3 -16 -15 3 12 -11 -9 -12 15 5z"
            fill="#FFD400"
            stroke="#0D0C0A"
            strokeWidth="3"
          />
        </motion.g>
      </svg>
    </div>
  )
}
