import { useEffect } from "react";
import type { Device } from "./lib/bindings/Device";
import { useDeviceStore } from "./store";

const FAMILY_LABEL = {
  rp2040: "RP2040",
  stm32: "STM32",
  esp32_s3: "ESP32-S3",
} as const;

function Fact({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string | number;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </span>
      <span className={mono ? "font-mono text-sm text-zinc-200" : "text-sm text-zinc-200"}>
        {value}
      </span>
    </div>
  );
}

function DeviceCard({ device }: { device: Device }) {
  if (device.kind === "bootloader") {
    return (
      <article className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5">
        <header className="mb-4 flex items-center justify-between gap-3">
          <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-amber-300">
            Bootloader
          </span>
          <span className="font-mono text-xs text-zinc-500">
            {device.vid.toString(16).padStart(4, "0")}:
            {device.pid.toString(16).padStart(4, "0")}
          </span>
        </header>
        <h2 className="mb-1 text-lg font-semibold text-zinc-100">
          {FAMILY_LABEL[device.family]}
        </h2>
        <p className="mb-5 text-sm text-zinc-400">
          {device.product ?? "Unnamed bootloader"}
        </p>
        <div className="grid grid-cols-2 gap-4">
          <Fact label="Device" value={device.id} mono />
          <Fact label="Family" value={device.family} mono />
        </div>
        <p className="mt-5 border-t border-amber-500/15 pt-4 text-xs text-amber-200/70">
          Flashing arrives in M2. This screen only reads.
        </p>
      </article>
    );
  }

  if (device.kind === "kiboar") {
    const { info } = device;
    return (
      <article className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-5">
        <header className="mb-4 flex items-center justify-between gap-3">
          <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-emerald-300">
            Kiboar
          </span>
          <span className="font-mono text-xs text-zinc-500">
            {device.vid.toString(16).padStart(4, "0")}:
            {device.pid.toString(16).padStart(4, "0")}
          </span>
        </header>
        <h2 className="mb-1 font-mono text-lg font-semibold text-zinc-100">
          {info.board_id}
        </h2>
        <p className="mb-5 text-sm text-zinc-400">
          {device.product ?? "Kiboar keyboard"}
        </p>
        <div className="grid grid-cols-2 gap-4">
          <Fact label="Hardware" value={`rev ${info.hw_rev}`} />
          <Fact label="Firmware" value={info.fw_version} mono />
          <Fact label="Protocol" value={`v${info.protocol_version}`} />
          <Fact label="Serial" value={`0x${info.serial.toString(16).padStart(8, "0")}`} mono />
          <Fact label="Matrix" value={`${info.matrix.rows} × ${info.matrix.cols}`} />
          <Fact label="Layers" value={info.layers} />
        </div>
        {info.split ? (
          <p className="mt-4 text-xs text-emerald-200/70">Split keyboard</p>
        ) : null}
      </article>
    );
  }

  return (
    <article className="rounded-2xl border border-rose-500/25 bg-rose-500/5 p-5">
      <header className="mb-4 flex items-center justify-between gap-3">
        <span className="rounded-full border border-rose-400/30 bg-rose-400/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-rose-300">
          Unknown
        </span>
        <span className="font-mono text-xs text-zinc-500">
          {device.vid.toString(16).padStart(4, "0")}:
          {device.pid.toString(16).padStart(4, "0")}
        </span>
      </header>
      <h2 className="mb-1 text-lg font-semibold text-zinc-100">
        {device.product ?? "Unidentified device"}
      </h2>
      <p className="text-sm text-zinc-400">
        {device.reason ?? "The device did not answer the Kiboar board info report."}
      </p>
    </article>
  );
}

export default function App() {
  const { devices, error, scan, status } = useDeviceStore();

  useEffect(() => {
    void scan();
  }, [scan]);

  return (
    <main className="min-h-screen bg-[#0b0d10] px-8 py-10 text-zinc-200">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
                Kiboar Studio
              </span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-50">
              Connected boards
            </h1>
            <p className="mt-2 max-w-xl text-sm text-zinc-400">
              Read-only detection. The application looks for bootloaders and Kiboar
              firmware; it does not write anything in this milestone.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full border border-white/10 px-3 py-1.5 font-mono text-xs text-zinc-400">
              M1 · read-only
            </span>
            <button
              type="button"
              onClick={() => void scan()}
              disabled={status === "scanning"}
              className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "scanning" ? "Scanning…" : "Scan again"}
            </button>
          </div>
        </header>

        {error ? (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-5 py-4 text-sm text-rose-200">
            <span className="font-medium">Scan failed.</span> {error}
          </div>
        ) : null}

        {status === "scanning" && devices.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-10 text-center text-sm text-zinc-400">
            Looking for USB devices…
          </div>
        ) : null}

        {status === "ready" && devices.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 px-5 py-14 text-center">
            <p className="text-sm font-medium text-zinc-300">No Kiboar device found.</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
              Put a blank RP2040 in BOOTSEL mode, or connect a board running Kiboar
              firmware, and scan again.
            </p>
          </div>
        ) : null}

        {devices.length > 0 ? (
          <section className="grid gap-5 md:grid-cols-2">
            {devices.map((device) => (
              <DeviceCard key={device.id} device={device} />
            ))}
          </section>
        ) : null}

        <footer className="border-t border-white/10 pt-5 text-xs text-zinc-600">
          Detection only. Flashing, keymap and layout arrive in later milestones.
        </footer>
      </div>
    </main>
  );
}
