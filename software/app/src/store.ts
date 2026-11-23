import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { open } from "@tauri-apps/plugin-dialog";
import { create } from "zustand";
import type { ArtifactInspection } from "./lib/bindings/ArtifactInspection";
import type { BoardSummary } from "./lib/bindings/BoardSummary";
import type { Device } from "./lib/bindings/Device";
import type { FlashOutcome } from "./lib/bindings/FlashOutcome";
import type { FlashProgress } from "./lib/bindings/FlashProgress";
import type { FlashRequest } from "./lib/bindings/FlashRequest";
import type { VolumeInfo } from "./lib/bindings/VolumeInfo";

export function boardKey(board: BoardSummary): string {
  return `${board.board_id}@${board.hw_rev}`;
}

type LoadStatus = "idle" | "loading" | "ready" | "error";
type FlashStatus = "idle" | "confirming" | "flashing" | "done" | "error";

interface StudioStore {
  status: LoadStatus;
  devices: Device[];
  error: string | null;
  scan: () => Promise<void>;

  boards: BoardSummary[];
  boardsStatus: LoadStatus;
  boardsError: string | null;
  selectedBoard: BoardSummary | null;
  loadBoards: () => Promise<void>;
  selectBoard: (board: BoardSummary) => void;

  customBoards: BoardSummary[];
  customArtifacts: Record<string, ArtifactInspection>;
  addCustomBoard: (board: BoardSummary, artifact: ArtifactInspection | null) => void;

  volume: VolumeInfo | null;
  volumeStatus: LoadStatus;
  volumeError: string | null;
  detectVolume: () => Promise<void>;

  artifact: ArtifactInspection | null;
  artifactStatus: LoadStatus;
  artifactError: string | null;
  chooseArtifact: () => Promise<void>;
  clearArtifact: () => void;

  flashStatus: FlashStatus;
  progress: FlashProgress | null;
  outcome: FlashOutcome | null;
  flashError: string | null;
  cancelling: boolean;
  beginFlash: () => void;
  cancelConfirmation: () => void;
  confirmFlash: (confirmation: string) => Promise<void>;
  cancelFlash: () => Promise<void>;
  resetFlash: () => void;
  subscribeToProgress: () => Promise<UnlistenFn>;
}

export const useStudioStore = create<StudioStore>((set, get) => ({
  status: "idle",
  devices: [],
  error: null,
  scan: async () => {
    set({ status: "loading", error: null });
    try {
      const devices = await invoke<Device[]>("list_devices");
      set({ devices, status: "ready" });
    } catch (error) {
      set({ devices: [], status: "error", error: String(error) });
    }
  },

  boards: [],
  boardsStatus: "idle",
  boardsError: null,
  selectedBoard: null,
  loadBoards: async () => {
    set({ boardsStatus: "loading", boardsError: null });
    try {
      const boards = await invoke<BoardSummary[]>("list_boards");
      set({ boards, boardsStatus: "ready" });
    } catch (error) {
      set({ boards: [], boardsStatus: "error", boardsError: String(error) });
    }
  },
  selectBoard: (board) =>
    set((state) => {
      const stored = state.customArtifacts[boardKey(board)];
      return stored
        ? { selectedBoard: board, artifact: stored, artifactStatus: "ready", artifactError: null }
        : { selectedBoard: board };
    }),

  customBoards: [],
  customArtifacts: {},
  addCustomBoard: (board, artifact) =>
    set((state) => {
      const key = boardKey(board);
      return {
        customBoards: [...state.customBoards.filter((entry) => boardKey(entry) !== key), board],
        customArtifacts: artifact
          ? { ...state.customArtifacts, [key]: artifact }
          : state.customArtifacts,
        selectedBoard: board,
        ...(artifact ? { artifact, artifactStatus: "ready" as const, artifactError: null } : {}),
      };
    }),

  volume: null,
  volumeStatus: "idle",
  volumeError: null,
  detectVolume: async () => {
    set({ volumeStatus: "loading", volumeError: null });
    try {
      const volume = await invoke<VolumeInfo | null>("detect_bootloader_volume");
      set({ volume, volumeStatus: "ready" });
    } catch (error) {
      set({ volume: null, volumeStatus: "error", volumeError: String(error) });
    }
  },

  artifact: null,
  artifactStatus: "idle",
  artifactError: null,
  chooseArtifact: async () => {
    const selected = await open({
      multiple: false,
      directory: false,
      filters: [{ name: "UF2 firmware", extensions: ["uf2"] }],
    });
    if (typeof selected !== "string") {
      return;
    }

    set({ artifactStatus: "loading", artifactError: null });
    try {
      const artifact = await invoke<ArtifactInspection>("inspect_artifact", {
        path: selected,
      });
      set({ artifact, artifactStatus: "ready", flashStatus: "idle" });
    } catch (error) {
      set({
        artifact: null,
        artifactStatus: "error",
        artifactError: String(error),
        flashStatus: "idle",
      });
    }
  },
  clearArtifact: () =>
    set((state) => {
      const customArtifacts = { ...state.customArtifacts };
      if (state.selectedBoard) {
        delete customArtifacts[boardKey(state.selectedBoard)];
      }
      return {
        artifact: null,
        artifactStatus: "idle",
        artifactError: null,
        flashStatus: "idle",
        outcome: null,
        progress: null,
        customArtifacts,
      };
    }),

  flashStatus: "idle",
  progress: null,
  outcome: null,
  flashError: null,
  cancelling: false,
  beginFlash: () => {
    const { selectedBoard, artifact, volume } = get();
    if (!selectedBoard || !artifact || !volume) {
      return;
    }
    set({ flashStatus: "confirming", flashError: null, outcome: null });
  },
  cancelConfirmation: () => set({ flashStatus: "idle" }),
  confirmFlash: async (confirmation) => {
    const { selectedBoard, artifact, volume } = get();
    if (!selectedBoard || !artifact || !volume) {
      return;
    }

    const request: FlashRequest = {
      board_id: selectedBoard.board_id,
      hw_rev: selectedBoard.hw_rev,
      mcu: selectedBoard.mcu,
      artifact_path: artifact.path,
      expected_sha256: artifact.sha256,
      confirmation,
    };

    set({
      flashStatus: "flashing",
      cancelling: false,
      progress: { bytes_written: 0, total_bytes: artifact.size_bytes },
      flashError: null,
      outcome: null,
    });

    try {
      const outcome = await invoke<FlashOutcome>("flash_firmware", { request });
      set({
        flashStatus: "done",
        outcome,
        progress: {
          bytes_written: outcome.bytes_written,
          total_bytes: artifact.size_bytes,
        },
      });
      void get().detectVolume();
      void get().scan();
    } catch (error) {
      const message = String(error);
      if (message.toLowerCase().includes("cancelled")) {
        set({
          flashStatus: "idle",
          cancelling: false,
          progress: null,
          flashError: null,
        });
      } else {
        set({ flashStatus: "error", cancelling: false, flashError: message });
      }
    }
  },
  cancelFlash: async () => {
    set({ cancelling: true });
    await invoke("cancel_flash");
  },
  resetFlash: () =>
    set({
      flashStatus: "idle",
      progress: null,
      outcome: null,
      flashError: null,
      cancelling: false,
    }),
  subscribeToProgress: () => {
    if (typeof window === "undefined" || !("__TAURI_INTERNALS__" in window)) {
      return Promise.resolve(() => {});
    }
    return listen<FlashProgress>("flash-progress", (event) => {
      set({ progress: event.payload });
    });
  },
}));
