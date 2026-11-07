export function DriverSearchingStrip({ label }: { label: string }) {
  return (
    <div role="status" aria-live="polite" className="driver-search-strip relative flex min-h-11 items-center justify-center gap-2 overflow-hidden border-y border-brand/15 bg-sun px-5 py-1.5">
      <div className="relative h-8 w-16 shrink-0 overflow-hidden text-brand" aria-hidden="true">
        <svg viewBox="0 0 96 48" className="driver-search-scooter relative z-10 h-8 w-16" fill="none">
          <circle cx="27" cy="35" r="7" stroke="currentColor" strokeWidth="3" className="fill-sun" />
          <circle cx="70" cy="35" r="7" stroke="currentColor" strokeWidth="3" className="fill-sun" />
          <path d="M27 34h28l9-8-5-18h9m-9 0-4-4M38 19h13m-5 1v9H29l-5-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="14" y="10" width="22" height="16" rx="3" fill="currentColor" />
          <path d="M21 18h8" className="stroke-sun" strokeWidth="2" strokeLinecap="round" />
          <circle cx="49" cy="7" r="4" fill="currentColor" />
          <path d="m47 13-6 9 12 4 1 8m-8-18 11 1" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="driver-search-road absolute bottom-0 left-0 flex w-48 items-center justify-around text-brand/60">
          {Array.from({ length: 12 }, (_, i) => <span key={i} className="h-0.5 w-2 shrink-0 bg-current" />)}
        </div>
      </div>
      <p className="min-w-0 text-sm font-bold text-sun-foreground">{label}</p>
      <span aria-hidden="true" className="driver-search-progress absolute inset-x-0 bottom-0 h-0.5 bg-brand/15"><span className="block h-full w-1/4 bg-brand" /></span>
    </div>
  );
}