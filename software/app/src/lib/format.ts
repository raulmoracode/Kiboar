export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KiB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MiB`;
}

export function fileName(path: string): string {
  return path.split(/[\\/]/).pop() ?? path;
}

export function shortDigest(sha256: string): string {
  return `${sha256.slice(0, 8)}…${sha256.slice(-4)}`;
}

export function familyLabel(familyId: number | null): string {
  if (familyId === 0xe48bff56) {
    return "RP2040";
  }
  if (familyId === null) {
    return "no family";
  }
  return `0x${familyId.toString(16).toUpperCase().padStart(8, "0")}`;
}

export function blockLabel(blocks: number): string {
  return `${blocks} ${blocks === 1 ? "block" : "blocks"}`;
}
