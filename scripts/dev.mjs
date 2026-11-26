#!/usr/bin/env node
import { spawn, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import net from "node:net";
import { dirname, join } from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(root);

const colored = process.stdout.isTTY;
const paint = (code, text) => (colored ? `\x1b[${code}m${text}\x1b[0m` : text);
const green = (text) => paint("32", text);
const red = (text) => paint("31", text);
const dim = (text) => paint("2", text);
const bold = (text) => paint("1", text);
const cyan = (text) => paint("36", text);

const DEFINITIONS = {
  web: {
    label: "web",
    args: ["--filter", "@kiboar/web", "dev"],
    port: 3000,
    url: "http://localhost:3000/",
    ansi: "36",
  },
  docs: {
    label: "docs",
    args: ["--filter", "kiboar-docs", "exec", "astro", "dev", "--ignore-lock"],
    port: 4321,
    url: "http://localhost:4321/",
    ansi: "35",
  },
  medusa: {
    label: "medusa js",
    args: ["--filter", "@kiboar/shop", "dev"],
    port: 9000,
    url: "http://localhost:9000/",
    ansi: "33",
    timeout: 120_000,
    needsDb: true,
  },
  storefront: {
    label: "storefront",
    args: ["--filter", "@kiboar/storefront", "dev"],
    port: 3001,
    url: "http://localhost:3001/",
    ansi: "34",
    needsMedusa: true,
  },
  pos: {
    label: "pos",
    args: ["--filter", "@kiboar/pos", "web"],
    port: 8081,
    url: "http://localhost:8081/",
    ansi: "32",
    env: { BROWSER: "none" },
    needsMedusa: true,
  },
};

const GROUPS = {
  all: ["web", "docs", "medusa", "storefront", "pos"],
  shop: ["medusa", "storefront", "pos"],
  api: ["medusa"],
  storefront: ["medusa", "storefront"],
  pos: ["medusa", "pos"],
  web: ["web"],
  docs: ["docs"],
};

const children = new Map();
const startedContainers = [];
let usedCompose = false;
let databasePort = 5432;
let stopping = false;

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function docker(args, options = {}) {
  return spawnSync("docker", args, { cwd: root, encoding: "utf8", ...options });
}

function commandExists(command) {
  return spawnSync("which", [command], { stdio: "ignore" }).status === 0;
}

function connect(host, port) {
  return new Promise((resolve) => {
    const socket = net.connect({ host, port });
    let settled = false;
    const done = (open) => {
      if (settled) {
        return;
      }
      settled = true;
      socket.destroy();
      resolve(open);
    };
    socket.setTimeout(600);
    socket.once("connect", () => done(true));
    socket.once("timeout", () => done(false));
    socket.once("error", () => done(false));
  });
}

async function portOpen(port) {
  const [ipv4, ipv6] = await Promise.all([connect("127.0.0.1", port), connect("::1", port)]);
  return ipv4 || ipv6;
}

async function waitForPort(port, timeout) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await portOpen(port)) {
      return true;
    }
    await sleep(500);
  }
  return false;
}

function resolveGroup(name) {
  const group = GROUPS[name];
  if (!group) {
    throw new Error(`Unknown group "${name}". Use one of: ${Object.keys(GROUPS).join(", ")}.`);
  }

  const selected = new Set(group);
  let changed = true;
  while (changed) {
    changed = false;
    for (const key of [...selected]) {
      const definition = DEFINITIONS[key];
      if (definition?.needsDb && !selected.has("db")) {
        selected.add("db");
        changed = true;
      }
      if (definition?.needsMedusa && !selected.has("medusa")) {
        selected.add("medusa");
        changed = true;
      }
    }
  }
  return selected;
}

function checkEnvironment(selected) {
  const required = [];
  if (selected.has("db") || selected.has("medusa")) {
    required.push("shop/.env");
  }
  if (selected.has("storefront")) {
    required.push("shop/storefront/.env.local");
  }
  if (selected.has("pos")) {
    required.push("shop/pos/.env.local");
  }

  const missing = required.filter((file) => !existsSync(join(root, file)));
  if (missing.length === 0) {
    return;
  }

  console.error(`${red("✖")} Missing local configuration:`);
  for (const file of missing) {
    console.error(`  ${file}`);
  }
  console.error("\nCopy the templates first:");
  console.error("  cp shop/.env.template shop/.env");
  console.error("  cp shop/storefront/.env.template shop/storefront/.env.local");
  console.error("  cp shop/pos/.env.template shop/pos/.env.local");
  process.exit(1);
}

