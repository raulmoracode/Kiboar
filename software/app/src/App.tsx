import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { AddKeyboardDialog } from "./components/AddKeyboardDialog";
import { ConfirmFlashDialog } from "./components/ConfirmFlashDialog";
import { FirmwarePicker } from "./components/FirmwarePicker";
import { FlashAction } from "./components/FlashAction";
import { KeyboardGrid } from "./components/KeyboardGrid";
import type { BoardInfo } from "./lib/bindings/BoardInfo";
import type { BoardSummary } from "./lib/bindings/BoardSummary";
import { boardKey, useStudioStore } from "./store";

export default function App() {
  const devices = useStudioStore((state) => state.devices);
  const scan = useStudioStore((state) => state.scan);

  const boards = useStudioStore((state) => state.boards);
  const boardsStatus = useStudioStore((state) => state.boardsStatus);
  const selectedBoard = useStudioStore((state) => state.selectedBoard);
  const loadBoards = useStudioStore((state) => state.loadBoards);
  const selectBoard = useStudioStore((state) => state.selectBoard);
  const customBoards = useStudioStore((state) => state.customBoards);
  const addCustomBoard = useStudioStore((state) => state.addCustomBoard);

  const volume = useStudioStore((state) => state.volume);
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
  const [openBoard, setOpenBoard] = useState<BoardSummary | null>(null);

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
  const openInfo = openBoard ? (detected.get(boardKey(openBoard)) ?? null) : null;
  const openLocal = openBoard
    ? customBoards.some((board) => boardKey(board) === boardKey(openBoard))
    : false;
  const ready = Boolean(volume && selectedBoard && artifact);
  const deviceLine = volume
    ? `${volume.name}${volume.is_development ? " · DEV" : ""}`
    : bootloader
      ? "Volume not mounted"
      : "No bootloader";

  return (
    <main className="min-h-screen bg-[#0a0b0d] text-zinc-200">
      {openBoard ? (
        <div className="mx-auto w-full max-w-[640px] px-6 py-6">
          <button
            type="button"
            onClick={() => {
              void scan();
              setOpenBoard(null);
            }}
            className="flex items-center gap-2 text-[11px] text-zinc-600 transition hover:text-zinc-200"
          >
            <ArrowLeft size={13} />
            Keyboards
          </button>

          <div className="mt-6 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-medium tracking-tight text-zinc-100">
                {openBoard.name}
              </h1>
              <p className="mt-1 truncate font-mono text-[11px] text-zinc-600">
                {openBoard.board_id} · rev {openBoard.hw_rev} · {deviceLine}
              </p>
            </div>
            <span className="shrink-0 text-[9px] uppercase tracking-[0.14em] text-zinc-600">
              {openInfo ? `fw ${openInfo.fw_version}` : openLocal ? "Local" : "Registry"}
            </span>
          </div>

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
      ) : (
        <div className="flex h-screen w-full flex-col p-6">
          <KeyboardGrid
            boards={gridBoards}
            customBoards={customBoards}
            detected={detected}
            selected={null}
            onSelect={(board) => {
              selectBoard(board);
              setOpenBoard(board);
            }}
            onAdd={() => setAddOpen(true)}
          />

          {boardsStatus === "error" ? (
            <p className="mt-3 text-[10px] text-rose-300/80">
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
        </div>
      )}

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
          setOpenBoard(board);
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
