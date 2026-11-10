import type { ButtonHTMLAttributes } from 'react'

import { cn } from '@/shared/lib/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: 'sm' | 'md'
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-white hover:bg-accent-hover shadow-sm disabled:bg-slate-300 disabled:text-slate-500',
  secondary:
    'bg-panel text-ink border border-line hover:border-line-strong hover:bg-slate-50 disabled:opacity-50',
  ghost: 'bg-transparent text-muted hover:bg-slate-100 hover:text-ink disabled:opacity-50',
  danger: 'bg-danger-soft text-danger hover:bg-rose-100 disabled:opacity-50',
}

export function Button({
  className,
  variant = 'secondary',
  size = 'md',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed',
        size === 'sm' ? 'px-2.5 py-1.5 text-sm' : 'px-3.5 py-2 text-sm',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}
