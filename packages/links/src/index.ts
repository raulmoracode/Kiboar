const repository = "https://github.com/raulmoracode/Kiboar";
const site = "https://kiboar.raulmoracode.com";
const branch = "main";

const blob = (path: string) => `${repository}/blob/${branch}/${path}`;
const tree = (path: string) => `${repository}/tree/${branch}/${path}`;
const raw = (path: string) =>
  `https://raw.githubusercontent.com/raulmoracode/Kiboar/${branch}/${path}`;
const release = (tag: string) => `${repository}/releases/tag/${tag}`;
const asset = (tag: string, file: string) => `${repository}/releases/download/${tag}/${file}`;

const home = `${site}/`;
const docs = `${site}/docs`;
const studioTag = "studio-v0.1.0";

export const studio = {
  tag: studioTag,
  release: release(studioTag),
  dmg: asset(studioTag, "Kiboar.Studio_0.1.0_aarch64.dmg"),
  sums: asset(studioTag, "SHA256SUMS"),
  install: blob("software/INSTALL.md"),
  adr: blob("software/docs/adr/0004-safety-principles-and-contracts.md"),
  script: raw("software/scripts/install-macos.sh"),
  source: tree("software"),
  roadmap: blob("software/README.md#roadmap"),
} as const;

export const library = {
  pcm: `${docs}/install/pcm`,
  clone: `${docs}/install/clone`,
  licensing: `${docs}/licensing`,
  notice: blob("NOTICE"),
  source: tree("library"),
} as const;

export const keyboards = {
  readme: blob("keyboards/README.md"),
} as const;

export { asset, blob, docs, home, raw, release, repository, site, tree };
