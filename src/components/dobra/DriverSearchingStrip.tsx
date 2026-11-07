export function DriverSearchingStrip({ label }: { label: string }) {
  return (
    <div role="status" aria-live="polite" className="driver-search-strip relative flex min-h-20 w-full items-center gap-2 overflow-hidden rounded-2xl border border-brand/20 bg-sun px-3 py-2">
      <div className="relative h-14 w-24 shrink-0 overflow-hidden text-brand" aria-hidden="true">
        <span className="driver-search-ripple absolute left-10 top-3 size-7 rounded-full border border-brand/30" />
        <svg viewBox="0 0 96 48" className="driver-search-scooter relative z-10 h-12 w-24" fill="none">
          <g className="driver-search-wheel driver-search-wheel-rear"><circle cx="27" cy="35" r="7" stroke="currentColor" strokeWidth="3" className="fill-sun" /><path d="M27 29v12m-6-6h12" stroke="currentColor" strokeWidth="2" /></g>
          <g className="driver-search-wheel driver-search-wheel-front"><circle cx="70" cy="35" r="7" stroke="currentColor" strokeWidth="3" className="fill-sun" /><path d="M70 29v12m-6-6h12" stroke="currentColor" strokeWidth="2" /></g>
          <path d="M27 34h28l9-8-5-18h9m-9 0-4-4M38 19h13m-5 1v9H29l-5-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="14" y="10" width="22" height="16" rx="3" fill="currentColor" />
          <path d="M21 18h8" className="stroke-sun" strokeWidth="2" strokeLinecap="round" />
          <circle cx="49" cy="7" r="4" fill="currentColor" />
          <path d="m47 13-6 9 12 4 1 8m-8-18 11 1" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="driver-search-speed absolute left-0 top-5 flex w-5 flex-col gap-1"><span className="h-0.5 w-5 rounded-full bg-brand" /><span className="h-0.5 w-3 rounded-full bg-brand" /><span className="h-0.5 w-4 rounded-full bg-brand" /></div>
        <div className="driver-search-road absolute bottom-1 left-0 flex w-48 items-center justify-around text-brand/70">
          {Array.from({ length: 16 }, (_, i) => <span key={i} className="size-1 shrink-0 rounded-full bg-current" />)}
        </div>
      </div>
      <p className="sr-only">{label}</p>
      <div aria-hidden="true" className="min-w-0 flex-1 text-sm font-bold leading-snug text-sun-foreground">
        {label.replace(/[.…]+$/, "")}<span className="driver-search-dots inline-flex w-5 justify-center"><span>.</span><span>.</span><span>.</span></span>
      </div>
      <span aria-hidden="true" className="driver-search-progress absolute inset-x-0 bottom-0 h-0.5 bg-brand/15"><span className="block h-full w-1/4 bg-brand" /></span>
    </div>
  );
}