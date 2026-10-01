// Small line icons, 16px grid, drawn with currentColor.
const PATHS: Record<string, React.ReactNode> = {
  inbox: <path d="M2.5 9.5 4 3.5h8l1.5 6M2.5 9.5v3h11v-3M2.5 9.5h3.2l.8 1.5h3l.8-1.5h3.2" />,
  today: (
    <>
      <circle cx="8" cy="8" r="3" />
      <path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1 1M11.6 11.6l1 1M3.4 12.6l1-1M11.6 4.4l1-1" />
    </>
  ),
  upcoming: (
    <>
      <rect x="2" y="3" width="12" height="11" rx="1.5" />
      <path d="M2 6.5h12M5 1.5v3M11 1.5v3" />
    </>
  ),
  question: (
    <>
      <circle cx="8" cy="8" r="6.2" />
      <path d="M6.2 6.2a1.9 1.9 0 1 1 2.6 1.8c-.5.2-.8.6-.8 1.1v.4M8 11.4v.1" />
    </>
  ),
  waiting: <path d="M4.5 1.8h7M4.5 14.2h7M5 1.8c0 3 6 3.7 6 6.2s-6 3.2-6 6.2M11 1.8c0 3-6 3.7-6 6.2s6 3.2 6 6.2" />,
  decision: <path d="M8 14.5V9M8 9 3.5 4.5M8 9l4.5-4.5M3.5 4.5V7M3.5 4.5H6M12.5 4.5V7M12.5 4.5H10" />,
  delegated: (
    <>
      <circle cx="6" cy="5" r="2.3" />
      <path d="M1.8 13.5c.4-2.4 2.1-3.8 4.2-3.8s3.8 1.4 4.2 3.8M11 6.5h3.5M12.8 4.8l1.7 1.7-1.7 1.7" />
    </>
  ),
  idea: <path d="M8 1.8a4.2 4.2 0 0 0-2.5 7.6V11h5V9.4A4.2 4.2 0 0 0 8 1.8ZM6 13h4M6.7 14.8h2.6" />,
  note: (
    <>
      <path d="M3.5 1.8h6l3 3v9.4h-9z" />
      <path d="M9.5 1.8v3h3M5.5 8h5M5.5 10.5h5" />
    </>
  ),
  logbook: (
    <>
      <path d="M3 2.5h8.5a1 1 0 0 1 1 1v10.5H4a1 1 0 0 1-1-1z" />
      <path d="M5.5 7.5 7 9l2.8-3" />
    </>
  ),
  search: (
    <>
      <circle cx="7" cy="7" r="4.5" />
      <path d="m10.5 10.5 3.5 3.5" />
    </>
  ),
  plus: <path d="M8 3v10M3 8h10" />,
  project: <circle cx="8" cy="8" r="5.5" />,
  close: <path d="M4 4l8 8M12 4l-8 8" />,
  menu: <path d="M2.5 4h11M2.5 8h11M2.5 12h11" />,
  person: (
    <>
      <circle cx="8" cy="5.5" r="2.7" />
      <path d="M2.8 14c.6-2.8 2.7-4.3 5.2-4.3s4.6 1.5 5.2 4.3" />
    </>
  ),
  grid: (
    <>
      <rect x="2" y="2" width="5" height="5" rx="1" />
      <rect x="9" y="2" width="5" height="5" rx="1" />
      <rect x="2" y="9" width="5" height="5" rx="1" />
      <rect x="9" y="9" width="5" height="5" rx="1" />
    </>
  ),
};

export function Icon({ name, className, size = 16 }: { name: string; className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      className={className}
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {PATHS[name]}
    </svg>
  );
}
