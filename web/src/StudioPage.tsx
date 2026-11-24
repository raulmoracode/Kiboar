const RELEASE = "https://github.com/raulmoracode/Kiboar/releases/tag/studio-v0.1.0";
const DMG =
  "https://github.com/raulmoracode/Kiboar/releases/download/studio-v0.1.0/Kiboar.Studio_0.1.0_aarch64.dmg";
const SUMS = "https://github.com/raulmoracode/Kiboar/releases/download/studio-v0.1.0/SHA256SUMS";
const INSTALL = "https://github.com/raulmoracode/Kiboar/blob/main/software/INSTALL.md";
const DEVELOPMENT = "https://github.com/raulmoracode/Kiboar/blob/main/software/DEVELOPMENT.md";
const SOURCE = "https://github.com/raulmoracode/Kiboar/tree/main/software";

const STEPS = [
  {
    number: "01",
    title: "Detect",
    line: "Finds the board over USB and reads its identity, including the MCU and revision.",
  },
  {
    number: "02",
    title: "Verify",
    line: "Checks the UF2, the MCU family and the signature before anything is written.",
  },
  {
    number: "03",
    title: "Flash",
    line: "Copies with progress and cancellation, and removes a partial file if you cancel.",
  },
] as const;

export function StudioPage({ onHome }: { onHome: () => void }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1180px] flex-col px-6 py-10 sm:px-10 sm:py-14">
      <header className="mb-12 flex h-11 items-center justify-between">
        <div className="flex items-baseline gap-2.5">
          <a
            href="/"
            onClick={(event) => {
              event.preventDefault();
              onHome();
            }}
            className="text-[13px] font-semibold text-zinc-100"
          >
            Kiboar
          </a>
          <span aria-hidden="true" className="text-[12px] text-zinc-700">
            /
          </span>
          <span className="text-[12px] text-zinc-400">Studio</span>
        </div>
        <a
          href={RELEASE}
          target="_blank"
          rel="noreferrer"
          className="text-[12px] text-zinc-500 transition-colors hover:text-zinc-200"
        >
          Release notes
        </a>
      </header>

      <section
        aria-labelledby="studio-title"
        className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center"
      >
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-lime-300/80 uppercase">
            Kiboar Studio · 0.1.0
          </p>
          <h1
            id="studio-title"
            className="mt-4 max-w-2xl text-[clamp(2.1rem,5vw,3.6rem)] leading-[1.02] font-medium tracking-[-0.02em] text-zinc-100"
          >
            Your board, without the guesswork.
          </h1>
          <p className="mt-6 max-w-xl text-[14px] leading-relaxed text-zinc-400">
            Detect a Kiboar keyboard over USB, verify the firmware you picked and write it to the
            board. Built for the boards you buy and the ones you build from the library.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={DMG}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center rounded bg-zinc-100 px-5 text-[12px] font-medium text-[var(--kiboar-bg)] transition-colors hover:bg-lime-200"
            >
              Download for macOS
            </a>
            <a
              href={INSTALL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center rounded border border-white/15 px-5 text-[12px] text-zinc-300 transition-colors hover:border-white/30 hover:text-zinc-100"
            >
              How to install
            </a>
          </div>
          <p className="mt-3 font-mono text-[10px] text-zinc-600">
            Apple Silicon · aarch64 · unsigned build
          </p>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-white/[0.015] p-6">
          <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.16em] text-zinc-500 uppercase">
            <span>The flasher flow</span>
            <span className="text-lime-300">3 steps</span>
          </div>

          <div className="mt-8 flex items-center gap-5">
            <kbd className="flex size-20 shrink-0 items-center justify-center rounded-lg border border-lime-300/30 bg-lime-300/[0.06] font-mono text-[34px] text-lime-200">
              o
            </kbd>
            <div className="min-w-0">
              <p className="truncate text-[14px] text-zinc-100">Kiboar 60% HHKB</p>
              <p className="mt-1 font-mono text-[10px] text-zinc-500">rp2040 · UF2</p>
            </div>
          </div>

          <ol className="mt-8 space-y-4 border-t border-white/[0.07] pt-6">
            {STEPS.map((step) => (
              <li key={step.number} className="grid grid-cols-[2rem_1fr] gap-3">
                <span className="font-mono text-[11px] text-zinc-600">{step.number}</span>
                <div>
                  <p className="text-[13px] text-zinc-200">{step.title}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-500">{step.line}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="install-title" className="mt-20 border-t border-white/[0.07] pt-10">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="min-w-0">
            <h2 id="install-title" className="text-[18px] font-medium text-zinc-100">
              Install on macOS
            </h2>
            <p className="mt-3 max-w-md text-[13px] leading-relaxed text-zinc-400">
              The 0.1 build is unsigned and not notarized. Gatekeeper will warn you; follow the
              install guide instead of bypassing it blindly. The published DMG is for Apple Silicon.
            </p>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[12px]">
              <a
                href={DMG}
                target="_blank"
                rel="noreferrer"
                className="text-zinc-200 underline decoration-white/20 underline-offset-4 hover:text-lime-200"
              >
                Download the DMG
              </a>
              <a
                href={SUMS}
                target="_blank"
                rel="noreferrer"
                className="text-zinc-400 underline decoration-white/15 underline-offset-4 hover:text-lime-200"
              >
                SHA-256
              </a>
              <a
                href={INSTALL}
                target="_blank"
                rel="noreferrer"
                className="text-zinc-400 underline decoration-white/15 underline-offset-4 hover:text-lime-200"
              >
                Manual steps and uninstall
              </a>
            </div>
          </div>

          <div className="min-w-0">
            <p className="font-mono text-[10px] tracking-[0.16em] text-zinc-500 uppercase">
              Or with Homebrew
            </p>
            <pre className="mt-3 overflow-x-auto rounded-lg border border-white/[0.07] bg-black/30 p-4 font-mono text-[11px] leading-relaxed text-zinc-300">
              <code>{`brew tap raulmoracode/kiboar
brew trust --cask raulmoracode/kiboar/kiboar-studio
brew install --cask kiboar-studio`}</code>
            </pre>
            <p className="mt-3 text-[11px] leading-relaxed text-zinc-500">
              There is also an installer script that checks the published SHA-256 and removes the
              quarantine attribute from the copy it installs. Read it before running it:{" "}
              <a
                href="https://raw.githubusercontent.com/raulmoracode/Kiboar/main/software/scripts/install-macos.sh"
                target="_blank"
                rel="noreferrer"
                className="text-zinc-300 underline decoration-white/20 underline-offset-4 hover:text-lime-200"
              >
                install-macos.sh
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="scope-title" className="mt-16 border-t border-white/[0.07] pt-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div>
            <h2 id="scope-title" className="text-[18px] font-medium text-zinc-100">
              What 0.1 is, and what it is not
            </h2>
            <p className="mt-3 text-[13px] leading-relaxed text-zinc-400">
              The MVP is a safe flasher. Remap, layout, a board editor and firmware identity are
              later milestones; the app does not pretend to have them.
            </p>
            <p className="mt-3 text-[13px] leading-relaxed text-zinc-400">
              Detection and copying are tested in software. Verification on physical hardware is
              still pending, and the build is unsigned.
            </p>
            <a
              href={DEVELOPMENT}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-block text-[12px] text-zinc-300 underline decoration-white/20 underline-offset-4 hover:text-lime-200"
            >
              Read the development plan
            </a>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Detect", "USB enumeration and board identity."],
              ["Inspect", "UF2 blocks, MCU family and signature."],
              ["Confirm", "Typed confirmation before writing."],
              ["Recover", "Cancel, progress and partial-file cleanup."],
            ].map(([title, line]) => (
              <div
                key={title}
                className="rounded-lg border border-white/[0.06] bg-white/[0.015] p-4"
              >
                <p className="text-[12px] text-zinc-200">{title}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">{line}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="mt-20 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.07] pt-6 text-[12px] text-zinc-500">
        <p>Kiboar Studio is part of the open Kiboar repository.</p>
        <div className="flex gap-5">
          <a href={SOURCE} target="_blank" rel="noreferrer" className="hover:text-zinc-200">
            Source
          </a>
          <a href={RELEASE} target="_blank" rel="noreferrer" className="hover:text-zinc-200">
            Releases
          </a>
          <a
            href="https://kiboar.raulmoracode.com/docs"
            target="_blank"
            rel="noreferrer"
            className="hover:text-zinc-200"
          >
            Docs
          </a>
        </div>
      </footer>
    </div>
  );
}
