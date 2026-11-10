interface RenderCountBadgeProps {
  count: number
}

export function RenderCountBadge({ count }: RenderCountBadgeProps) {
  if (!import.meta.env.DEV) return null

  return (
    <span
      className="ml-2 inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-muted"
      title="Render count (development only)"
    >
      renders: {count}
    </span>
  )
}
