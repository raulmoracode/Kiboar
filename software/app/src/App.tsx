import { useEffect } from "react";
import { BoardCatalog } from "./components/BoardCatalog";
import { ConfirmFlashDialog } from "./components/ConfirmFlashDialog";
import { DeviceCard } from "./components/DeviceCard";
import { FirmwarePanel } from "./components/FirmwarePanel";
import { useStudioStore } from "./store";

export default function App() {
  const devices = useStudioStore((state) => state.devices);
  const status = useStudioStore((state) => state.status);
  const error = useStudioStore((state) => state.error);
  const scan = useStudioStore((state) => state.scan);

  const boards = useStudioStore((state) => state.boards);
  const boardsStatus = useStudioStore((state) => state.boardsStatus);
  const boardsError = useStudioStore((state) => state.boardsError);
  const selectedBoard = useStudioStore((state) => state.selectedBoard);
  const loadBoards = useStudioStore((state) => state.loadBoards);
  const selectBoard = useStudioStore((state) => state.selectBoard);

  const volume = useStudioStore((state) => state.volume);
  const detectVolume = useStudioStore((state) => state.detectVolume);
  const artifact = useStudioStore((state) => state.artifact);
  const flashStatus = useStudioStore((state) => state.flashStatus);
  const cancelConfirmation = useStudioStore((state) => state.cancelConfirmation);
  const confirmFlash = useStudioStore((state) => state.confirmFlash);
  const subscribeToProgress = useStudioStore((state) => state.subscribeToProgress);

  useEffect(() => {
    void scan();
    void loadBoards();
    void detectVolume();
  }, [scan, loadBoards, detectVolume]);

  useEffect(() => {
    const subscription = subscribeToProgress();
    return () => {
      void subscription.then((unlisten) => unlisten());
    };
  }, [subscribeToProgress]);

  const bootloaders = devices.filter((device) => device.kind === "bootloader").length;

  return (
    <main className="min-h-screen bg-[#0b0d10] px-6 py-8 text-zinc-200 sm:px-8 sm:py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
                Kiboar Studio
              </span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">
              Flash a Kiboar board
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400">
              Detect a board in BOOTSEL mode, check the firmware file and write it with an explicit
              confirmation. Nothing is written until you type the board id.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full border border-white/10 px-3 py-1.5 font-mono text-xs text-zinc-400">
              M2 · flasher
            </span>
            <button
              type="button"
              onClick={() => {
                void scan();
                void detectVolume();
              }}
              disabled={status === "loading"}
              className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "loading" ? "Scanning…" : "Scan again"}
            </button>
          </div>
        </header>

        {error ? (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-sm text-rose-200">
            <span className="font-medium">Scan failed.</span> {error}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr] xl:items-start">
          <div className="grid gap-6">
            <section aria-labelledby="connected-heading">
              <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                  <h2 id="connected-heading" className="text-lg font-semibold text-zinc-100">
                    Connected devices
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    Bootloaders and boards running Kiboar firmware.
                  </p>
                </div>
                <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-zinc-500">
                  {bootloaders} bootloader{bootloaders === 1 ? "" : "s"}
                </span>
              </div>

              {status === "loading" && devices.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-8 text-sm text-zinc-400">
                  Looking for USB devices…
                </div>
              ) : null}

              {status === "ready" && devices.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 px-5 py-8">
                  <p className="text-sm font-medium text-zinc-300">No device found.</p>
                  <p className="mt-1 max-w-md text-sm text-zinc-500">
                    Connect a board running Kiboar firmware, or hold BOOTSEL while plugging an
                    RP2040 board, then scan again.
                  </p>
                </div>
              ) : null}

              {devices.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                  {devices.map((device) => (
                    <DeviceCard key={device.id} device={device} />
                  ))}
                </div>
              ) : null}
            </section>

            <BoardCatalog
              boards={boards}
              status={boardsStatus}
              error={boardsError}
              selected={selectedBoard}
              onSelect={selectBoard}
            />
          </div>

          <FirmwarePanel />
        </div>

        <footer className="border-t border-white/10 pt-5 text-xs text-zinc-600">
          Custom UF2 only. Official signed firmware, post-flash verification, keymap and layout
          arrive in later slices.
        </footer>
      </div>

      <ConfirmFlashDialog
        open={flashStatus === "confirming"}
        board={selectedBoard}
        artifact={artifact}
        volume={volume}
        onCancel={cancelConfirmation}
        onConfirm={(confirmation) => void confirmFlash(confirmation)}
      />
    </main>
  );
}
