import { LandingLayout } from "../components/LandingLayout";

export function HomePage({ onNavigate }: { onNavigate: (href: string) => void }) {
  return (
    <LandingLayout title="Kiboar" keyboardLabel="Kiboar 60% keyboard" onNavigate={onNavigate} />
  );
}
