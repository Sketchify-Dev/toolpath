import { NextResponse } from "next/server";

export async function GET() {
  const live = Boolean(process.env.HYDRA_URL);
  return NextResponse.json({
    data: {
      mode: live ? "live" : "snapshot",
      service: "toolpath",
      hydra_url_set: live,
      message: live
        ? "Live HydraDB mode."
        : "Snapshot mode: serving recorded runs from the seeded tool graph.",
    },
  });
}
