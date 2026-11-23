const links = [
  {
    label: "Documentation",
    href: "https://kiboar.raulmoracode.com/docs",
    description: "Install the library, see the components and the pinouts.",
  },
  {
    label: "Studio",
    href: "https://github.com/raulmoracode/Kiboar/releases/tag/studio-v0.1.0",
    description: "The unsigned macOS flasher for boards built with Kiboar.",
  },
  {
    label: "Source",
    href: "https://github.com/raulmoracode/Kiboar",
    description: "Symbols, footprints, models, tools and the desktop app.",
  },
];

export default function App() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-10 sm:py-16">
      <header className="flex items-baseline justify-between">
        <p className="text-sm font-semibold tracking-[0.2em] text-zinc-100 uppercase">Kiboar</p>
        <p className="font-mono text-[11px] text-zinc-600">web 0.1</p>
      </header>

      <section className="mt-20 sm:mt-28">
        <h1 className="max-w-2xl text-4xl leading-[1.1] font-medium tracking-tight text-zinc-100 sm:text-5xl">
          Keyboard components for people who build their own.
        </h1>
        <p className="mt-6 max-w-xl text-sm leading-relaxed text-zinc-500">
          A KiCad library, a documentation site and a flasher for boards built with Kiboar
          components. This site is the public entry point; the shop is coming.
        </p>
      </section>

      <section aria-labelledby="start-heading" className="mt-16">
        <h2
          id="start-heading"
          className="text-[10px] font-medium tracking-[0.22em] text-zinc-600 uppercase"
        >
          Start here
        </h2>
        <ul className="mt-4 divide-y divide-white/[0.06] border-y border-white/[0.06]">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                rel="noreferrer"
                className="group flex items-baseline justify-between gap-6 py-4 transition hover:bg-white/[0.02]"
              >
                <span>
                  <span className="block text-sm text-zinc-200 group-hover:text-lime-200">
                    {link.label}
                  </span>
                  <span className="mt-1 block text-xs text-zinc-600">{link.description}</span>
                </span>
                <span aria-hidden="true" className="text-zinc-700 group-hover:text-lime-300">
                  →
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <footer className="mt-auto pt-20 font-mono text-[10px] text-zinc-700">
        MIT · built with Vite, React and Tailwind
      </footer>
    </main>
  );
}
