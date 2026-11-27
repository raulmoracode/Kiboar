import { site } from "@kiboar/links";

export function StudioBanner() {
  return (
    <a
      href={`${site}/studio`}
      className="mb-6 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 px-4 py-1 text-center text-[11px] text-zinc-300 transition-colors hover:text-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-300/60 sm:mb-8"
    >
      Every Kiboar board can be flashed and remapped with{" "}
      <span className="font-medium text-lime-300">Kiboar Studio</span>
      <span aria-hidden="true">→</span>
    </a>
  );
}
