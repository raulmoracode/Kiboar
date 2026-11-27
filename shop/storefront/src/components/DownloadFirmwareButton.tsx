function DownloadIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-3.5 shrink-0">
      <path
        d="M8 2v7m0 0 2.75-2.75M8 9 5.25 6.25M3 11.5v1.25h10V11.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DownloadFirmwareButton({ url }: { url: string | null }) {
  if (!url) {
    return null;
  }

  return (
    <a
      href={url}
      download
      target="_blank"
      rel="noopener noreferrer"
      className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded border border-lime-300/40 bg-lime-300/[0.06] text-[12px] font-medium text-lime-100 transition-colors hover:border-lime-300/70 hover:bg-lime-300/[0.12] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-300/60 lg:max-w-sm"
    >
      <DownloadIcon />
      Download official firmware
      <span className="sr-only"> (downloads a file)</span>
    </a>
  );
}
