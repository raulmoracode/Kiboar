import { useEffect, useRef, useState } from "react";
import type { ArtifactInspection } from "../lib/bindings/ArtifactInspection";
import type { BoardSummary } from "../lib/bindings/BoardSummary";
import type { VolumeInfo } from "../lib/bindings/VolumeInfo";

interface Props {
  open: boolean;
  board: BoardSummary | null;
  artifact: ArtifactInspection | null;
  volume: VolumeInfo | null;
  onCancel: () => void;
  onConfirm: (confirmation: string) => void;
}

function fileName(path: string): string {
  return path.split(/[\\/]/).pop() ?? path;
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
      className="w-[min(36rem,calc(100vw-2rem))] rounded-2xl border border-white/10 bg-[#0f1216] p-0 text-zinc-200 backdrop:bg-black/70"
    >
      {ready ? (
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
                {volume.is_development ? "Development volume" : "Bootloader mounted"}
              </p>
              <h2 id="confirm-title" className="mt-2 text-xl font-semibold text-zinc-50">
                Confirm flash
              </h2>
            </div>
            <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-amber-300">
              Unofficial · unverified
            </span>
          </div>

          <dl className="mt-5 grid gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">Board</dt>
              <dd className="text-right font-medium text-zinc-100">{board.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">Board id</dt>
              <dd className="font-mono text-zinc-300">
                {board.board_id} · rev {board.hw_rev}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">MCU</dt>
              <dd className="font-mono text-zinc-300">{board.mcu}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">Firmware</dt>
              <dd className="max-w-[60%] break-all text-right font-mono text-zinc-300">
                {fileName(artifact.path)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">SHA-256</dt>
              <dd className="max-w-[70%] break-all text-right font-mono text-xs text-zinc-400">
                {artifact.sha256}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">Volume</dt>
              <dd className="max-w-[70%] break-all text-right font-mono text-xs text-zinc-400">
                {volume.path}
              </dd>
            </div>
          </dl>

          <p className="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-sm text-amber-100/90">
            This file does not declare compatibility with this board. A wrong pin mapping can damage
            the keyboard, and it may stop being recognised afterwards.
          </p>

          {volume.is_development ? (
            <p className="mt-3 text-xs text-zinc-500">
              Development volume: the bytes are written to this directory, not to a board.
            </p>
          ) : null}

          <label className="mt-5 block text-sm" htmlFor="confirmation">
            Type <span className="font-mono text-zinc-200">{board.board_id}</span> to confirm
            <input
              id="confirmation"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              autoFocus
              spellCheck={false}
              autoComplete="off"
              className="mt-2 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 font-mono text-sm text-zinc-100 outline-none focus:border-emerald-400/60"
            />
          </label>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border border-white/15 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!canConfirm}
              onClick={() => onConfirm(confirmation)}
              className="rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Flash firmware
            </button>
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
