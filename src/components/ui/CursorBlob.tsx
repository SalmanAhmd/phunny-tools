import { useEffect, useRef } from 'react'
import { usePrefs } from '@/store/prefs'

/**
 * A soft blob that trails the pointer. Disabled on touch devices and when the
 * user prefers reduced motion. Purely decorative, pointer-events: none.
 */
export function CursorBlob() {
  const ref = useRef<HTMLDivElement>(null)
  const { reducedMotion } = usePrefs()

  useEffect(() => {
    if (reducedMotion) return
    if (window.matchMedia('(hover: none)').matches) return
    const el = ref.current
    if (!el) return
    let raf = 0
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const pos = { ...target }

    const move = (e: PointerEvent) => {
      target.x = e.clientX
      target.y = e.clientY
    }
    const loop = () => {
      pos.x += (target.x - pos.x) * 0.18
      pos.y += (target.y - pos.y) * 0.18
      el.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`
      raf = requestAnimationFrame(loop)
    }
    const grow = () => {
      el.style.width = '64px'
      el.style.height = '64px'
      el.style.background = 'rgba(255, 106, 0, 0.28)'
    }
    const shrink = () => {
      el.style.width = '34px'
      el.style.height = '34px'
      el.style.background = 'rgba(255, 212, 0, 0.35)'
    }

    window.addEventListener('pointermove', move, { passive: true })
    const interactive = 'button, a, input, select, textarea, [role="button"]'
    document.addEventListener('pointerover', (e) => {
      if ((e.target as HTMLElement)?.closest?.(interactive)) grow()
    })
    document.addEventListener('pointerout', (e) => {
      if ((e.target as HTMLElement)?.closest?.(interactive)) shrink()
    })

    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', move)
    }
  }, [reducedMotion])

  return <div id="cursor-blob" ref={ref} aria-hidden />
}
