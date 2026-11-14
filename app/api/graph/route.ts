import { NextResponse } from "next/server";
import { buildGraph } from "@/lib/graph";
import { runToolpath } from "@/lib/runner";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const task = (searchParams.get("task") ?? "").trim() || "summarize PR #412 and file a follow-up issue";
  const toolpath = runToolpath(task, []);
  return NextResponse.json({ data: buildGraph(task, toolpath.tools_used) });
}
