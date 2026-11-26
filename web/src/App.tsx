import { useCallback, useEffect, useRef, useState } from "react";
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
  const navigation = useRef(0);

  useEffect(() => {
    function onPopState() {
      setPath(pathFromLocation());
      window.scrollTo({ top: 0, behavior: "instant" });
    }

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const commit = useCallback((href: string) => {
    window.history.pushState({}, "", href);
    setPath(pathFromLocation());
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const navigate = useCallback(
    (href: string) => {
      const target = href.replace(/#.*$/, "").replace(/\/+$/, "") || "/";
      const leavingForHome = target === "/" && path !== "/" && window.scrollY > 0;

      if (!leavingForHome) {
        navigation.current += 1;
        commit(href);
        return;
      }

      // Swapping the route first clamps the scroll to the top in one frame.
      // Rewind the current page smoothly, then commit once it reaches the top.
      const id = ++navigation.current;
      const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
      const deadline = performance.now() + 800;

      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });

      function commitWhenAtTop() {
        if (navigation.current !== id) {
          return;
        }
        if (window.scrollY === 0 || performance.now() > deadline) {
          commit(href);
          return;
        }
        window.requestAnimationFrame(commitWhenAtTop);
      }

      window.requestAnimationFrame(commitWhenAtTop);
    },
    [commit, path],
  );

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
      <main className="kiboar-shell">
        <StudioPage onNavigate={navigate} />
      </main>
    );
  }

  if (path === "/library") {
    return (
      <main className="kiboar-shell">
        <LibraryPage onNavigate={navigate} />
      </main>
    );
  }

  if (path === "/keyboards") {
    return (
      <main className="kiboar-shell">
        <KeyboardsPage onNavigate={navigate} />
      </main>
    );
  }

  if (path !== "/") {
    return (
      <main className="kiboar-shell">
        <NotFoundPage onNavigate={navigate} />
      </main>
    );
  }

  return (
    <main className="kiboar-shell">
      <HomePage onNavigate={navigate} />
    </main>
  );
}
