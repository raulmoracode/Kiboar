import type { ReactNode } from "react";
import type { ArtifactInspection } from "../lib/bindings/ArtifactInspection";
import { useStudioStore } from "../store";

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KiB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MiB`;
}

function shortDigest(sha256: string): string {
  return `${sha256.slice(0, 12)}…${sha256.slice(-8)}`;
}

function fileName(path: string): string {
  return path.split(/[\\/]/).pop() ?? path;
}

function Step({
  number,
  title,
  done = false,
  children,
}: {
  number: number;
  title: string;
  done?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-2.5">
        <span
          className={`flex size-6 items-center justify-center rounded-full text-xs font-semibold ${
            done ? "bg-emerald-400 text-emerald-950" : "bg-white/10 text-zinc-400"
          }`}
        >
          {done ? "✓" : number}
        </span>
        <h3 className="text-sm font-medium text-zinc-200">{title}</h3>
      </div>
      <div className="pl-8">{children}</div>
    </div>
  );
}

function ArtifactCard({ artifact }: { artifact: ArtifactInspection }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-mono text-sm text-zinc-200">{fileName(artifact.path)}</p>
          <p className="mt-1 text-xs text-zinc-500">
            {formatBytes(artifact.size_bytes)} · {artifact.blocks} blocks ·{" "}
            {formatBytes(artifact.payload_bytes)} payload
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 font-mono text-[11px] text-zinc-400">
          {artifact.family_id === null
            ? "no family"
            : `0x${artifact.family_id.toString(16).toUpperCase().padStart(8, "0")}`}
        </span>
      </div>
      <p className="mt-3 break-all font-mono text-[11px] leading-relaxed text-zinc-500">
        {shortDigest(artifact.sha256)}
      </p>
    </div>
  );
}

export function FirmwarePanel() {
  const volume = useStudioStore((state) => state.volume);
  const volumeStatus = useStudioStore((state) => state.volumeStatus);
  const volumeError = useStudioStore((state) => state.volumeError);
  const detectVolume = useStudioStore((state) => state.detectVolume);
  const scan = useStudioStore((state) => state.scan);

  const artifact = useStudioStore((state) => state.artifact);
  const artifactStatus = useStudioStore((state) => state.artifactStatus);
  const artifactError = useStudioStore((state) => state.artifactError);
  const chooseArtifact = useStudioStore((state) => state.chooseArtifact);
  const clearArtifact = useStudioStore((state) => state.clearArtifact);

  const selectedBoard = useStudioStore((state) => state.selectedBoard);
  const flashStatus = useStudioStore((state) => state.flashStatus);
  const progress = useStudioStore((state) => state.progress);
  const outcome = useStudioStore((state) => state.outcome);
  const flashError = useStudioStore((state) => state.flashError);
  const cancelling = useStudioStore((state) => state.cancelling);
  const beginFlash = useStudioStore((state) => state.beginFlash);
  const cancelFlash = useStudioStore((state) => state.cancelFlash);
  const resetFlash = useStudioStore((state) => state.resetFlash);

  const ready = Boolean(volume && selectedBoard && artifact);
  const flashing = flashStatus === "flashing";
  const total = progress?.total_bytes ?? 0;
  const written = progress?.bytes_written ?? 0;
  const percent = total > 0 ? Math.min(100, Math.round((written / total) * 100)) : 0;

  return (
    <section
      aria-labelledby="flash-heading"
      className="rounded-2xl border border-white/10 bg-white/[0.02]"
    >
      <header className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
        <div>
          <h2 id="flash-heading" className="text-lg font-semibold text-zinc-100">
            Flash firmware
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Verify the target, then write a UF2 to the bootloader volume.
          </p>
        </div>
        <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-zinc-500">
          RP2040
        </span>
      </header>

      <div className="grid gap-6 p-5">
        <Step number={1} title="Bootloader" done={volume !== null}>
          {volumeStatus === "loading" ? (
            <p className="text-sm text-zinc-400">Looking for a mounted bootloader…</p>
          ) : null}

          {volume ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-emerald-200">Bootloader mounted</p>
                {volume.is_development ? (
                  <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-amber-300">
                    Development
                  </span>
                ) : null}
              </div>
              <p className="mt-1 break-all font-mono text-xs text-emerald-100/70">{volume.path}</p>
              {volume.is_development ? (
                <p className="mt-2 text-xs text-amber-200/80">
                  Writes go to this directory, not to a board. Release builds ignore the override.
                </p>
              ) : null}
            </div>
          ) : null}

          {volumeStatus === "ready" && !volume ? (
            <div className="rounded-xl border border-dashed border-white/15 px-4 py-4">
              <p className="text-sm text-zinc-300">No RP2040 bootloader volume.</p>
              <p className="mt-1 text-sm text-zinc-500">
                Hold BOOTSEL while plugging the board, then detect again.
              </p>
              <button
                type="button"
                onClick={() => {
                  void detectVolume();
                  void scan();
                }}
                className="mt-3 rounded-full border border-white/15 px-3.5 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-white/5"
              >
                Detect again
              </button>

              <details className="mt-4 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs text-zinc-400">
                <summary className="cursor-pointer text-zinc-300">
                  No hardware? Preview against a directory
                </summary>
                <pre className="mt-3 overflow-x-auto text-[11px] leading-relaxed text-zinc-400">
                  {`mkdir -p /tmp/RPI-RP2
