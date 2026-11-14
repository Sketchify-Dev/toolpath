import { NextResponse } from "next/server";
import { hydraConfig, hydraReady } from "@/lib/hydra";

export async function GET() {
  const cfg = hydraConfig();
  const reachable = cfg.mode === "live" ? await hydraReady() : false;
  const mode = cfg.mode === "live" && reachable ? "live" : "snapshot";
  return NextResponse.json({
    data: {
      mode,
      service: "toolpath",
      hydra_url_set: cfg.mode === "live",
      hydra_reachable: reachable,
      graph: cfg.graph,
      cell: cfg.cell,
      message:
        mode === "live"
          ? "Live HydraDB mode."
          : "Snapshot mode: serving recorded runs from the seeded tool graph.",
    },
  });
}
