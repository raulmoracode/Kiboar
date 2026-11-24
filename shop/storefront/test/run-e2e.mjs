import { spawn } from "node:child_process";

const server = spawn(
  "pnpm",
  ["exec", "vite", "preview", "--host", "127.0.0.1", "--port", "3101", "--strictPort"],
  { detached: true, stdio: "inherit", env: process.env },
);

async function waitForServer() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch("http://127.0.0.1:3101/");
      if (response.ok) {
        return;
      }
    } catch {
      // The preview server is not accepting connections yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error("The storefront preview did not start on port 3101.");
}

let code = 1;

try {
  await waitForServer();
  const tests = spawn("pnpm", ["exec", "playwright", "test"], {
    stdio: "inherit",
    env: process.env,
  });
  code = await new Promise((resolve) => {
    tests.on("exit", (exitCode, signal) => resolve(exitCode ?? (signal ? 1 : 0)));
  });
} finally {
  try {
    process.kill(-server.pid, "SIGTERM");
  } catch {
    server.kill("SIGTERM");
  }
}

process.exit(code);
