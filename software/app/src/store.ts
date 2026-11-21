import { invoke } from "@tauri-apps/api/core";
import { create } from "zustand";
import type { Device } from "./lib/bindings/Device";

type ScanStatus = "idle" | "scanning" | "ready" | "error";

interface DeviceStore {
  status: ScanStatus;
  devices: Device[];
  error: string | null;
  scan: () => Promise<void>;
}

export const useDeviceStore = create<DeviceStore>((set) => ({
  status: "idle",
  devices: [],
  error: null,
  scan: async () => {
    set({ status: "scanning", error: null });
    try {
      const devices = await invoke<Device[]>("list_devices");
      set({ devices, status: "ready" });
    } catch (error) {
      set({ devices: [], status: "error", error: String(error) });
    }
  },
}));
