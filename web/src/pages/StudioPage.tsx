import { docs as DOCS, studio } from "@kiboar/links";
import { LandingLayout } from "../components/LandingLayout";

const {
  release: RELEASE,
  dmg: DMG,
  sums: SUMS,
  install: INSTALL,
  adr: DEVELOPMENT,
  script: SCRIPT,
  source: SOURCE,
  roadmap: ROADMAP,
} = studio;

const NOTE_LINK = "underline decoration-white/20 underline-offset-4 hover:text-lime-200";
const FOOTER_LINK = "transition-colors hover:text-zinc-200";

export function StudioPage({ onNavigate }: { onNavigate: (href: string) => void }) {
  return (
    <LandingLayout
      title="Kiboar Studio"
      word="Studio"
      keyboardLabel="Studio keyboard"
      onNavigate={onNavigate}
    >
      <section aria-labelledby="studio-title" className="border-t border-white/[0.07] pt-10">
        <p className="kiboar-eyebrow">macOS · flasher · 0.1.0</p>
        <h1
          id="studio-title"
          className="mt-3 text-[26px] leading-tight font-medium tracking-[-0.01em] text-zinc-100"
        >
          Kiboar Studio
        </h1>
        <p className="mt-4 max-w-[520px] text-[13px] leading-relaxed text-zinc-400">
          Detects a Kiboar board, verifies the firmware and writes it — bought assembled or built
          from the published library.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
          <a href={DMG} target="_blank" rel="noreferrer" className="kiboar-button-primary">
            Download for macOS
          </a>
          <a
            href={INSTALL}
            target="_blank"
            rel="noreferrer"
            className={`text-[12px] text-zinc-400 ${NOTE_LINK}`}
          >
            Install guide
          </a>
        </div>
        <p className="mt-3 font-mono text-[10px] text-zinc-600">
          Apple Silicon · unsigned · Gatekeeper warns
        </p>

        <pre className="mt-6 overflow-x-auto rounded border border-white/[0.07] bg-black/30 p-3 font-mono text-[10px] leading-relaxed text-zinc-300 sm:p-4">
          <code>{`brew tap raulmoracode/kiboar
brew trust --cask raulmoracode/kiboar/kiboar-studio
brew install --cask kiboar-studio`}</code>
        </pre>
        <p className="mt-2 text-[11px] leading-relaxed text-zinc-500">
          Or{" "}
          <a
            href={SCRIPT}
            target="_blank"
            rel="noreferrer"
            className={`text-zinc-300 ${NOTE_LINK}`}
          >
            install-macos.sh
          </a>
          , which checks the{" "}
          <a href={SUMS} target="_blank" rel="noreferrer" className={`text-zinc-300 ${NOTE_LINK}`}>
            SHA-256
          </a>{" "}
          and clears quarantine.
        </p>

        <p className="mt-8 max-w-[520px] text-[12px] leading-relaxed text-zinc-500">
          0.1 flashes: detect, verify, write, cancel, with partial-file cleanup. Remap, layout and
          the editor come later. Detection and copy are tested; hardware verification is pending.
        </p>
        <a
          href={DEVELOPMENT}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-block text-[12px] text-zinc-400 underline decoration-white/20 underline-offset-4 hover:text-lime-200"
        >
          Scope and safety
        </a>

        <p className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-zinc-500">
          <a href={SOURCE} target="_blank" rel="noreferrer" className={FOOTER_LINK}>
            Source
          </a>
          <a href={RELEASE} target="_blank" rel="noreferrer" className={FOOTER_LINK}>
            Releases
          </a>
          <a href={ROADMAP} target="_blank" rel="noreferrer" className={FOOTER_LINK}>
            Roadmap
          </a>
          <a href={DOCS} target="_blank" rel="noreferrer" className={FOOTER_LINK}>
            Docs
          </a>
        </p>
      </section>
    </LandingLayout>
  );
}
