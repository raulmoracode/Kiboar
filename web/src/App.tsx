import { Keyboard } from "./Keyboard";

const products = [
  {
    name: "Shop",
    href: "/shop",
    line: "Buy one assembled.",
  },
  {
    name: "Keyboards",
    href: "https://github.com/raulmoracode/Kiboar/tree/main/keyboards",
    line: "The official board files.",
  },
  {
    name: "Library",
    href: "https://kiboar.raulmoracode.com/docs/install/pcm",
    line: "The official KiCad parts.",
  },
  {
    name: "Studio",
    href: "https://github.com/raulmoracode/Kiboar/releases/tag/studio-v0.1.0",
    line: "Flash and configure.",
  },
  {
    name: "Docs",
    href: "https://kiboar.raulmoracode.com/docs",
    line: "Install, build and flash.",
  },
];

export default function App() {
  return (
    <main className="min-h-screen bg-[#0a0b0d] text-zinc-200">
      <div className="mx-auto flex min-h-screen w-full max-w-[1180px] flex-col px-6 py-10 sm:px-10 sm:py-14">
        <h1 className="sr-only">Kiboar</h1>

        <div className="flex flex-1 items-center">
          <section aria-label="Kiboar 60% keyboard" className="w-full">
            <Keyboard />
          </section>
        </div>

        <section className="mt-auto grid gap-8 border-t border-white/[0.07] pt-1 sm:grid-cols-3 lg:grid-cols-5">
          {products.map((product) => (
            <a key={product.name} href={product.href} className="group py-6">
              <span className="block text-[13px] text-zinc-200 transition-colors group-hover:text-lime-200">
                {product.name}
              </span>
              <span className="mt-1 block text-[12px] leading-relaxed text-zinc-400">
                {product.line}
              </span>
            </a>
          ))}
        </section>
      </div>
    </main>
  );
}
