interface IconProps {
  className?: string;
}

export function CardsIcon({ className }: IconProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="6" y="3.5" width="9" height="13" rx="2" stroke="currentColor" opacity="0.3" transform="rotate(-10 10.5 10)" />
      <rect x="7.5" y="4" width="9" height="13" rx="2" stroke="currentColor" fill="white" />
      <rect x="9" y="3.5" width="9" height="13" rx="2" stroke="currentColor" opacity="0.3" transform="rotate(10 13.5 10)" />
      <path d="M12 8 L13 9.5 L12 11 L11 9.5 Z" fill="currentColor" stroke="none" opacity="0.5" />
    </svg>
  );
}

export function DealIcon({ className }: IconProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <line x1="12" y1="5" x2="12" y2="17" />
      <path d="M9 19 Q12 20.5 15 19" strokeWidth="1.5" />
      <line x1="12" y1="17" x2="12" y2="19" />
      <circle cx="12" cy="5" r="1.2" fill="currentColor" stroke="none" />
      <line x1="5" y1="7" x2="19" y2="7" />
      <path d="M5 7 L3.5 12" />
      <path d="M3.5 12 C4.5 13.5 6.5 13.5 7.5 12" />
      <path d="M7.5 12 L6 7" />
      <path d="M18 7 L16.5 12" />
      <path d="M16.5 12 C17.5 13.5 19.5 13.5 20.5 12" />
      <path d="M20.5 12 L19 7" />
    </svg>
  );
}

export function MoreIcon({ className }: IconProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <line x1="4" y1="6" x2="20" y2="6" />
      <circle cx="15" cy="6" r="2" fill="white" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <circle cx="9" cy="12" r="2" fill="white" />
      <line x1="4" y1="18" x2="20" y2="18" />
      <circle cx="14" cy="18" r="2" fill="white" />
    </svg>
  );
}