KIBOAR_FLASH_VOLUME=/tmp/RPI-RP2 \\
  pnpm --filter @kiboar/studio tauri dev`}
                </pre>
                <p className="mt-2">
                  Start the application with the variable set. It is ignored in release builds.
                </p>
              </details>
            </div>
          ) : null}

          {volumeError ? <p className="mt-2 text-sm text-rose-300">{volumeError}</p> : null}
        </Step>

        <Step number={2} title="Firmware file" done={artifact !== null}>
          {artifact ? <ArtifactCard artifact={artifact} /> : null}

          {artifactError ? (
            <p className="mt-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {artifactError}
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void chooseArtifact()}
              disabled={artifactStatus === "loading" || flashing}
              className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {artifactStatus === "loading"
                ? "Reading…"
                : artifact
                  ? "Choose another UF2"
                  : "Choose UF2 file"}
            </button>
            {artifact ? (
              <button
                type="button"
                onClick={clearArtifact}
                disabled={flashing}
                className="rounded-full border border-white/15 px-3.5 py-2 text-sm text-zinc-400 transition hover:bg-white/5 disabled:opacity-40"
              >
                Remove
              </button>
            ) : null}
          </div>

          <p className="mt-2 text-xs text-zinc-500">
            The registry has no official firmware yet, so this file is treated as unofficial.
          </p>
        </Step>

        <Step number={3} title="Review and write" done={flashStatus === "done"}>
          {flashing ? (
            <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-medium text-emerald-200">
                  {cancelling ? "Cancelling…" : "Writing firmware…"}
                </p>
                <p className="font-mono text-xs text-emerald-200/70">{percent}%</p>
              </div>
              <div
                role="progressbar"
                aria-label="Flash progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent}
                className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"
              >
                <div
                  className="h-full bg-emerald-400 transition-[width] duration-150"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="mt-2 font-mono text-xs text-zinc-500">
                {formatBytes(written)} / {formatBytes(total)}
              </p>
              <button
                type="button"
                onClick={() => void cancelFlash()}
                disabled={cancelling}
                className="mt-3 rounded-full border border-rose-400/30 px-3.5 py-1.5 text-xs font-medium text-rose-200 transition hover:bg-rose-500/10 disabled:opacity-40"
              >
                {cancelling ? "Cancelling…" : "Cancel write"}
              </button>
            </div>
          ) : null}

          {flashStatus === "done" && outcome ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <p className="text-sm font-medium text-emerald-200">Firmware written</p>
              <p className="mt-1 break-all font-mono text-xs text-emerald-100/70">
                {outcome.volume_path}/{outcome.file_name}
              </p>
              <p className="mt-2 text-xs text-zinc-400">
                The bootloader flashes the file and reboots. Reconnect the board and scan again to
                confirm it enumerates as Kiboar.
              </p>
              <button
                type="button"
                onClick={resetFlash}
                className="mt-3 rounded-full border border-white/15 px-3.5 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-white/5"
              >
                Flash another
              </button>
            </div>
          ) : null}

          {flashStatus === "error" ? (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
              <p className="text-sm font-medium text-rose-200">The write did not complete.</p>
              <p className="mt-1 text-sm text-rose-100/80">{flashError}</p>
              <button
                type="button"
                onClick={resetFlash}
                className="mt-3 rounded-full border border-white/15 px-3.5 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-white/5"
              >
                Try again
              </button>
            </div>
          ) : null}

          {flashStatus !== "flashing" && flashStatus !== "done" && flashStatus !== "error" ? (
            <div className="grid gap-4">
              <dl className="grid gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-zinc-500">Board</dt>
                  <dd className="text-right text-zinc-200">
                    {selectedBoard ? selectedBoard.name : "Not selected"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-zinc-500">Revision</dt>
                  <dd className="font-mono text-zinc-300">
                    {selectedBoard ? `rev ${selectedBoard.hw_rev}` : "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-zinc-500">Firmware</dt>
                  <dd className="max-w-[60%] break-all text-right font-mono text-xs text-zinc-300">
                    {artifact ? fileName(artifact.path) : "Not selected"}
                  </dd>
                </div>
              </dl>

              <button
                type="button"
                onClick={beginFlash}
                disabled={!ready}
                className="w-full rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Flash firmware
              </button>

              <p className="text-xs text-zinc-500">
                {ready
                  ? "You will review the target and type the board id before anything is written."
                  : "A board, a UF2 file and a bootloader volume are required."}
              </p>
            </div>
          ) : null}
        </Step>
      </div>
    </section>
  );
}
