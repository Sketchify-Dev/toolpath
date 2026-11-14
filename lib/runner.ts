import {
  AMBIENT_PLATFORM_TOOLS,
  DEMO_TASK,
  FOLLOWUP_TASK,
  GOLDEN_TOOLS,
  TOOLS,
  findTool,
  type MockTool,
} from "./registry";

export type RunMode = "baseline" | "toolpath";

export interface RunMetrics {
  tools_loaded: number;
  context_tokens: number;
  round_trips: number;
  traversal_hops: number;
  latency_ms: number;
  cache_hit: boolean;
  success: boolean;
}

export interface RunResult {
  mode: RunMode;
  task: string;
  tools_used: string[];
  tokens: { schema: number; entities: number; overhead: number; total: number };
  round_trips: number;
  hops: number;
  path: string[];
  entities_reused: number;
  degraded?: boolean;
  resolution?: { candidates: number; chosen: string; rule: string };
  result_summary: string;
  metrics: RunMetrics;
  log: string[];
}

export const ENTITY_TOKENS = 200;
export const RT_OVERHEAD = 100;

const KNOWN_CAPS: Record<string, string[]> = {
  repo: ["cap:repo"],
  repos: ["cap:repo"],
  repository: ["cap:repo"],
  pr: ["cap:pr"],
  "pull request": ["cap:pr"],
  diff: ["cap:pr"],
  issue: ["cap:issue"],
  issues: ["cap:issue"],
  ticket: ["cap:issue"],
  bug: ["cap:issue"],
  ci: ["cap:ci"],
  check: ["cap:ci"],
  test: ["cap:ci"],
  search: ["cap:search"],
  code: ["cap:search"],
  docs: ["cap:docs"],
  doc: ["cap:docs"],
  invoice: ["cap:search", "cap:docs"],
  acme: ["cap:search"],
  pdf: ["cap:docs"],
  email: ["cap:search"],
  billing: ["cap:search"],
};

