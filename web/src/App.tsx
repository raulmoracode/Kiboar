import { useCallback, useEffect, useState } from "react";
import { KeyboardsPage } from "./KeyboardsPage";
import { LandingLayout } from "./LandingLayout";
import { LibraryPage } from "./LibraryPage";
import { NotFoundPage } from "./NotFoundPage";
import { productForKey } from "./products";
import { StudioPage } from "./StudioPage";

function pathFromLocation(): string {
  return window.location.pathname.replace(/\/+$/, "") || "/";
}

export default function App() {
  const [path, setPath] = useState(pathFromLocation);

  useEffect(() => {
    function onPopState() {
      setPath(pathFromLocation());
      window.scrollTo(0, 0);
    }

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = useCallback((href: string) => {
    window.history.pushState({}, "", href);
    setPath(pathFromLocation());
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (path !== "/") {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey || event.repeat) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (
        target?.isContentEditable ||
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT"
      ) {
        return;
      }

      const product = productForKey(event.key);
      if (!product) {
        return;
      }

      event.preventDefault();
      if (product.internal) {
        navigate(product.href);
      } else {
        window.open(product.href, "_blank", "noopener,noreferrer");
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [path, navigate]);

  if (path === "/studio") {
    return (
      <main className="min-h-screen bg-[var(--kiboar-bg)] text-zinc-200">
        <StudioPage onHome={() => navigate("/")} />
      </main>
    );
  }

  if (path === "/library") {
    return (
      <main className="min-h-screen bg-[var(--kiboar-bg)] text-zinc-200">
        <LibraryPage onHome={() => navigate("/")} />
      </main>
    );
  }

  if (path === "/keyboards") {
    return (
      <main className="min-h-screen bg-[var(--kiboar-bg)] text-zinc-200">
        <KeyboardsPage onHome={() => navigate("/")} />
      </main>
    );
  }

  if (path !== "/") {
    return (
      <main className="min-h-screen bg-[var(--kiboar-bg)] text-zinc-200">
        <NotFoundPage onNavigate={navigate} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--kiboar-bg)] text-zinc-200">
      <LandingLayout title="Kiboar" keyboardLabel="Kiboar 60% keyboard" onNavigate={navigate} />
    </main>
  );
}
