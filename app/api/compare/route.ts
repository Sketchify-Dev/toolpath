import { NextResponse } from "next/server";
import { runBaseline, runToolpath } from "@/lib/runner";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const task = (searchParams.get("task") ?? "").trim() || "summarize PR #412 and file a follow-up issue";
  const baseline = runBaseline(task);
  const toolpath = runToolpath(task, task.includes("repo was that") ? ["repo:hydra/core", "pr:hydra/core#412"] : []);
  const tokensSaved = baseline.metrics.context_tokens - toolpath.metrics.context_tokens;
  return NextResponse.json({
    data: {
      baseline,
      toolpath,
      delta: {
        tokens_saved: tokensSaved,
        tokens_pct: Math.round((tokensSaved / baseline.metrics.context_tokens) * 100),
        round_trips_saved: baseline.metrics.round_trips - toolpath.metrics.round_trips,
        latency_saved_ms: baseline.metrics.latency_ms - toolpath.metrics.latency_ms,
      },
    },
  });
}
