import Link from "next/link";

// FlowBuild AI wave mark, as on flowbuildai.ie
export function Logo() {
  return (
    <Link
      href="/"
      aria-label="FlowBuild CRM home"
      className="inline-flex items-center gap-2.5 whitespace-nowrap text-[17px] font-bold uppercase tracking-tight text-fg no-underline"
    >
      <svg width="26" height="26" viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="fbMark" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#5B2A1A" />
            <stop offset="55%" stopColor="#C4501B" />
            <stop offset="100%" stopColor="#F7935F" />
          </linearGradient>
        </defs>
        <path
          d="M6 54 C 6 42 20 42 28 48 C 36 54 50 54 54 40"
          stroke="#E8652A"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.35"
        />
        <path
          d="M6 42 C 6 28 22 28 32 36 C 42 44 58 44 58 28"
          stroke="url(#fbMark)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <circle cx="58" cy="28" r="5.5" fill="#F7935F" />
      </svg>
      <span>
        Flow<b className="text-accent">Build</b>
        <span className="ml-1.5 text-xs font-medium normal-case tracking-normal text-muted">
          CRM
        </span>
      </span>
    </Link>
  );
}
