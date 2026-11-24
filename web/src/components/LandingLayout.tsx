import { Keyboard } from "./Keyboard";
import { ProductLinks } from "./ProductLinks";

export function LandingLayout({
  title,
  word,
  keyboardLabel,
  onNavigate,
}: {
  title: string;
  word?: string;
  keyboardLabel: string;
  onNavigate: (href: string) => void;
}) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1180px] flex-col px-6 py-10 sm:px-10 sm:py-14">
      <h1 className="sr-only">{title}</h1>

      <div className="flex flex-1 items-center">
        <section aria-label={keyboardLabel} className="w-full">
          <Keyboard onNavigate={onNavigate} {...(word ? { word } : {})} />
        </section>
      </div>

      <ProductLinks onNavigate={onNavigate} />
    </div>
  );
}
