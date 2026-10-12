import { forwardRef, type ReactNode } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useNonsense } from '@/store/nonsense'
import { sound } from '@/lib/sound'
import { usePrefs } from '@/store/prefs'

export type ButtonVariant = 'primary' | 'grape' | 'lime' | 'sun' | 'ghost' | 'danger'

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'bg-tangerine text-white dark:text-ink',
  grape: 'bg-grape text-white',
  lime: 'bg-limey text-ink',
  sun: 'bg-sunrise text-ink',
  ghost: 'bg-white dark:bg-[#171512]',
  danger: 'bg-bubblegum text-ink',
}

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant
  size?: 'sm' | 'md' | 'lg' | 'xl'
  icon?: ReactNode
  children?: ReactNode
  /** Set false for buttons that should not count toward the meaningless click tally. */
  countClick?: boolean
  /** Sound to play on click. Defaults to a small blip. */
  clickSound?: 'click' | 'pop' | 'ding' | 'none'
}

const SIZE_CLASS = {
  sm: 'px-3 py-1.5 text-[11px] rounded-xl',
  md: 'px-5 py-3 text-sm rounded-2xl',
  lg: 'px-7 py-4 text-base rounded-2xl',
  xl: 'px-8 py-5 text-lg rounded-3xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'ghost',
    size = 'md',
    icon,
    children,
    className,
    countClick = true,
    clickSound = 'click',
    onClick,
    ...rest
  },
  ref,
) {
  const { registerClick } = useNonsense()
  const { reducedMotion } = usePrefs()

  return (
    <motion.button
      ref={ref}
      type="button"
      whileHover={reducedMotion || rest.disabled ? undefined : { scale: 1.03 }}
      whileTap={reducedMotion || rest.disabled ? undefined : { scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 500, damping: 22 }}
      onMouseEnter={(e) => {
        rest.onMouseEnter?.(e)
      }}
      onClick={(e) => {
        if (countClick) registerClick()
        if (clickSound === 'click') sound.click()
        else if (clickSound === 'pop') sound.pop()
        else if (clickSound === 'ding') sound.ding()
        onClick?.(e)
      }}
      className={cn(
        'relative inline-flex select-none items-center justify-center gap-2 border-2 border-ink font-display font-bold uppercase tracking-wide shadow-pop transition-colors dark:border-cream disabled:cursor-not-allowed disabled:opacity-50',
        SIZE_CLASS[size],
        VARIANT_CLASS[variant],
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </motion.button>
  )
})
