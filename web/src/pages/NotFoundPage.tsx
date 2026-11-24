import { useEffect } from "react";
import { LandingLayout } from "../components/LandingLayout";

export function NotFoundPage({ onNavigate }: { onNavigate: (href: string) => void }) {
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.append(meta);
    return () => meta.remove();
  }, []);

  return (
    <LandingLayout
      title="Not found"
      word="404"
      keyboardLabel="404 keyboard"
      onNavigate={onNavigate}
    />
  );
}
