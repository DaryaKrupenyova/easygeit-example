import { forwardRef, type InputHTMLAttributes } from 'react'

import { cn } from '@/shared/lib/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ className, invalid, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full rounded-lg border bg-panel px-3 py-2 text-sm text-ink placeholder:text-slate-400 transition-colors',
          invalid
            ? 'border-danger focus:border-danger'
            : 'border-line hover:border-line-strong focus:border-accent',
          className,
        )}
        aria-invalid={invalid || undefined}
        {...props}
      />
    )
  },
)
