import { NextResponse } from "next/server";
import { hydraConfig, hydraReady } from "@/lib/hydra";

export async function GET() {
  const cfg = hydraConfig();
  const reachable = cfg.mode === "live" ? await hydraReady() : false;
  // The demo's /api/compare and /api/graph run the local runner regardless of
  // HydraDB connectivity. Only /api/run attempts a live HydraDB query. Report
  // connectivity truthfully without implying the demo executed a live traversal.
  return NextResponse.json({
    data: {
      mode: "snapshot",
      service: "toolpath",
      hydra_url_set: cfg.mode === "live",
      hydra_reachable: reachable,
      graph: cfg.graph,
      cell: cfg.cell,
      demo_execution_mode: "snapshot",
      message:
        reachable
          ? "HydraDB reachable. Demo runs in snapshot mode; /api/run may issue live queries when HYDRA_URL is set."
          : "Snapshot mode: serving recorded runs from the seeded tool graph. Set HYDRA_URL for live HydraDB access.",
    },
  });
}
