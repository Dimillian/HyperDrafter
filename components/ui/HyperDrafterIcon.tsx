interface HyperDrafterIconProps {
  size?: number
  className?: string
}

export function HyperDrafterIcon({ size = 32, className = '' }: HyperDrafterIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g transform="rotate(-45 16 16)">
        <rect x="14" y="4" width="4" height="18" rx="2" fill="#a855f7"/>
        <rect x="14" y="20" width="4" height="4" fill="#7c3aed"/>
        <path d="M14 24 L16 28 L18 24 Z" fill="#4c1d95"/>
        <circle cx="16" cy="28" r="0.5" fill="#ffffff"/>
      </g>
      <g filter="url(#lightning-glow)">
        <path d="M19 7L13 15H17L14 23L21 15H17L19 7Z" fill="#fbbf24"/>
      </g>
      <defs>
        <filter id="lightning-glow">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5"/>
          <feColorMatrix values="1 0 0 0 0.8  0 1 0 0 0.7  0 0 1 0 0  0 0 0 1 0"/>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
    </svg>
  )
}