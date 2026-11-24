import { PageHeader } from "../components/PageHeader";

const PCM = "https://kiboar.raulmoracode.com/docs/install/pcm";
const CLONE = "https://kiboar.raulmoracode.com/docs/install/clone";
const LICENSING = "https://kiboar.raulmoracode.com/docs/licensing";
const NOTICE = "https://github.com/raulmoracode/Kiboar/blob/main/NOTICE";
const SOURCE = "https://github.com/raulmoracode/Kiboar/tree/main/library";

const STATS = [
  ["Symbols", "145"],
  ["Footprints", "173"],
  ["Libraries", "26"],
  ["3D models", "89"],
] as const;

export function LibraryPage({ onHome }: { onHome: () => void }) {
  return (
    <div className="mx-auto w-full max-w-[760px] px-6 py-10 sm:px-10 sm:py-14">
      <PageHeader
        section="Library"
        onHome={onHome}
        right={
          <a
            href={NOTICE}
            target="_blank"
            rel="noreferrer"
            className="text-[12px] text-zinc-500 transition-colors hover:text-zinc-200"
          >
            NOTICE
          </a>
        }
      />

      <section aria-labelledby="library-title" className="mt-20">
        <p className="font-mono text-[10px] tracking-[0.16em] text-zinc-500 uppercase">
          KiCad 10 · MIT
        </p>
        <h1
          id="library-title"
          className="mt-3 text-[28px] leading-tight font-medium tracking-[-0.01em] text-zinc-100"
        >
          Library
        </h1>
        <p className="mt-5 max-w-[560px] text-[13px] leading-relaxed text-zinc-400">
          The official KiCad parts Kiboar designs with, published so you can design and build your
          own board. Symbols, footprints and 3D models, distributed as a PCM package or a clone.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
          <a
            href={PCM}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center rounded bg-zinc-100 px-4 text-[12px] font-medium text-[var(--kiboar-bg)] transition-colors hover:bg-lime-200"
          >
            Install with PCM
          </a>
          <a
            href={CLONE}
            target="_blank"
            rel="noreferrer"
            className="text-[12px] text-zinc-400 underline decoration-white/20 underline-offset-4 transition-colors hover:text-lime-200"
          >
            Clone install
          </a>
        </div>
        <p className="mt-3 font-mono text-[10px] text-zinc-600">
          KiCad 10.0 or newer · not an npm package
        </p>
      </section>

      <dl className="mt-12 grid grid-cols-2 gap-y-6 border-y border-white/[0.07] py-6 sm:grid-cols-4">
        {STATS.map(([label, value]) => (
          <div key={label}>
            <dt className="font-mono text-[10px] tracking-[0.12em] text-zinc-600 uppercase">
              {label}
            </dt>
            <dd className="mt-1 font-mono text-[20px] text-zinc-200">{value}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="library-scope-title" className="mt-12">
        <h2
          id="library-scope-title"
          className="font-mono text-[10px] tracking-[0.16em] text-zinc-500 uppercase"
        >
          Scope
        </h2>
        <p className="mt-4 max-w-[560px] text-[13px] leading-relaxed text-zinc-400">
          Original work is MIT. Fifteen imported symbols keep the licence of their source, recorded
          in the NOTICE. Keyswitch footprints and models are being redesigned and are not part of
          this version.
        </p>
        <p className="mt-3 max-w-[560px] text-[13px] leading-relaxed text-zinc-400">
          The library is a collection of KiCad assets with Python tooling. It is not an npm package
          and does not run inside Studio.
        </p>
        <a
          href={LICENSING}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-block text-[12px] text-zinc-400 underline decoration-white/20 underline-offset-4 hover:text-lime-200"
        >
          Licensing
        </a>
      </section>

      <footer className="mt-12 flex flex-wrap gap-5 border-t border-white/[0.07] pt-6 text-[12px] text-zinc-500">
        <a href={SOURCE} target="_blank" rel="noreferrer" className="hover:text-zinc-200">
          Source
        </a>
        <a href={PCM} target="_blank" rel="noreferrer" className="hover:text-zinc-200">
          Documentation
        </a>
        <a href={NOTICE} target="_blank" rel="noreferrer" className="hover:text-zinc-200">
          NOTICE
        </a>
      </footer>
    </div>
  );
}
