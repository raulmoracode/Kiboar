import { PageHeader } from "../components/PageHeader";

const RELEASE = "https://github.com/raulmoracode/Kiboar/releases/tag/studio-v0.1.0";
const DMG =
  "https://github.com/raulmoracode/Kiboar/releases/download/studio-v0.1.0/Kiboar.Studio_0.1.0_aarch64.dmg";
const SUMS = "https://github.com/raulmoracode/Kiboar/releases/download/studio-v0.1.0/SHA256SUMS";
const INSTALL = "https://github.com/raulmoracode/Kiboar/blob/main/software/INSTALL.md";
const DEVELOPMENT = "https://github.com/raulmoracode/Kiboar/blob/main/software/DEVELOPMENT.md";
const SOURCE = "https://github.com/raulmoracode/Kiboar/tree/main/software";

export function StudioPage({ onHome }: { onHome: () => void }) {
  return (
    <div className="mx-auto w-full max-w-[760px] px-6 py-10 sm:px-10 sm:py-14">
      <PageHeader
        section="Studio"
        onHome={onHome}
        right={
          <a
            href={RELEASE}
            target="_blank"
            rel="noreferrer"
            className="text-[12px] text-zinc-500 transition-colors hover:text-zinc-200"
          >
            0.1.0
          </a>
        }
      />

      <section aria-labelledby="studio-title" className="mt-20">
        <p className="kiboar-eyebrow">macOS · flasher</p>
        <h1
          id="studio-title"
          className="mt-3 text-[28px] leading-tight font-medium tracking-[-0.01em] text-zinc-100"
        >
          Kiboar Studio
        </h1>
        <p className="mt-5 max-w-[540px] text-[13px] leading-relaxed text-zinc-400">
          Detect a Kiboar board over USB, verify the firmware and write it. Built for boards bought
          assembled and for boards built from the published library.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
          <a href={DMG} target="_blank" rel="noreferrer" className="kiboar-button-primary">
            Download for macOS
          </a>
          <a
            href={INSTALL}
            target="_blank"
            rel="noreferrer"
            className="text-[12px] text-zinc-400 kiboar-link"
          >
            Install guide
          </a>
        </div>
        <p className="mt-3 font-mono text-[10px] text-zinc-600">
          Apple Silicon · unsigned build · 0.1.0
        </p>
      </section>

      <section aria-labelledby="install-title" className="mt-16 border-t border-white/[0.07] pt-8">
        <h2 id="install-title" className="kiboar-eyebrow">
          Install
        </h2>
        <p className="mt-4 max-w-[560px] text-[13px] leading-relaxed text-zinc-400">
          The build is unsigned and not notarized. Gatekeeper will warn you; the guide covers the
          manual steps and how to uninstall. The published DMG is for Apple Silicon.
        </p>

        <pre className="mt-5 overflow-x-auto rounded border border-white/[0.07] bg-black/30 p-3 font-mono text-[10px] leading-relaxed text-zinc-300 sm:p-4 sm:text-[11px]">
          <code>{`brew tap raulmoracode/kiboar
brew trust --cask raulmoracode/kiboar/kiboar-studio
brew install --cask kiboar-studio`}</code>
        </pre>

        <p className="mt-3 text-[12px] leading-relaxed text-zinc-500">
          Or use the installer script, which checks the published SHA-256 and removes the quarantine
          attribute from the copy it installs.{" "}
          <a
            href="https://raw.githubusercontent.com/raulmoracode/Kiboar/main/software/scripts/install-macos.sh"
            target="_blank"
            rel="noreferrer"
            className="text-zinc-300 kiboar-link"
          >
            install-macos.sh
          </a>
        </p>

        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[12px]">
          <a href={DMG} target="_blank" rel="noreferrer" className="text-zinc-300 kiboar-link">
            DMG
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
      </section>

      <section aria-labelledby="scope-title" className="mt-12 border-t border-white/[0.07] pt-8">
        <h2 id="scope-title" className="kiboar-eyebrow">
          Scope
        </h2>
        <p className="mt-4 max-w-[560px] text-[13px] leading-relaxed text-zinc-400">
          0.1 is a flasher: detect, verify, write and cancel, with a partial-file cleanup. Remap,
          layout, the board editor and firmware identity are later milestones.
        </p>
        <p className="mt-3 max-w-[560px] text-[13px] leading-relaxed text-zinc-400">
          Detection and copying are tested in software. Verification on physical hardware is still
          pending, and the build is unsigned.
        </p>
        <a
          href={DEVELOPMENT}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-block text-[12px] text-zinc-400 kiboar-link"
        >
          Development plan
        </a>
      </section>

      <dl className="mt-12 grid grid-cols-[5rem_1fr] gap-y-2 border-t border-white/[0.07] pt-8 text-[12px]">
        <dt className="text-zinc-500">Version</dt>
        <dd className="font-mono text-zinc-300">0.1.0</dd>
        <dt className="text-zinc-500">Platform</dt>
        <dd className="text-zinc-300">macOS, Apple Silicon</dd>
        <dt className="text-zinc-500">Build</dt>
        <dd className="text-zinc-300">Unsigned, not notarized</dd>
        <dt className="text-zinc-500">Source</dt>
        <dd>
          <a href={SOURCE} target="_blank" rel="noreferrer" className="text-zinc-300 kiboar-link">
            software/
          </a>
        </dd>
      </dl>

      <footer className="mt-12 flex flex-wrap gap-5 border-t border-white/[0.07] pt-6 text-[12px] text-zinc-500">
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
        <a
          href="https://github.com/raulmoracode/Kiboar"
          target="_blank"
          rel="noreferrer"
          className="hover:text-zinc-200"
        >
          GitHub
        </a>
      </footer>
    </div>
  );
}
