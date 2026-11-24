import { readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../dist", import.meta.url));
const port = 4326;

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
};

createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const clean = url.pathname.replace(/^\/+/, "");
  const file = join(root, clean);

  try {
    if (clean && (await stat(file)).isFile()) {
      res.writeHead(200, { "content-type": types[extname(file)] ?? "application/octet-stream" });
      res.end(await readFile(file));
      return;
    }
  } catch {
    // fall through to the SPA shell
  }

  res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  res.end(await readFile(join(root, "index.html")));
}).listen(port, "127.0.0.1", () => console.log(`web on http://127.0.0.1:${port}`));
