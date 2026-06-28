// Inlined Sentinel ingest contract (kept in sync with @sentinel/shared).
export type SignalType = "crash" | "error_log" | "restart_loop" | "http_5xx";
export type Severity = "low" | "medium" | "high" | "critical";

export interface IngestPayload {
  source: "collector" | "manual";
  service: string;
  runtime?: string;
  container?: string;
  signal_type: SignalType;
  severity: Severity;
  detected_at: string;
  evidence: {
    exit_code?: number;
    log_excerpt?: string;
    restart_count?: number;
    [key: string]: unknown;
  };
}
