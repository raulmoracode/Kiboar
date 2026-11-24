import { AlertTriangle, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ArtifactInspection } from "../lib/bindings/ArtifactInspection";
import type { BoardSummary } from "../lib/bindings/BoardSummary";
import type { VolumeInfo } from "../lib/bindings/VolumeInfo";
import { fileName, shortDigest } from "../lib/format";

interface Props {
  open: boolean;
  board: BoardSummary | null;
  artifact: ArtifactInspection | null;
  volume: VolumeInfo | null;
  onCancel: () => void;
  onConfirm: (confirmation: string) => void;
}

export function ConfirmFlashDialog({ open, board, artifact, volume, onCancel, onConfirm }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [confirmation, setConfirmation] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (open && !dialog.open) {
      setConfirmation("");
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const ready = board !== null && artifact !== null && volume !== null;
  const canConfirm = ready && confirmation === board.board_id;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="confirm-title"
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      className="w-[min(420px,calc(100vw-2rem))] rounded-xl border border-white/10 bg-[var(--kiboar-surface)] p-0 text-zinc-200 backdrop:bg-black/70"
    >
      {ready ? (
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-600">
                Confirm
              </p>
              <h2 id="confirm-title" className="mt-2 text-lg font-medium text-zinc-100">
                Flash
              </h2>
            </div>
            <button
              type="button"
              onClick={onCancel}
              aria-label="Cancel"
              className="text-zinc-600 transition hover:text-zinc-200"
            >
              <X size={16} />
            </button>
          </div>

          <dl className="mt-6 grid gap-2.5 text-xs">
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-600">Board</dt>
              <dd className="text-right text-zinc-300">
                {board.name} <span className="text-zinc-600">rev {board.hw_rev}</span>
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-600">File</dt>
              <dd className="max-w-[65%] truncate font-mono text-[11px] text-zinc-400">
                {fileName(artifact.path)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-600">SHA</dt>
              <dd className="font-mono text-[10px] text-zinc-600">
                {shortDigest(artifact.sha256)}
              </dd>
            </div>
          </dl>

          <p className="mt-5 flex items-start gap-2 text-[11px] leading-relaxed text-amber-200/70">
            <AlertTriangle size={13} className="mt-0.5 shrink-0" />
            Unofficial firmware. A wrong board can damage it.
          </p>

          <p className="mt-2 font-mono text-[10px] text-zinc-600">
            → {volume.path}
            {volume.is_development ? " · directory" : ""}
          </p>

          <label htmlFor="confirmation" className="mt-5 block text-[11px] text-zinc-500">
            Type <span className="font-mono text-zinc-300">{board.board_id}</span> to confirm
            <input
              id="confirmation"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              autoFocus
              spellCheck={false}
              autoComplete="off"
              className="mt-2 w-full border-b border-white/10 bg-transparent pb-2 font-mono text-sm text-zinc-100 outline-none transition focus:border-lime-300"
            />
          </label>

          <div className="mt-6 flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="text-[11px] text-zinc-500 transition hover:text-zinc-200"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!canConfirm}
              onClick={() => onConfirm(confirmation)}
              className="rounded-md bg-lime-300 px-4 py-2 text-xs font-semibold text-lime-950 transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:bg-white/[0.04] disabled:text-zinc-600"
            >
              Flash
            </button>
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
