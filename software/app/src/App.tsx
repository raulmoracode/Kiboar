import { useEffect } from "react";
import { BoardPicker } from "./components/BoardPicker";
import { ConfirmFlashDialog } from "./components/ConfirmFlashDialog";
import { FirmwarePicker } from "./components/FirmwarePicker";
import { FlashAction } from "./components/FlashAction";
import { TopBar } from "./components/TopBar";
import type { Device } from "./lib/bindings/Device";
import { useStudioStore } from "./store";

function deviceLabel(device: Device): string {
  if (device.kind === "kiboar") {
    return device.info.board_id;
  }
  if (device.kind === "bootloader") {
    return "RP2040 bootloader";
  }
  return "Unknown";
}

export default function App() {
  const devices = useStudioStore((state) => state.devices);
  const status = useStudioStore((state) => state.status);
  const scan = useStudioStore((state) => state.scan);

  const boards = useStudioStore((state) => state.boards);
  const boardsStatus = useStudioStore((state) => state.boardsStatus);
  const boardsError = useStudioStore((state) => state.boardsError);
  const selectedBoard = useStudioStore((state) => state.selectedBoard);
  const loadBoards = useStudioStore((state) => state.loadBoards);
  const selectBoard = useStudioStore((state) => state.selectBoard);

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

          {devices.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 pl-[18px]">
              {devices.map((device) => (
                <span
                  key={device.id}
                  className="flex items-center gap-1.5 text-[10px] text-zinc-600"
                >
                  <span
                    className={`size-1 rounded-full ${
                      device.kind === "kiboar"
                        ? "bg-lime-300/70"
                        : device.kind === "bootloader"
                          ? "bg-amber-300/70"
                          : "bg-zinc-700"
                    }`}
                  />
                  <span className="font-mono">{deviceLabel(device)}</span>
                </span>
              ))}
            </div>
          ) : null}
        </section>

        <div className="my-6 h-px bg-white/[0.06]" />

        <BoardPicker
          boards={boards}
          status={boardsStatus}
          error={boardsError}
          selected={selectedBoard}
          onSelect={selectBoard}
          onRetry={() => void loadBoards()}
        />

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
