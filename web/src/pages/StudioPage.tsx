import { studio } from "@kiboar/links";
import { LandingLayout } from "../components/LandingLayout";

const { dmg: DMG, sums: SUMS, install: INSTALL, script: SCRIPT } = studio;

const LINK = "kiboar-link text-[11px] text-zinc-400";

const STEPS = ["Detect", "Verify", "Write", "Cancel"] as const;

export function StudioPage({ onNavigate }: { onNavigate: (href: string) => void }) {
  return (
    <LandingLayout
      title="Kiboar Studio"
      word="Studio"
      keyboardLabel="Studio keyboard"
      onNavigate={onNavigate}
      wide
      autoScroll
    >
      <div className="grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
        <section aria-labelledby="studio-download-title" className="flex flex-col kiboar-card p-6">
          <p className="kiboar-eyebrow">macOS · 0.1.0</p>
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
          <p className="kiboar-eyebrow">Homebrew</p>
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
        <h2
          id="studio-status-title"
          className="text-[20px] leading-tight font-medium text-zinc-100"
        >
          One app for the whole board
        </h2>
        <p className="mt-3 max-w-[640px] text-[13px] leading-relaxed text-zinc-400">
          Studio detects a connected Kiboar board, verifies the firmware and writes it. It is also
          where remapping, layouts and the keymap editor will live, so flashing and configuring stop
          being separate tools.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
          {STEPS.map((step) => (
            <span
              key={step}
              className="rounded bg-[var(--kiboar-accent)] px-3 py-2 font-mono text-[11px] text-[var(--kiboar-accent-text)]"
            >
              {step}
            </span>
          ))}
        </div>

        <p className="mt-4 max-w-[640px] text-[11px] leading-relaxed text-zinc-600">
          Detect, verify and write ship in 0.1. Remap, layouts and the editor are in progress.
        </p>
      </section>
    </LandingLayout>
  );
}