function readDatabasePort() {
  const env = readFileSync(join(root, "shop/.env"), "utf8");
  const line = env.match(/^DATABASE_URL=(.+)$/m);
  if (!line) {
    throw new Error("shop/.env has no DATABASE_URL.");
  }

  const value = line[1].trim().replace(/^["']|["']$/g, "");
  const url = new URL(value);
  return Number(url.port || 5432);
}

async function checkPorts(selected) {
  const busy = [];
  for (const key of selected) {
    const definition = DEFINITIONS[key];
    if (definition && (await portOpen(definition.port))) {
      busy.push(`${definition.port} (${definition.label})`);
    }
  }

  if (busy.length > 0) {
    throw new Error(`Already in use: ${busy.join(", ")}. Stop those processes first.`);
  }
}

function containerOnPort(port) {
  const names =
    docker(["ps", "-a", "--format", "{{.Names}}"]).stdout?.split("\n").filter(Boolean) ?? [];
  const candidates = [];

  for (const name of names) {
    const bindings =
      docker(["inspect", name, "--format", "{{json .HostConfig.PortBindings}}"]).stdout ?? "";
    if (bindings.includes(`"HostPort":"${port}"`)) {
      candidates.push(name);
    }
  }

  return candidates.find((name) => name === "kiboar-shop-pg") ?? candidates[0];
}

function composeRun(args, options = {}) {
  if (spawnSync("docker", ["compose", "version"], { stdio: "ignore" }).status === 0) {
    return spawnSync("docker", ["compose", "-f", "shop/docker-compose.yml", ...args], {
      cwd: root,
      encoding: "utf8",
      ...options,
    });
  }
  if (commandExists("docker-compose")) {
    return spawnSync("docker-compose", ["-f", "shop/docker-compose.yml", ...args], {
      cwd: root,
      encoding: "utf8",
      ...options,
    });
  }
  throw new Error("Docker Compose is not available.");
}

async function startDatabase() {
  databasePort = readDatabasePort();

  if (spawnSync("docker", ["info"], { stdio: "ignore" }).status !== 0) {
    if (!commandExists("colima")) {
      throw new Error("Docker is not running. Start Docker Desktop and try again.");
    }
    console.log(dim("Starting Colima..."));
    const started = spawnSync("colima", ["start"], { cwd: root, stdio: "inherit" });
    if (started.status !== 0 || spawnSync("docker", ["info"], { stdio: "ignore" }).status !== 0) {
      throw new Error("Colima could not start Docker.");
    }
  }

  const existing = containerOnPort(databasePort);
  if (existing) {
    const running = new Set(
      docker(["ps", "--format", "{{.Names}}"]).stdout?.split("\n").filter(Boolean) ?? [],
    );
    if (!running.has(existing)) {
      const result = docker(["start", existing], { stdio: "inherit" });
      if (result.status !== 0) {
        throw new Error(`Could not start the ${existing} container.`);
      }
      startedContainers.push(existing);
    }
  } else {
    if (await portOpen(databasePort)) {
      throw new Error(
        `Port ${databasePort} is in use but no container maps it. Stop it or update DATABASE_URL.`,
      );
    }
    const result = composeRun(["up", "-d", "postgres"], {
      stdio: "inherit",
      env: { ...process.env, POSTGRES_PORT: String(databasePort) },
    });
    if (result.status !== 0) {
      throw new Error("Could not start the PostgreSQL compose service.");
    }
    usedCompose = true;
  }

  if (!(await waitForPort(databasePort, 60_000))) {
    throw new Error(`PostgreSQL did not open port ${databasePort}.`);
  }
}

function prefix(stream, service) {
  const label = colored ? `\x1b[${service.ansi}m[${service.key}]\x1b[0m` : `[${service.key}]`;
  const lines = readline.createInterface({ input: stream });
  lines.on("line", (line) => {
    if (stopping && /ERR_PNPM|ELIFECYCLE|Command failed|recursive (run|exec)/.test(line)) {
      return;
    }
    console.log(`${label} ${line}`);
  });
}

function launch(key) {
  const service = DEFINITIONS[key];
  const child = spawn("pnpm", service.args, {
    cwd: root,
    detached: true,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, FORCE_COLOR: "1", ...service.env },
  });

  children.set(key, child);
  prefix(child.stdout, { ...service, key });
  prefix(child.stderr, { ...service, key });

  child.on("error", (error) => {
    console.log(`${red("✖")} ${service.label}: ${error.message}`);
  });
  child.on("exit", (code, signal) => {
    if (!stopping) {
      console.log(`${red("✖")} ${service.label} exited (${signal ?? code}).`);
    }
  });
}

async function reportWhenReady(key) {
  const service = DEFINITIONS[key];
  const ready = await waitForPort(service.port, service.timeout ?? 90_000);
  if (ready) {
    console.log(`${green("✔")} ${service.label} ${dim("is listening")}`);
  } else {
    console.log(`${red("✖")} ${service.label} did not open ${service.url} in time.`);
  }
  return ready;
}

function printTable(selected, ready) {
  const rows = [];
  const add = (key, name, url) => {
    rows.push([name, url, ready.get(key)]);
  };

  if (selected.has("web")) {
    add("web", "web", "http://localhost:3000/");
  }
  if (selected.has("docs")) {
    add("docs", "docs", "http://localhost:4321/");
  }
  if (selected.has("medusa")) {
    add("medusa", "medusa js", "http://localhost:9000/");
    add("medusa", "shop admin", "http://localhost:9000/app");
  }
  if (selected.has("storefront")) {
    add("storefront", "storefront", "http://localhost:3001/");
  }
  if (selected.has("pos")) {
    add("pos", "pos", "http://localhost:8081/");
  }
  if (selected.has("db")) {
    rows.push(["db", `localhost:${databasePort}`, true]);
  }

  console.log(`\n  ${bold("Kiboar is up")}\n`);
  for (const [name, url, ok] of rows) {
    const suffix = ok === false ? dim(" (not ready)") : "";
    console.log(`  ${name.padEnd(12)} ${cyan(`-> ${url}`)}${suffix}`);
  }
  console.log(`\n  ${dim("Studio is desktop-only: pnpm dev:studio")}`);
  console.log(
    `  ${dim(
      selected.has("db")
        ? "Ctrl+C stops the dev servers and the database container."
        : "Ctrl+C stops the dev servers.",
    )}`,
  );
  console.log();
}

async function shutdown(exitCode = 0) {
  if (stopping) {
    return;
  }
  stopping = true;
  console.log(`\n${dim("Stopping Kiboar...")}`);

  for (const child of children.values()) {
    try {
      process.kill(-child.pid, "SIGTERM");
    } catch {
      child.kill("SIGTERM");
    }
  }

  await sleep(1200);

  for (const child of children.values()) {
    if (child.exitCode === null && child.signalCode === null) {
      try {
        process.kill(-child.pid, "SIGKILL");
      } catch {
        // The process already exited.
      }
    }
  }

  if (usedCompose) {
    composeRun(["stop", "postgres"], { stdio: "inherit" });
  } else if (startedContainers.length > 0) {
    docker(["stop", ...startedContainers], { stdio: "inherit" });
  }

  console.log(dim("Stopped."));
  process.exit(exitCode);
}

async function main() {
  const groupName = process.argv[2] ?? "all";
  const selected = resolveGroup(groupName);

  checkEnvironment(selected);
  await checkPorts(selected);

  if (selected.has("db")) {
    await startDatabase();
  }

  const readiness = [];
  function track(key) {
    const promise = reportWhenReady(key);
    readiness.push({ key, promise });
    return promise;
  }

  if (selected.has("medusa")) {
    launch("medusa");
  }
  for (const key of ["web", "docs"]) {
    if (selected.has(key)) {
      launch(key);
      track(key);
    }
  }

  if (selected.has("medusa")) {
    await track("medusa");
  }

  for (const key of ["storefront", "pos"]) {
    if (selected.has(key)) {
      launch(key);
      track(key);
    }
  }

  const settled = await Promise.all(
    readiness.map(async ({ key, promise }) => ({ key, ok: await promise })),
  );
  printTable(selected, new Map(settled.map(({ key, ok }) => [key, ok])));
}

process.on("SIGINT", () => void shutdown());
process.on("SIGTERM", () => void shutdown());

main().catch((error) => {
  console.error(`${red("✖")} ${error.message}`);
  void shutdown(1);
});
