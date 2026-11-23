import { AlertTriangle, ArrowRight, Check } from "lucide-react";
import type { ArtifactInspection } from "../lib/bindings/ArtifactInspection";
import type { BoardSummary } from "../lib/bindings/BoardSummary";
import type { FlashOutcome } from "../lib/bindings/FlashOutcome";
import type { FlashProgress } from "../lib/bindings/FlashProgress";
import { fileName } from "../lib/format";

type FlashStatus = "idle" | "confirming" | "flashing" | "done" | "error";

interface Props {
  ready: boolean;
  board: BoardSummary | null;
  artifact: ArtifactInspection | null;
  status: FlashStatus;
  progress: FlashProgress | null;
  outcome: FlashOutcome | null;
  error: string | null;
  cancelling: boolean;
  onFlash: () => void;
  onCancel: () => void;
  onReset: () => void;
}

export function FlashAction({
  ready,
  board,
  artifact,
  status,
  progress,
  outcome,
  error,
  cancelling,
  onFlash,
  onCancel,
  onReset,
}: Props) {
  const total = progress?.total_bytes ?? 0;
  const written = progress?.bytes_written ?? 0;
  const percent = total > 0 ? Math.min(100, Math.round((written / total) * 100)) : 0;

  return (
    <section aria-labelledby="flash-heading" className="mt-8">
      <h2 id="flash-heading" className="sr-only">
        Flash
      </h2>

      {status === "flashing" ? (
        <div>
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[11px] text-zinc-400">{percent}%</span>
            <button
              type="button"
              onClick={onCancel}
              disabled={cancelling}
              className="text-[10px] text-zinc-600 transition hover:text-rose-300 disabled:opacity-40"
            >
              {cancelling ? "Cancelling" : "Cancel"}
            </button>
          </div>
          <div
            role="progressbar"
            aria-label="Flash progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            className="mt-2 h-px w-full bg-white/10"
          >
            <div
              className="h-px bg-lime-300 transition-[width] duration-150"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      ) : null}

      {status === "done" && outcome ? (
        <div className="flex items-center gap-2">
          <Check size={14} className="shrink-0 text-lime-300" />
          <span className="text-xs text-zinc-300">Flashed</span>
          <span className="min-w-0 truncate font-mono text-[10px] text-zinc-600">
            {outcome.file_name}
          </span>
          <button
            type="button"
            onClick={onReset}
            className="ml-auto text-[10px] text-zinc-600 transition hover:text-zinc-200"
          >
            Again
          </button>
        </div>
      ) : null}

      {status === "error" ? (
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} className="shrink-0 text-rose-300" />
          <span className="min-w-0 flex-1 truncate text-xs text-rose-200/80">{error}</span>
          <button
            type="button"
            onClick={onReset}
            className="text-[10px] text-zinc-600 transition hover:text-zinc-200"
          >
            Retry
          </button>
        </div>
      ) : null}

      {status !== "flashing" && status !== "done" && status !== "error" ? (
        <div className="flex items-center justify-between gap-4">
          <p className="min-w-0 truncate font-mono text-[10px] text-zinc-600">
            {ready && board && artifact
              ? `${board.board_id} · ${fileName(artifact.path)}`
              : "Select a board and a .uf2"}
          </p>
          <button
            type="button"
            onClick={onFlash}
            disabled={!ready}
            className="flex shrink-0 items-center gap-2 rounded-md bg-lime-300 px-4 py-2 text-xs font-semibold text-lime-950 transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:bg-white/[0.04] disabled:text-zinc-600"
          >
            Flash
            <ArrowRight size={13} />
          </button>
        </div>
      ) : null}
    </section>
  );
}
