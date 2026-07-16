export function SaarstahlLogo() {
  return (
    <div className="flex items-center gap-3">
      <svg
        width="42"
        height="42"
        viewBox="0 0 48 48"
        fill="none"
        role="img"
        aria-label="Saarstahl logo"
        className="shrink-0"
      >
        {/* Two intersecting curved crescent arcs (sickles) */}
        <path
          d="M30 6 A18 18 0 1 0 30 42"
          stroke="#10B981"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M18 6 A18 18 0 1 1 18 42"
          stroke="#34D399"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      <div className="flex flex-col leading-none">
        <span className="font-space-grotesk text-lg font-medium lowercase tracking-tight text-foreground">
          saarstahl
        </span>
        <span className="font-space-grotesk text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
          We are Pure Steel+
        </span>
      </div>
    </div>
  )
}
