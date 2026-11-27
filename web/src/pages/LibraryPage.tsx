import { library } from "@kiboar/links";
import { LandingLayout } from "../components/LandingLayout";

const { pcm: PCM, clone: CLONE } = library;

const STATS = [
  ["Symbols", "145"],
  ["Footprints", "173"],
  ["Libraries", "26"],
  ["3D models", "129"],
] as const;

const CARD_LINK =
  "group flex flex-col justify-between kiboar-card p-6 transition-colors hover:border-white/25";

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
        <h2 className="kiboar-eyebrow">{label}</h2>
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
      autoScroll
    >
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
            <dt className="kiboar-eyebrow">{label}</dt>
            <dd className="mt-2 font-mono text-[26px] text-[var(--kiboar-accent)]">{value}</dd>
          </div>
        ))}
      </dl>
    </LandingLayout>
  );
}
