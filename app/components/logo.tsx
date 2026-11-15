export default function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-label="Toolpath mark"
    >
      <rect width="32" height="32" rx="9" fill="var(--accent)" />
      <circle cx="9" cy="16" r="3" fill="#0B1220" />
      <circle cx="23" cy="9" r="3" fill="#0B1220" />
      <circle cx="23" cy="23" r="3" fill="#0B1220" />
      <path
        d="M11.5 14.5 20.5 10M11.5 17.5 20.5 22"
        stroke="#0B1220"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
