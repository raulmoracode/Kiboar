import { Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ArtifactInspection } from "../lib/bindings/ArtifactInspection";
import type { BoardSummary } from "../lib/bindings/BoardSummary";
import { fileName, formatBytes } from "../lib/format";

interface Props {
  open: boolean;
  existing: string[];
  artifact: ArtifactInspection | null;
  artifactStatus: "idle" | "loading" | "ready" | "error";
  onChoose: () => void;
  onClose: () => void;
  onSave: (board: BoardSummary) => void;
}

const BOARD_ID = /^[a-z0-9][a-z0-9-]{1,31}$/;

export function AddKeyboardDialog({
  open,
  existing,
  artifact,
  artifactStatus,
  onChoose,
  onClose,
  onSave,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState("");
  const [boardId, setBoardId] = useState("");
  const [revision, setRevision] = useState("1");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (open && !dialog.open) {
      setName("");
      setBoardId("");
      setRevision("1");
      setError(null);
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  function submit() {
    const trimmedName = name.trim();
    const trimmedId = boardId.trim();
    const rev = Number.parseInt(revision, 10);

    if (!trimmedName) {
      setError("Name is required");
      return;
    }
    if (!BOARD_ID.test(trimmedId)) {
      setError("Use 2–32 lowercase letters, digits or dashes");
      return;
    }
    if (!Number.isInteger(rev) || rev < 1 || rev > 99) {
      setError("Revision must be between 1 and 99");
      return;
    }
    if (existing.includes(`${trimmedId}@${rev}`)) {
      setError("That board and revision already exist");
      return;
    }
    if (!artifact) {
      setError("Choose a .uf2 file");
      return;
    }

    onSave({
      board_id: trimmedId,
      name: trimmedName,
      hw_rev: rev,
      mcu: "rp2040-zero",
      rows: 0,
      cols: 0,
      keys: 0,
      layers: 1,
      split: false,
      layout: [],
    });
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="add-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className="w-[min(420px,calc(100vw-2rem))] rounded-xl border border-white/10 bg-[var(--kiboar-surface)] p-0 text-zinc-200 backdrop:bg-black/70"
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-600">New</p>
            <h2 id="add-title" className="mt-2 text-lg font-medium text-zinc-100">
              Add keyboard
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-zinc-600 transition hover:text-zinc-200"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-6 grid gap-4">
          <label className="block text-[11px] text-zinc-500" htmlFor="board-name">
            Name
            <input
              id="board-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoFocus
              className="mt-1.5 w-full border-b border-white/10 bg-transparent pb-2 text-sm text-zinc-100 outline-none transition focus:border-lime-300"
            />
          </label>

          <label className="block text-[11px] text-zinc-500" htmlFor="board-id">
            Board id
            <input
              id="board-id"
              value={boardId}
              onChange={(event) => setBoardId(event.target.value)}
              spellCheck={false}
              autoComplete="off"
              className="mt-1.5 w-full border-b border-white/10 bg-transparent pb-2 font-mono text-sm text-zinc-100 outline-none transition focus:border-lime-300"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block text-[11px] text-zinc-500" htmlFor="board-rev">
              Revision
              <input
                id="board-rev"
                type="number"
                min={1}
                max={99}
                value={revision}
                onChange={(event) => setRevision(event.target.value)}
                className="mt-1.5 w-full border-b border-white/10 bg-transparent pb-2 font-mono text-sm text-zinc-100 outline-none transition focus:border-lime-300"
              />
            </label>
            <div className="text-[11px] text-zinc-500">
              MCU
              <p className="mt-2 border-b border-white/5 pb-2 font-mono text-sm text-zinc-500">
                RP2040
              </p>
            </div>
          </div>

          <div className="text-[11px] text-zinc-500">
            Firmware
            <button
              type="button"
              onClick={onChoose}
              disabled={artifactStatus === "loading"}
              className="mt-1.5 flex w-full items-center gap-2 border-b border-white/10 pb-2 text-left text-zinc-300 transition hover:border-white/20 disabled:opacity-40"
            >
              <Upload size={13} className="shrink-0 text-zinc-600" />
              <span className="min-w-0 flex-1 truncate font-mono text-[11px]">
                {artifact ? fileName(artifact.path) : "Choose .uf2"}
              </span>
              {artifact ? (
                <span className="shrink-0 font-mono text-[10px] text-zinc-600">
                  {formatBytes(artifact.size_bytes)}
                </span>
              ) : null}
            </button>
          </div>
        </div>

        {error ? <p className="mt-4 text-[11px] text-rose-300/80">{error}</p> : null}

        <p className="mt-5 text-[10px] text-zinc-600">Local to this session.</p>

        <div className="mt-4 flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="text-[11px] text-zinc-500 transition hover:text-zinc-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            className="rounded-md bg-lime-300 px-4 py-2 text-xs font-semibold text-lime-950 transition hover:bg-lime-200"
          >
            Add
          </button>
        </div>
      </div>
    </dialog>
  );
}
