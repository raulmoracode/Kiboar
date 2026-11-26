import { library } from "@kiboar/links";
import { LandingLayout } from "../components/LandingLayout";

const { pcm: PCM, clone: CLONE, licensing: LICENSING, notice: NOTICE, source: SOURCE } = library;

const STATS = [
  ["Symbols", "145"],
  ["Footprints", "173"],
  ["Libraries", "26"],
  ["3D models", "89"],
] as const;

const CARD_LINK =
  "group flex flex-col justify-between kiboar-card p-6 transition-colors hover:border-white/25";
const NOTE_LINK =
  "text-[11px] text-zinc-400 underline decoration-white/15 underline-offset-4 transition-colors hover:text-lime-200";

function InstallCard({
  href,
  label,
  line,
  action,
}: {
  href: string;
  label: string;
  line: string;
  action: string;
}) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={CARD_LINK}>
      <div>
        <h2 className="font-mono text-[10px] tracking-[0.12em] text-zinc-600 uppercase">{label}</h2>
        <p className="mt-4 max-w-[320px] text-[13px] leading-relaxed text-zinc-400">{line}</p>
      </div>
      <span className="mt-8 flex items-center justify-between gap-4 border-t border-white/[0.06] pt-3 text-[12px] text-zinc-200">
        {action}
        <span
          aria-hidden="true"
          className="text-zinc-600 transition-transform group-hover:translate-x-0.5 group-hover:text-lime-200"
        >
          →
        </span>
      </span>
    </a>
  );
}

export function LibraryPage({ onNavigate }: { onNavigate: (href: string) => void }) {
  return (
    <LandingLayout
      title="Library"
      word="Library"
      keyboardLabel="Library keyboard"
      onNavigate={onNavigate}
      wide
    >
      <h1 className="sr-only">Library</h1>

      <section aria-label="Install the library" className="grid gap-3 md:grid-cols-2">
        <InstallCard
          href={PCM}
          label="PCM package"
          line="Install the official parts from KiCad's Plugin and Content Manager."
          action="Install with PCM"
        />
        <InstallCard
          href={CLONE}
          label="Git clone"
          line="Point KiCad at the repository and run the clone setup."
          action="Clone install"
        />
      </section>

      <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/[0.06] bg-white/[0.06] sm:grid-cols-4">
        {STATS.map(([label, value]) => (
          <div key={label} className="bg-[var(--kiboar-bg)] p-5">
            <dt className="font-mono text-[10px] tracking-[0.12em] text-zinc-600 uppercase">
              {label}
            </dt>
            <dd className="mt-2 font-mono text-[26px] text-zinc-200">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3">
        <p className="max-w-[560px] font-mono text-[10px] leading-relaxed text-zinc-600">
          KiCad 10.0 or newer · not an npm package · original work MIT; imported symbols keep their
          source licence.
        </p>
        <nav aria-label="Library links" className="flex flex-wrap gap-x-4 gap-y-2 text-[11px]">
          <a href={LICENSING} target="_blank" rel="noreferrer" className={NOTE_LINK}>
            Licensing
          </a>
          <a href={SOURCE} target="_blank" rel="noreferrer" className={NOTE_LINK}>
            Source
          </a>
          <a href={NOTICE} target="_blank" rel="noreferrer" className={NOTE_LINK}>
            NOTICE
          </a>
        </nav>
      </div>
    </LandingLayout>
  );
}
