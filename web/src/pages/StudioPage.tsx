import { studio } from "@kiboar/links";
import { LandingLayout } from "../components/LandingLayout";

const { dmg: DMG, sums: SUMS, install: INSTALL, adr: DEVELOPMENT, script: SCRIPT } = studio;

const LINK =
  "text-[11px] text-zinc-400 underline decoration-white/15 underline-offset-4 transition-colors hover:text-lime-200";

const STEPS = ["Detect", "Verify", "Write", "Cancel"] as const;

export function StudioPage({ onNavigate }: { onNavigate: (href: string) => void }) {
  return (
    <LandingLayout
      title="Kiboar Studio"
      word="Studio"
      keyboardLabel="Studio keyboard"
      onNavigate={onNavigate}
      wide
    >
      <h1 className="sr-only">Kiboar Studio</h1>

      <div className="grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
        <section aria-labelledby="studio-download-title" className="flex flex-col kiboar-card p-6">
          <p className="font-mono text-[10px] tracking-[0.12em] text-zinc-600 uppercase">
            macOS · 0.1.0
          </p>
          <h2
            id="studio-download-title"
            className="mt-3 text-[22px] leading-tight font-medium text-zinc-100"
          >
            Download
          </h2>
          <p className="mt-4 max-w-[420px] text-[13px] leading-relaxed text-zinc-400">
            Detects a Kiboar board, verifies the firmware and writes it — bought assembled or built
            from the published library.
          </p>

          <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3 pt-8">
            <a href={DMG} target="_blank" rel="noreferrer" className="kiboar-button-primary">
              Download for macOS
            </a>
            <a href={INSTALL} target="_blank" rel="noreferrer" className={LINK}>
              Install guide
            </a>
          </div>
          <p className="mt-3 font-mono text-[10px] text-zinc-600">
            Apple Silicon · unsigned · Gatekeeper warns
          </p>
        </section>

        <section aria-labelledby="studio-brew-title" className="flex flex-col kiboar-card p-6">
          <p className="font-mono text-[10px] tracking-[0.12em] text-zinc-600 uppercase">
            Homebrew
          </p>
          <h2
            id="studio-brew-title"
            className="mt-3 text-[22px] leading-tight font-medium text-zinc-100"
          >
            Terminal install
          </h2>

          <pre className="mt-5 overflow-x-auto rounded border border-white/[0.07] bg-black/30 p-3 font-mono text-[10px] leading-relaxed text-zinc-300 sm:p-4">
            <code>{`brew tap raulmoracode/kiboar
brew trust --cask raulmoracode/kiboar/kiboar-studio
brew install --cask kiboar-studio`}</code>
          </pre>

          <p className="mt-3 text-[11px] leading-relaxed text-zinc-500">
            Or{" "}
            <a href={SCRIPT} target="_blank" rel="noreferrer" className={LINK}>
              install-macos.sh
            </a>
            , which checks the{" "}
            <a href={SUMS} target="_blank" rel="noreferrer" className={LINK}>
              SHA-256
            </a>{" "}
            and clears quarantine.
          </p>
        </section>
      </div>

      <section aria-labelledby="studio-status-title" className="mt-3 kiboar-card p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] tracking-[0.12em] text-zinc-600 uppercase">
              0.1 · flasher
            </p>
            <h2
              id="studio-status-title"
              className="mt-2 text-[20px] leading-tight font-medium text-zinc-100"
            >
              What it does today
            </h2>
          </div>
          <a href={DEVELOPMENT} target="_blank" rel="noreferrer" className={LINK}>
            Scope and safety
          </a>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {STEPS.map((step) => (
            <span
              key={step}
              className="rounded border border-white/[0.07] px-3 py-2 font-mono text-[11px] text-zinc-400"
            >
              {step}
            </span>
          ))}
        </div>

        <p className="mt-4 max-w-[560px] text-[11px] leading-relaxed text-zinc-600">
          Remap, layout and the editor come later. Detection and copy are tested; hardware
          verification is pending.
        </p>
      </section>
    </LandingLayout>
  );
}
