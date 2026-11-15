export default function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-label="Toolpath mark"
    >
      <defs>
        <linearGradient id="grad-accent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c6f24e" />
          <stop offset="100%" stopColor="#7dd3fc" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#grad-accent)" />
      <circle cx="9" cy="16" r="3" fill="#0b0c0e" filter="url(#glow)" />
      <circle cx="23" cy="9" r="3" fill="#0b0c0e" filter="url(#glow)" />
      <circle cx="23" cy="23" r="3" fill="#0b0c0e" filter="url(#glow)" />
      <path
        d="M11.5 14.5 20.5 10M11.5 17.5 20.5 22"
        stroke="#0b0c0e"
        strokeWidth="2.5"
        strokeLinecap="round"
        filter="url(#glow)"
      />
    </svg>
  );
}
