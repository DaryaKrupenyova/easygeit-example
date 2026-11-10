import { forwardRef, type SelectHTMLAttributes } from 'react'

import { cn } from '@/shared/lib/cn'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ className, invalid, children, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={cn(
          'w-full rounded-lg border bg-panel px-3 py-2 text-sm text-ink transition-colors',
          invalid
            ? 'border-danger focus:border-danger'
            : 'border-line hover:border-line-strong focus:border-accent',
          className,
        )}
        aria-invalid={invalid || undefined}
        {...props}
      >
        {children}
      </select>
    )
  },
)
