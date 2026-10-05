export default function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-primary shadow-card">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M5 12.8 9.8 17.5 19 7" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {!compact && (
        <span className="font-display text-[21px] font-semibold tracking-tight text-ink">
          Grant<span className="italic text-primary">Finder</span>
        </span>
      )}
    </span>
  );
}
