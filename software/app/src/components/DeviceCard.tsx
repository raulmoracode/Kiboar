import type { Device } from "../lib/bindings/Device";

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

export function DeviceCard({ device }: { device: Device }) {
  if (device.kind === "bootloader") {
    return (
      <article className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5">
        <header className="mb-4 flex items-center justify-between gap-3">
          <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-amber-300">
            Bootloader
          </span>
          <span className="font-mono text-xs text-zinc-500">
            {device.vid.toString(16).padStart(4, "0")}:{device.pid.toString(16).padStart(4, "0")}
          </span>
        </header>
        <h3 className="mb-1 text-lg font-semibold text-zinc-100">{FAMILY_LABEL[device.family]}</h3>
        <p className="mb-5 text-sm text-zinc-400">{device.product ?? "Unnamed bootloader"}</p>
        <div className="grid grid-cols-2 gap-4">
          <Fact label="Device" value={device.id} mono />
          <Fact label="Family" value={device.family} mono />
        </div>
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
            {device.vid.toString(16).padStart(4, "0")}:{device.pid.toString(16).padStart(4, "0")}
          </span>
        </header>
        <h3 className="mb-1 font-mono text-lg font-semibold text-zinc-100">{info.board_id}</h3>
        <p className="mb-5 text-sm text-zinc-400">{device.product ?? "Kiboar keyboard"}</p>
        <div className="grid grid-cols-2 gap-4">
          <Fact label="Hardware" value={`rev ${info.hw_rev}`} />
          <Fact label="Firmware" value={info.fw_version} mono />
          <Fact label="Protocol" value={`v${info.protocol_version}`} />
          <Fact label="Serial" value={`0x${info.serial.toString(16).padStart(8, "0")}`} mono />
          <Fact label="Matrix" value={`${info.matrix.rows} × ${info.matrix.cols}`} />
          <Fact label="Layers" value={info.layers} />
        </div>
        {info.split ? <p className="mt-4 text-xs text-emerald-200/70">Split keyboard</p> : null}
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
          {device.vid.toString(16).padStart(4, "0")}:{device.pid.toString(16).padStart(4, "0")}
        </span>
      </header>
      <h3 className="mb-1 text-lg font-semibold text-zinc-100">
        {device.product ?? "Unidentified device"}
      </h3>
      <p className="text-sm text-zinc-400">
        {device.reason ?? "The device did not answer the Kiboar board info report."}
      </p>
    </article>
  );
}
