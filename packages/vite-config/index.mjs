import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export function kiboarViteConfig({ port, base = "/" } = {}) {
  if (!Number.isInteger(port)) {
    throw new Error("@kiboar/vite-config: pass the dev server port as an integer");
  }

  return {
    base,
    plugins: [react(), tailwindcss()],
    server: { port, strictPort: true },
    preview: { port, strictPort: true },
  };
}
