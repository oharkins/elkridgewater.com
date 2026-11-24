#!/usr/bin/env node
/**
 * Build the Hugo site for Cursor Apps (and environments without a global Hugo).
 * Downloads Hugo Extended when `hugo` is missing or older than 0.166.
 */
import { spawnSync } from "node:child_process";
import { createWriteStream, existsSync, mkdirSync, chmodSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pipeline } from "node:stream/promises";

const HUGO_VERSION = "0.170.1";
const MIN_VERSION = [0, 166, 0];
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const cacheDir = join(root, ".hugo-cache");
const hugoBin = join(cacheDir, "hugo");

function parseVersion(out) {
  const m = String(out).match(/v?(\d+)\.(\d+)\.(\d+)/);
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

function gte(a, b) {
  for (let i = 0; i < 3; i++) {
    if (a[i] > b[i]) return true;
    if (a[i] < b[i]) return false;
  }
  return true;
}

function tryHugo(bin) {
  const r = spawnSync(bin, ["version"], { encoding: "utf8" });
  if (r.status !== 0) return null;
  const v = parseVersion(r.stdout || r.stderr);
  if (!v || !gte(v, MIN_VERSION)) return null;
  return bin;
}

async function ensureHugo() {
  const fromPath = tryHugo("hugo");
  if (fromPath) return fromPath;
  if (existsSync(hugoBin) && tryHugo(hugoBin)) return hugoBin;

  mkdirSync(cacheDir, { recursive: true });
  const arch = process.arch === "arm64" ? "arm64" : "amd64";
  const platform = process.platform === "darwin" ? "darwin" : "linux";
  const url = `https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_${platform}-${arch}.tar.gz`;
  console.log(`Downloading Hugo Extended ${HUGO_VERSION}…`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download Hugo: ${res.status} ${url}`);

  const tmp = join(cacheDir, "hugo.tar.gz");
  await pipeline(res.body, createWriteStream(tmp));

  const extract = spawnSync("tar", ["-xzf", tmp, "-C", cacheDir, "hugo"], { encoding: "utf8" });
  unlinkSync(tmp);
  if (extract.status !== 0) {
    throw new Error(`tar extract failed: ${extract.stderr || extract.stdout}`);
  }
  chmodSync(hugoBin, 0o755);
  if (!tryHugo(hugoBin)) throw new Error("Downloaded Hugo binary failed version check");
  return hugoBin;
}

const hugo = await ensureHugo();
const args = ["--gc", "--minify", "-b", "/", "-d", "dist"];
console.log(`Running: ${hugo} ${args.join(" ")}`);
const result = spawnSync(hugo, args, { cwd: root, stdio: "inherit" });
process.exit(result.status ?? 1);
