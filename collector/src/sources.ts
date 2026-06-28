import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { SignalType, Severity } from "./types";

const exec = promisify(execFile);

export interface Anomaly {
  key: string;
  runtime: "docker" | "pm2";
  service: string;
  container?: string;
  signalType: SignalType;
  severity: Severity;
  evidence: { exit_code?: number; restart_count?: number; log_excerpt?: string };
}

async function run(cmd: string, args: string[]): Promise<string | null> {
  try {
    const { stdout } = await exec(cmd, args, { timeout: 8000 });
    return stdout;
  } catch {
    return null;
  }
}

// Detect containers that crashed (exited non-zero) or are stuck restarting.
export async function pollDocker(): Promise<Anomaly[]> {
  const out = await run("docker", ["ps", "-a", "--no-trunc", "--format", "{{.Names}}|{{.State}}|{{.Status}}"]);
  if (out == null) return [];

  const anomalies: Anomaly[] = [];
  for (const line of out.split("\n").filter(Boolean)) {
    const [name, state, status] = line.split("|");
    if (!name) continue;

    if (state === "exited") {
      const exitCode = Number(status.match(/Exited \((\d+)\)/)?.[1] ?? 0);
      if (exitCode !== 0) {
        anomalies.push({
          key: `docker:${name}:crash`,
          runtime: "docker",
          service: name,
          container: name,
          signalType: "crash",
          severity: "high",
          evidence: { exit_code: exitCode, log_excerpt: await tailDockerLogs(name) },
        });
      }
    } else if (state === "restarting") {
      anomalies.push({
        key: `docker:${name}:restart_loop`,
        runtime: "docker",
        service: name,
        container: name,
        signalType: "restart_loop",
        severity: "critical",
        evidence: { log_excerpt: await tailDockerLogs(name) },
      });
    }
  }
  return anomalies;
}

async function tailDockerLogs(name: string): Promise<string | undefined> {
  const out = await run("docker", ["logs", "--tail", "5", name]);
  return out?.trim() || undefined;
}

// `pm2 jlist` → JSON; errored/stopped processes are treated as crashes.
export async function pollPm2(): Promise<Anomaly[]> {
  const out = await run("pm2", ["jlist"]);
  if (out == null) return [];

  let procs: Array<{ name: string; pm2_env?: { status?: string; restart_time?: number } }> = [];
  try {
    procs = JSON.parse(out);
  } catch {
    return [];
  }

  const anomalies: Anomaly[] = [];
  for (const p of procs) {
    const status = p.pm2_env?.status;
    if (status === "errored" || status === "stopped") {
      anomalies.push({
        key: `pm2:${p.name}:crash`,
        runtime: "pm2",
        service: p.name,
        signalType: "crash",
        severity: "high",
        evidence: { restart_count: p.pm2_env?.restart_time },
      });
    }
  }
  return anomalies;
}
