export function Mark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="30" height="30" rx="8" fill="currentColor" opacity="0.1" />
      <rect x="1" y="1" width="30" height="30" rx="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 21c2.5 0 3.5-2 5.5-2s3 2 5.5 2 3-2 3-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M16 6.5v9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12.5 10 16 6.5l3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Mark />
      <span className="font-display text-[1.375rem] leading-none tracking-[-0.01em]">
        Lienry <span className="font-sans text-[0.75rem] font-medium uppercase tracking-[0.12em] align-middle opacity-70">Drones</span>
      </span>
    </span>
  );
}
