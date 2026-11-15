export interface HydraConfig {
  url: string;
  token: string;
  cell: string;
  graph: string;
  mode: "live" | "snapshot";
}

export function hydraConfig(): HydraConfig {
  const url = process.env.HYDRA_URL ?? "";
  return {
    url: url.replace(/\/$/, ""),
    token: process.env.HYDRA_TOKEN ?? "",
    cell: process.env.HYDRA_CELL ?? "cell-0",
    graph: process.env.HYDRA_GRAPH ?? "default",
    mode: url ? "live" : "snapshot",
  };
}

interface HydraCell {
  type: string;
  value?: unknown;
}

function decodeCell(cell: HydraCell | null | undefined): string | number | boolean | null {
  if (!cell || cell.type === "null") return null;
  return cell.value as string | number | boolean;
}

export interface HydraQueryResult {
  columns: string[];
  rows: Array<Array<string | number | boolean | null>>;
}

export async function hydraQuery(
  query: string,
  parameters: Record<string, unknown> = {},
  timeoutMs = 8000,
): Promise<HydraQueryResult> {
  const cfg = hydraConfig();
  if (cfg.mode === "snapshot") throw new Error("HYDRA_URL unset, snapshot mode");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${cfg.url}/v1/graphs/${cfg.graph}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cell_id: cfg.cell, query, parameters }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HydraDB ${res.status}: ${text.slice(0, 200)}`);
    }
    const json = (await res.json()) as {
      columns?: string[];
      rows?: HydraCell[][];
    };
    return {
      columns: json.columns ?? [],
      rows: (json.rows ?? []).map((row) => row.map(decodeCell)),
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function hydraReady(timeoutMs = 3000): Promise<boolean> {
  const cfg = hydraConfig();
  if (cfg.mode === "snapshot" || !cfg.token) return false;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(`${cfg.url}/healthz`, { signal: controller.signal });
      return res.ok;
    } finally {
      clearTimeout(timer);
    }
  } catch {
    return false;
  }
}

export const SEED_STATEMENTS: string[] = [
  `UNWIND $rows AS row MERGE (t:Tool {id: row.id}) SET t.name = row.name, t.description = row.description, t.latency_ms = row.latency_ms, t.cost_tokens = row.cost_tokens`,
  `UNWIND $rows AS row MERGE (c:Capability {id: row.id}) SET c.name = row.name`,
  `UNWIND $rows AS row MATCH (t:Tool {id: row.from}) MATCH (c:Capability {id: row.to}) MERGE (t)-[:PROVIDES]->(c)`,
  `UNWIND $rows AS row MATCH (t:Tool {id: row.tool}) MATCH (c:Capability {id: row.cap}) MERGE (r:TaskRun {id: row.run}) MERGE (r)-[:NEEDS]->(c) MERGE (r)-[:USED]->(t)`,
  `UNWIND $rows AS row MATCH (r:TaskRun {id: row.run}) MERGE (e:Entity {id: row.entity}) SET e.kind = row.kind, e.label = row.label MERGE (r)-[:RESOLVED]->(e)`,
];

export const TRAVERSAL_CYPHER = `MATCH (r:TaskRun {id: $runId})-[:NEEDS]->(c:Capability) MATCH (t:Tool)-[:PROVIDES]->(c) RETURN c.id AS capability, t.id AS tool_id, t.cost_tokens AS cost ORDER BY capability, cost ASC`;

export const ENTITY_REUSE_CYPHER = `MATCH (p:TaskRun)-[:RESOLVED]->(e:Entity) WHERE e.kind = $kind AND e.label STARTS WITH $prefix RETURN e.id AS entity_id, e.summary AS summary, p.id AS prior_run ORDER BY p.created_at DESC LIMIT 5`;
