import { forwardRef, type TextareaHTMLAttributes } from 'react'

import { cn } from '@/shared/lib/cn'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, invalid, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          'w-full rounded-lg border bg-panel px-3 py-2 text-sm text-ink placeholder:text-slate-400 transition-colors resize-y min-h-24',
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
