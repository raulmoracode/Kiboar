import { FileUp, Upload } from "lucide-react";
import type { ArtifactInspection } from "../lib/bindings/ArtifactInspection";
import { blockLabel, familyLabel, fileName, formatBytes, shortDigest } from "../lib/format";

interface Props {
  artifact: ArtifactInspection | null;
  status: "idle" | "loading" | "ready" | "error";
  error: string | null;
  onChoose: () => void;
  onClear: () => void;
}

export function FirmwarePicker({ artifact, status, error, onChoose, onClear }: Props) {
  return (
    <section aria-labelledby="firmware-heading">
      <div className="flex items-baseline justify-between">
        <h2
          id="firmware-heading"
          className="text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-600"
        >
          Firmware
        </h2>
        {artifact ? (
          <button
            type="button"
            onClick={onClear}
            className="text-[10px] text-zinc-600 transition hover:text-zinc-300"
          >
            Remove
          </button>
        ) : null}
      </div>

      {artifact ? (
        <button
          type="button"
          onClick={onChoose}
          className="mt-2 flex w-full items-center gap-3 rounded-md border border-white/[0.06] px-3 py-3 text-left transition hover:border-white/10"
        >
          <FileUp size={15} className="shrink-0 text-zinc-600" />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-mono text-[11px] text-zinc-300">
              {fileName(artifact.path)}
            </span>
            <span className="mt-0.5 block font-mono text-[10px] text-zinc-600">
              {familyLabel(artifact.family_id)} · {formatBytes(artifact.size_bytes)} ·{" "}
              {blockLabel(artifact.blocks)}
            </span>
          </span>
          <span className="shrink-0 font-mono text-[10px] text-zinc-600">
            {shortDigest(artifact.sha256)}
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={onChoose}
          disabled={status === "loading"}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-white/[0.08] py-5 text-[11px] text-zinc-600 transition hover:border-white/15 hover:text-zinc-400 disabled:opacity-40"
        >
          <Upload size={14} />
          {status === "loading" ? "Reading" : "Choose .uf2"}
        </button>
      )}

      {error ? <p className="mt-2 text-[10px] text-rose-300/80">{error}</p> : null}
    </section>
  );
}