const TASK_CAPABILITY_MAP: Array<{ match: RegExp; caps: string[] }> = [
  { match: /summarize pr|pr #?\d+/i, caps: ["cap:repo", "cap:pr", "cap:issue"] },
  { match: /follow.?up issue/i, caps: ["cap:repo", "cap:pr", "cap:issue"] },
  { match: /what repo was that/i, caps: ["cap:repo", "cap:pr"] },
  { match: /invoice.*acme/i, caps: ["cap:search", "cap:docs"] },
  { match: /same invoice.*cfo/i, caps: ["cap:search"] },
];

const CAP_TO_TOOL: Record<string, string> = {
  "cap:repo": "repo_resolve",
  "cap:pr": "pr_read",
  "cap:issue": "issue_create",
  "cap:ci": "ci_status",
  "cap:search": "code_search",
  "cap:docs": "docs_search",
};

function matchCapabilities(task: string): string[] {
  for (const entry of TASK_CAPABILITY_MAP) {
    if (entry.match.test(task)) return entry.caps;
  }
  const lowered = task.toLowerCase();
  const found = new Set<string>();
  for (const [keyword, caps] of Object.entries(KNOWN_CAPS)) {
    if (lowered.includes(keyword)) caps.forEach((c) => found.add(c));
  }
  return [...found].slice(0, 3);
}

function stamp(): string {
  const d = new Date();
  return d.toISOString().slice(11, 19);
}

function summarize(task: string, mode: RunMode, tools: string[]): string {
  if (/summarize pr #?412/i.test(task)) {
    return "PR #412 (hydra/core) adds graph cache invalidation; filed issue #77 to track the WAL replay edge case.";
  }
  if (/what repo was that/i.test(task)) {
    return mode === "toolpath"
      ? "hydra/core, reused from the previous run with no refetch."
      : "hydra/core, re-derived by listing repos again.";
  }
  if (/invoice.*acme/i.test(task)) {
    return "Invoice #4471 for Acme Corp ($18,204) emailed to billing@acme.example.";
  }
  if (/same invoice.*cfo/i.test(task)) {
    return "Invoice #4471 forwarded to the Acme CFO, entity reused from run 1.";
  }
  return `Completed "${task}" using ${tools.join(", ")}.`;
}

export function runBaseline(task: string): RunResult {
  const tools = TOOLS.map((t) => t.id);
  const steps = ["repo_list", "pr_read", "issue_list", "issue_create"].filter((s) =>
    tools.includes(s),
  );
  const log = [
    `${stamp()} [llm] baseline: preloading ${tools.length + AMBIENT_PLATFORM_TOOLS} tool schemas`,
    `${stamp()} [tool] repo_list -> 24 repos (hydra/core chosen by keyword)`,
    `${stamp()} [tool] pr_read #412 -> title, body, 6 files`,
    `${stamp()} [tool] issue_list -> 31 open issues scanned`,
    `${stamp()} [tool] issue_create -> issue #77 filed`,
  ];
  const schema = (tools.length + AMBIENT_PLATFORM_TOOLS) * 300;
  const roundTrips = 4;
  const total = schema + roundTrips * RT_OVERHEAD;
  const latency = steps.reduce((acc, s) => acc + (findTool(s)?.latencyMs ?? 150), 0) + roundTrips * 80;

  return {
    mode: "baseline",
    task,
    tools_used: steps,
    tokens: { schema, entities: 0, overhead: roundTrips * RT_OVERHEAD, total },
    round_trips: roundTrips,
    hops: 0,
    path: [],
    entities_reused: 0,
    result_summary: summarize(task, "baseline", steps),
    metrics: {
      tools_loaded: tools.length + AMBIENT_PLATFORM_TOOLS,
      context_tokens: total,
      round_trips: roundTrips,
      traversal_hops: 0,
      latency_ms: latency,
      cache_hit: false,
      success: true,
    },
    log,
  };
}

export function runToolpath(task: string, sessionEntities: string[]): RunResult {
  const caps = matchCapabilities(task);
  const log: string[] = [];
  log.push(`${stamp()} [graph] task -> capabilities: ${caps.join(", ") || "none"}`);

  if (caps.length === 0) {
    const fallback = TOOLS.slice(0, 5).map((t) => t.id);
    log.push(`${stamp()} [graph] no capability match, keyword fallback over tool descriptions`);
    fallback.forEach((t) => log.push(`${stamp()} [tool] ${t} called (degraded)`));
    const schema = fallback.length * 300;
    const roundTrips = fallback.length;
    const total = schema + roundTrips * RT_OVERHEAD;
    return {
      mode: "toolpath",
      task,
      tools_used: fallback,
      tokens: { schema, entities: 0, overhead: roundTrips * RT_OVERHEAD, total },
      round_trips: roundTrips,
      hops: 0,
      path: [],
      entities_reused: 0,
      degraded: true,
      result_summary: `[degraded] ${summarize(task, "toolpath", fallback)}`,
      metrics: {
        tools_loaded: fallback.length,
        context_tokens: total,
        round_trips: roundTrips,
        traversal_hops: 0,
        latency_ms: fallback.reduce((a, s) => a + (findTool(s)?.latencyMs ?? 150), 0) + roundTrips * 80,
        cache_hit: false,
        success: true,
      },
      log,
    };
  }

  const tools: MockTool[] = [];
  for (const cap of caps) {
    const toolId = CAP_TO_TOOL[cap];
    const tool = toolId ? findTool(toolId) : undefined;
    if (tool && !tools.some((t) => t.id === tool.id)) tools.push(tool);
  }
  while (tools.length > 3) tools.pop();

  const cypher =
    tools.length > 1
      ? `CALL algo.MSpaths({sourceLabel:'Capability', sourceProperty:'id', sourceValues:[${caps
          .map((c) => `'${c}'`)
          .join(", ")}], pairwise:false, relTypes:['PROVIDES'], relDirection:'incoming', maxLen:1, pathCount:1, resultLimit:15}) YIELD path RETURN path`
      : `MATCH (t:Tool)-[:PROVIDES]->(c:Capability {id:'${caps[0]}'}) RETURN t.id ORDER BY t.cost_tokens ASC LIMIT 3`;
  log.push(`${stamp()} [cypher] ${cypher}`);

  const path: string[] = ["Task:run"];
  caps.forEach((c) => path.push(`Capability:${c.replace("cap:", "")}`));
  const ordered = [...tools].sort((a, b) => {
    const order = ["repo_resolve", "pr_read", "issue_create", "ci_status", "code_search", "docs_search"];
    return order.indexOf(a.id) - order.indexOf(b.id);
  });
  ordered.forEach((t) => path.push(`Tool:${t.id}`));

  const reused = sessionEntities.length > 0 && /what repo|same invoice|cfo/i.test(task);
  const entities = reused ? sessionEntities : GOLDEN_TOOLS.length ? ["repo:hydra/core", "pr:hydra/core#412", "issue:hydra/core#77"] : [];
  log.push(
    `${stamp()} [graph] traversal: ${caps.length} capabilities -> ${tools.length} tools in 1 round trip (${caps.length + tools.length} hops)`,
  );
  if (reused) {
    log.push(`${stamp()} [graph] entity cache hit: ${sessionEntities.join(", ")} reused, 0 refetch`);
  }
  const roundTrips = reused ? 1 : tools.length;
  ordered.forEach((t) =>
    log.push(`${stamp()} [tool] ${t.id} (${t.latencyMs}ms) -> ok`),
  );
  log.push(`${stamp()} [llm] answer composed from ${tools.length} tool outputs`);

  const schema = tools.length * 300;
  const entityTokens = (reused ? 0 : entities.length * ENTITY_TOKENS);
  const total = schema + entityTokens + roundTrips * RT_OVERHEAD;
  const latency =
    ordered.reduce((acc, t) => acc + t.latencyMs, 0) + roundTrips * 80 + 40;

  const resolution =
    /invoice.*acme/i.test(task)
      ? { candidates: 2, chosen: "acme-corp", rule: "degree" }
      : undefined;
  if (resolution) {
    log.push(`${stamp()} [graph] entity tie-break: 2 candidates, chose acme-corp by degree`);
  }

  return {
    mode: "toolpath",
    task,
    tools_used: ordered.map((t) => t.id),
    tokens: { schema, entities: entityTokens, overhead: roundTrips * RT_OVERHEAD, total },
    round_trips: roundTrips,
    hops: caps.length + tools.length,
    path,
    entities_reused: reused ? sessionEntities.length : 0,
    resolution,
    result_summary: summarize(task, "toolpath", ordered.map((t) => t.id)),
    metrics: {
      tools_loaded: reused ? 0 : tools.length,
      context_tokens: reused ? RT_OVERHEAD : total,
      round_trips: roundTrips,
      traversal_hops: caps.length + tools.length,
      latency_ms: latency,
      cache_hit: reused,
      success: true,
    },
    log,
  };
}

export function demoTasks(): string[] {
  return [DEMO_TASK, FOLLOWUP_TASK];
}
