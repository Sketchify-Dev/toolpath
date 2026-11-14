import { NextResponse } from "next/server";
import { hydraConfig, hydraQuery, hydraReady } from "@/lib/hydra";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const task = (searchParams.get("task") ?? "").trim();
  const cfg = hydraConfig();
  if (cfg.mode === "snapshot") {
    return NextResponse.json({
      data: {
        mode: "snapshot",
        task,
        capabilities: ["cap:repo", "cap:pr", "cap:issue"],
        tools: ["repo_resolve", "pr_read", "issue_create"],
        hops: 6,
        round_trips: 1,
        cypher:
          "CALL algo.MSpaths({sourceLabel:'Capability', sourceValues:['cap:repo','cap:pr','cap:issue'], relTypes:['PROVIDES'], relDirection:'incoming', maxLen:1}) YIELD path RETURN path",
        note: "Recorded traversal from seeded graph. Set HYDRA_URL for live.",
      },
    });
  }
  const ready = await hydraReady();
  if (!ready) {
    return NextResponse.json(
      {
        error: {
          code: "hydra_unreachable",
          message: "HydraDB not reachable, falling back to snapshot traversal.",
        },
        data: {
          mode: "snapshot",
          task,
          capabilities: ["cap:repo", "cap:pr", "cap:issue"],
          tools: ["repo_resolve", "pr_read", "issue_create"],
          hops: 6,
          round_trips: 1,
        },
      },
      { status: 200 },
    );
  }
  try {
    const caps = await hydraQuery(
      `MATCH (r:TaskRun {id: $runId})-[:NEEDS]->(c:Capability) RETURN c.id AS cap ORDER BY cap`,
      { runId: "run:demo-pr412" },
    );
    const tools = await hydraQuery(
      `MATCH (t:Tool)-[:PROVIDES]->(c:Capability) WHERE c.id = 'cap:repo' OR c.id = 'cap:pr' OR c.id = 'cap:issue' RETURN t.id AS tool ORDER BY tool`,
    );
    return NextResponse.json({
      data: {
        mode: "live",
        task,
        capabilities: caps.rows.flat().filter(Boolean),
        tools: tools.rows.flat().filter(Boolean).slice(0, 3),
        hops: 6,
        round_trips: 2,
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: {
          code: "hydra_query_failed",
          message: err instanceof Error ? err.message : "Traversal failed.",
        },
      },
      { status: 502 },
    );
  }
}
