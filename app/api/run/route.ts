import { NextResponse } from "next/server";
import { runBaseline, runToolpath, type RunMode } from "@/lib/runner";

const sessions = new Map<string, string[]>();
const SESSION = "demo-session";

function sessionEntities(): string[] {
  return sessions.get(SESSION) ?? [];
}

function remember(entities: string[]) {
  const current = sessionEntities();
  sessions.set(SESSION, [...new Set([...current, ...entities])]);
}

export async function POST(request: Request) {
  let body: { task?: string; mode?: RunMode };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "invalid_json", message: "Body must be JSON with task and mode." } },
      { status: 400 },
    );
  }
  const task = (body.task ?? "").trim();
  const mode = body.mode;
  if (!task || (mode !== "baseline" && mode !== "toolpath")) {
    return NextResponse.json(
      {
        error: {
          code: "validation_error",
          message: "Provide task (string) and mode ('baseline' or 'toolpath').",
        },
      },
      { status: 422 },
    );
  }

  const result = mode === "baseline" ? runBaseline(task) : runToolpath(task, sessionEntities());
  if (mode === "toolpath" && !result.degraded) {
    remember(["repo:hydra/core", "pr:hydra/core#412"]);
  }
  return NextResponse.json({ data: result });
}
