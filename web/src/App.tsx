import { useCallback, useEffect, useState } from "react";
import { productForKey } from "./data/products";
import { HomePage } from "./pages/HomePage";
import { KeyboardsPage } from "./pages/KeyboardsPage";
import { LibraryPage } from "./pages/LibraryPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { StudioPage } from "./pages/StudioPage";

function pathFromLocation(): string {
  return window.location.pathname.replace(/\/+$/, "") || "/";
}

export default function App() {
  const [path, setPath] = useState(pathFromLocation);

  useEffect(() => {
    function onPopState() {
      setPath(pathFromLocation());
      window.scrollTo({ top: 0, behavior: "instant" });
    }

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = useCallback((href: string) => {
    window.history.pushState({}, "", href);
    setPath(pathFromLocation());
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
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
      if (product.href === path) {
        navigate("/");
      } else if (product.internal) {
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
        <StudioPage onNavigate={navigate} />
      </main>
    );
  }

  if (path === "/library") {
    return (
      <main className="min-h-screen bg-[var(--kiboar-bg)] text-zinc-200">
        <LibraryPage onNavigate={navigate} />
      </main>
    );
  }

  if (path === "/keyboards") {
    return (
      <main className="min-h-screen bg-[var(--kiboar-bg)] text-zinc-200">
        <KeyboardsPage onNavigate={navigate} />
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
      <HomePage onNavigate={navigate} />
    </main>
  );
}
