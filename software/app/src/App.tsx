import { useEffect, useState } from "react";
import { AddKeyboardDialog } from "./components/AddKeyboardDialog";
import { ConfirmFlashDialog } from "./components/ConfirmFlashDialog";
import { FirmwarePicker } from "./components/FirmwarePicker";
import { FlashAction } from "./components/FlashAction";
import { KeyboardGrid } from "./components/KeyboardGrid";
import { TopBar } from "./components/TopBar";
import type { BoardInfo } from "./lib/bindings/BoardInfo";
import { boardKey, useStudioStore } from "./store";

export default function App() {
  const devices = useStudioStore((state) => state.devices);
  const status = useStudioStore((state) => state.status);
  const scan = useStudioStore((state) => state.scan);

  const boards = useStudioStore((state) => state.boards);
  const boardsStatus = useStudioStore((state) => state.boardsStatus);
  const selectedBoard = useStudioStore((state) => state.selectedBoard);
  const loadBoards = useStudioStore((state) => state.loadBoards);
  const selectBoard = useStudioStore((state) => state.selectBoard);
  const customBoards = useStudioStore((state) => state.customBoards);
  const addCustomBoard = useStudioStore((state) => state.addCustomBoard);

  const volume = useStudioStore((state) => state.volume);
  const volumeStatus = useStudioStore((state) => state.volumeStatus);
  const detectVolume = useStudioStore((state) => state.detectVolume);
  const artifact = useStudioStore((state) => state.artifact);
  const artifactStatus = useStudioStore((state) => state.artifactStatus);
  const artifactError = useStudioStore((state) => state.artifactError);
  const chooseArtifact = useStudioStore((state) => state.chooseArtifact);
  const clearArtifact = useStudioStore((state) => state.clearArtifact);

  const flashStatus = useStudioStore((state) => state.flashStatus);
  const progress = useStudioStore((state) => state.progress);
  const outcome = useStudioStore((state) => state.outcome);
  const flashError = useStudioStore((state) => state.flashError);
  const cancelling = useStudioStore((state) => state.cancelling);
  const beginFlash = useStudioStore((state) => state.beginFlash);
  const cancelFlash = useStudioStore((state) => state.cancelFlash);
  const resetFlash = useStudioStore((state) => state.resetFlash);
  const cancelConfirmation = useStudioStore((state) => state.cancelConfirmation);
  const confirmFlash = useStudioStore((state) => state.confirmFlash);
  const subscribeToProgress = useStudioStore((state) => state.subscribeToProgress);

  const [addOpen, setAddOpen] = useState(false);

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

  const bootloader = devices.some((device) => device.kind === "bootloader");
  const statusLabel = volume
    ? volume.name
    : bootloader
      ? "RP2040"
      : volumeStatus === "loading"
        ? "Scanning"
        : "No device";
  const statusDetail = volume
    ? volume.path
    : bootloader
      ? "Volume not mounted"
      : volumeStatus === "error"
        ? "Could not read the bootloader volume"
        : "Connect a board in BOOTSEL mode";
  const statusDot = volume ? "bg-lime-300" : bootloader ? "bg-amber-300" : "bg-zinc-700";
  const ready = Boolean(volume && selectedBoard && artifact);

  const detected = new Map<string, BoardInfo>();
  for (const device of devices) {
    if (device.kind === "kiboar") {
      detected.set(`${device.info.board_id}@${device.info.hw_rev}`, device.info);
    }
  }

  const allBoards = [...customBoards, ...boards];
  const detectedOnly = [...detected.entries()]
    .filter(([key]) => !allBoards.some((board) => boardKey(board) === key))
    .map(([, info]) => ({
      board_id: info.board_id,
      name: info.board_id,
      hw_rev: info.hw_rev,
      mcu: "rp2040-zero",
      rows: info.matrix.rows,
      cols: info.matrix.cols,
      keys: 0,
      layers: info.layers,
      split: info.split,
    }));
  const gridBoards = [...detectedOnly, ...boards];

  return (
    <main className="min-h-screen bg-[#0a0b0d] text-zinc-200">
      <TopBar
        volume={volume}
        bootloader={bootloader}
        scanning={status === "loading"}
        onScan={() => {
          void scan();
          void detectVolume();
        }}
      />

      <div className="mx-auto w-full max-w-[640px] px-6 pb-10 pt-8">
        <section aria-labelledby="status-heading">
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-600">
            Device
          </p>
          <div className="mt-3 flex items-start gap-3">
            <span className={`mt-2 size-1.5 shrink-0 rounded-full ${statusDot}`} />
            <div className="min-w-0">
              <h1
                id="status-heading"
                className="flex items-center gap-2 text-2xl font-medium tracking-tight text-zinc-100"
              >
                <span className="truncate">{statusLabel}</span>
                {volume?.is_development ? (
                  <span className="rounded border border-amber-300/20 px-1.5 py-0.5 font-mono text-[9px] font-normal text-amber-200/60">
                    DEV
                  </span>
                ) : null}
              </h1>
              <p className="mt-1 truncate font-mono text-[11px] text-zinc-500">{statusDetail}</p>
            </div>
          </div>
        </section>

        <div className="my-6 h-px bg-white/[0.06]" />

        <KeyboardGrid
          boards={gridBoards}
          customBoards={customBoards}
          detected={detected}
          selected={selectedBoard}
          onSelect={selectBoard}
          onAdd={() => setAddOpen(true)}
        />

        {boardsStatus === "error" ? (
          <p className="mt-2 text-[10px] text-rose-300/80">
            Registry unavailable{" "}
            <button
              type="button"
              onClick={() => void loadBoards()}
              className="text-zinc-500 hover:text-zinc-200"
            >
              Retry
            </button>
          </p>
        ) : null}

        <div className="my-6 h-px bg-white/[0.06]" />

        <FirmwarePicker
          artifact={artifact}
          status={artifactStatus}
          error={artifactError}
          onChoose={() => void chooseArtifact()}
          onClear={clearArtifact}
        />

        <FlashAction
          ready={ready}
          board={selectedBoard}
          artifact={artifact}
          status={flashStatus}
          progress={progress}
          outcome={outcome}
          error={flashError}
          cancelling={cancelling}
          onFlash={beginFlash}
          onCancel={() => void cancelFlash()}
          onReset={resetFlash}
        />
      </div>

      <AddKeyboardDialog
        open={addOpen}
        existing={[...allBoards, ...detectedOnly].map(boardKey)}
        artifact={artifact}
        artifactStatus={artifactStatus}
        onChoose={() => void chooseArtifact()}
        onClose={() => setAddOpen(false)}
        onSave={(board) => {
          addCustomBoard(board, artifact);
          setAddOpen(false);
        }}
      />

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
