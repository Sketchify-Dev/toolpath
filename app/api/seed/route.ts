import { NextResponse } from "next/server";
import { TOOLS, CAPABILITIES } from "@/lib/registry";
import { hydraConfig, hydraQuery, SEED_STATEMENTS } from "@/lib/hydra";

export async function POST() {
  const cfg = hydraConfig();
  if (cfg.mode === "snapshot") {
    return NextResponse.json(
      {
        error: {
          code: "snapshot_mode",
          message: "Set HYDRA_URL, HYDRA_TOKEN, HYDRA_CELL to seed a live HydraDB.",
        },
      },
      { status: 409 },
    );
  }
  const tools = TOOLS.map((t) => ({
    id: `tool:${t.id}`,
    name: t.name,
    description: t.description,
    latency_ms: t.latencyMs,
    cost_tokens: t.schemaTokens,
  }));
  const caps = CAPABILITIES.map((c) => ({ id: c.id, name: c.name }));
  const provides = TOOLS.map((t) => ({ from: `tool:${t.id}`, to: t.capability }));
  const demoRun = [
    { run: "run:demo-pr412", tool: "tool:repo_resolve", cap: "cap:repo" },
    { run: "run:demo-pr412", tool: "tool:pr_read", cap: "cap:pr" },
    { run: "run:demo-pr412", tool: "tool:issue_create", cap: "cap:issue" },
  ];
  const resolvedEntities = [
    { run: "run:demo-pr412", entity: "entity:repo:hydra/core", kind: "repo", label: "hydra/core" },
    { run: "run:demo-pr412", entity: "entity:pr:412", kind: "pr", label: "PR #412" },
    { run: "run:demo-pr412", entity: "entity:issue:77", kind: "issue", label: "issue #77" },
  ];
  try {
    await hydraQuery(SEED_STATEMENTS[0], { rows: tools });
    await hydraQuery(SEED_STATEMENTS[1], { rows: caps });
    await hydraQuery(SEED_STATEMENTS[2], { rows: provides });
    await hydraQuery(SEED_STATEMENTS[3], { rows: demoRun });
    await hydraQuery(SEED_STATEMENTS[4], { rows: resolvedEntities });
    return NextResponse.json({
      data: {
        seeded: true,
        tools: tools.length,
        capabilities: caps.length,
        provides_edges: provides.length,
        run_edges: demoRun.length * 2,
        resolved_entities: resolvedEntities.length,
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: {
          code: "hydra_unreachable",
          message: err instanceof Error ? err.message : "Seed failed.",
        },
      },
      { status: 502 },
    );
  }
}

export async function GET() {
  const cfg = hydraConfig();
  return NextResponse.json({
    data: {
      mode: cfg.mode,
      statements: SEED_STATEMENTS.length,
      tools: TOOLS.length,
      capabilities: CAPABILITIES.length,
      usage: "POST this route with HYDRA_URL set to seed. MERGE only, idempotent.",
    },
  });
}
