import type { PreviewOptions, ServerOptions, UserConfig } from "vite";

export function kiboarViteConfig(options: {
  port: number;
  base?: string;
  clearScreen?: boolean;
  server?: ServerOptions;
  preview?: PreviewOptions;
}): UserConfig;
