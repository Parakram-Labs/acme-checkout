import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

// Tiny .env loader (no dotenv dependency).
for (const file of [".env.local", ".env"]) {
  const path = resolve(process.cwd(), file);
  if (!existsSync(path)) continue;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m) continue;
    const key = m[1];
    if (process.env[key] === undefined) {
      process.env[key] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

function required(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`[collector] missing required env: ${name}`);
    process.exit(1);
  }
  return v;
}

function ingestUrl(): string {
  if (process.env.SENTINEL_INGEST_URL) return process.env.SENTINEL_INGEST_URL;
  const base = (process.env.SENTINEL_API_URL ?? "http://localhost:3002").replace(/\/$/, "");
  return `${base}/api/ingest`;
}

export const config = {
  ingestUrl: ingestUrl(),
  apiKey: required("SENTINEL_API_KEY"),
  pollMs: Number(process.env.POLL_INTERVAL_MS ?? 5000),
  cooldownMs: Number(process.env.COOLDOWN_MS ?? 60000),
  watchDocker: process.env.WATCH_DOCKER !== "false",
  watchPm2: process.env.WATCH_PM2 !== "false",
};
