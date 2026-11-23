import { RefreshCw } from "lucide-react";
import type { VolumeInfo } from "../lib/bindings/VolumeInfo";

interface Props {
  volume: VolumeInfo | null;
  bootloader: boolean;
  scanning: boolean;
  onScan: () => void;
}

export function TopBar({ volume, bootloader, scanning, onScan }: Props) {
  const label = volume ? volume.name : bootloader ? "RP2040" : "No device";
  const dot = volume ? "bg-lime-300" : bootloader ? "bg-amber-300" : "bg-zinc-700";

  return (
    <header className="flex h-14 items-center justify-between border-b border-white/[0.06] px-6">
      <div className="flex items-center gap-2.5">
        <span className="size-1.5 rounded-full bg-lime-300" />
        <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-zinc-400">
          Kiboar
        </span>
      </div>

      <div className="flex items-center gap-4">
        <span className="flex items-center gap-2 text-[11px] text-zinc-500">
          <span className={`size-1.5 rounded-full ${dot}`} />
          {label}
        </span>
        <button
          type="button"
          onClick={onScan}
          disabled={scanning}
          aria-label="Scan for devices"
          className="text-zinc-600 transition hover:text-zinc-200 disabled:opacity-40"
        >
          <RefreshCw size={14} className={scanning ? "animate-spin" : undefined} />
        </button>
      </div>
    </header>
  );
}
