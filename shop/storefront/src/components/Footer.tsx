import { docs, keyboards, library, repository, site, studio } from "@kiboar/links";

const columns = [
  {
    title: "Shop",
    links: [
      { label: "Boards", href: "?" },
      { label: "Kiboar Studio", href: `${site}/studio` },
    ],
  },
  {
    title: "Build",
    links: [
      { label: "Documentation", href: docs },
      { label: "Library", href: library.source },
      { label: "Licence", href: library.notice },
    ],
  },
  {
    title: "Code",
    links: [
      { label: "GitHub", href: repository },
      { label: "Studio source", href: studio.source },
      { label: "Keyboard files", href: keyboards.readme },
    ],
  },
];

const linkClass =
  "text-[12px] text-zinc-400 transition-colors hover:text-lime-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-300/60";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-white/[0.08]">
      <div className="mx-auto w-full max-w-[1600px] px-6 pt-8 pb-10 sm:px-10">
        <nav aria-label="Footer" className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-10">
          {columns.map((column) => (
            <div key={column.title}>
              <h2 className="kiboar-eyebrow">{column.title}</h2>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className={linkClass}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <p className="mt-10 text-[11px] text-zinc-500">
          Kiboar <span aria-hidden="true">·</span> © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
