import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export function kiboarViteConfig({
  port,
  base = "/",
  clearScreen,
  server = {},
  preview = {},
} = {}) {
  if (!Number.isInteger(port)) {
    throw new Error("@kiboar/vite-config: pass the dev server port as an integer");
  }

  const config = {
    base,
    plugins: [react(), tailwindcss()],
    server: { port, strictPort: true, ...server },
    preview: { port, strictPort: true, ...preview },
  };

  if (typeof clearScreen === "boolean") {
    config.clearScreen = clearScreen;
  }

  return config;
}
