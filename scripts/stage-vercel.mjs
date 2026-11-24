import { cp, mkdir, rm, stat } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const output = join(root, "dist", "vercel");
const web = join(root, "web", "dist");
const docs = join(root, "docs", "dist");

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function copy(from, to) {
  if (!(await exists(from))) {
    throw new Error(`missing build output: ${from}`);
  }
  await cp(from, to, { recursive: true });
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

// web owns the root and its client routes.
await copy(web, output);
// docs keeps its /docs and /es/docs paths; its absolute assets move to the root.
await copy(join(docs, "docs"), join(output, "docs"));
await copy(join(docs, "es", "docs"), join(output, "es", "docs"));
await copy(join(docs, "_astro"), join(output, "_astro"));
await copy(join(docs, "footprints"), join(output, "footprints"));
await copy(join(docs, "api"), join(output, "api"));
await copy(join(docs, "favicon.svg"), join(output, "favicon.svg"));

if (await exists(join(docs, "404.html"))) {
  await copy(join(docs, "404.html"), join(output, "404.html"));
}

console.log(`staged ${output}`);
