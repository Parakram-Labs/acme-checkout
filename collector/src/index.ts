import "./env";
import { config } from "./env";
import { pollDocker, pollPm2, type Anomaly } from "./sources";
import type { IngestPayload } from "./types";

const lastFired = new Map<string, number>();

async function postIncident(a: Anomaly): Promise<void> {
  const body: IngestPayload = {
    source: "collector",
    service: a.service,
    runtime: a.runtime,
    container: a.container,
    signal_type: a.signalType,
    severity: a.severity,
    detected_at: new Date().toISOString(),
    evidence: a.evidence,
  };

  try {
    const res = await fetch(config.ingestUrl, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${config.apiKey}` },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const { incident_id } = (await res.json().catch(() => ({}))) as { incident_id?: string };
      console.log(`[collector] incident raised: ${a.signalType} on ${a.service} → ${incident_id ?? "ok"}`);
    } else {
      console.error(`[collector] ingest rejected (${res.status}) for ${a.service}`);
    }
  } catch (err) {
    console.error(`[collector] ingest failed for ${a.service}:`, (err as Error).message);
  }
}

async function tick(): Promise<void> {
  const found: Anomaly[] = [];
  if (config.watchDocker) found.push(...(await pollDocker()));
  if (config.watchPm2) found.push(...(await pollPm2()));

  const now = Date.now();
  for (const a of found) {
    const last = lastFired.get(a.key) ?? 0;
    if (now - last < config.cooldownMs) continue;
    lastFired.set(a.key, now);
    await postIncident(a);
  }
}

async function main(): Promise<void> {
  const sources = [config.watchDocker && "docker", config.watchPm2 && "pm2"].filter(Boolean).join(" + ");
  console.log(`[collector] watching ${sources} every ${config.pollMs}ms → ${config.ingestUrl}`);
  // eslint-disable-next-line no-constant-condition
  while (true) {
    await tick().catch((e) => console.error("[collector] tick error:", e));
    await new Promise((r) => setTimeout(r, config.pollMs));
  }
}

main();
