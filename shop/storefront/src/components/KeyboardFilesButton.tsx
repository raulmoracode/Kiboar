export function KeyboardFilesButton({ url }: { url: string | null }) {
  if (!url) {
    return null;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded border border-white/15 text-[12px] font-medium text-zinc-300 transition-colors hover:border-white/30 hover:text-zinc-100 sm:max-w-sm"
    >
      Keyboard files on GitHub
      <span className="sr-only"> (opens in a new tab)</span>
      <span aria-hidden="true">↗</span>
    </a>
  );
}
