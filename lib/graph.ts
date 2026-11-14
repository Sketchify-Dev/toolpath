import { CAPABILITIES, TOOLS } from "@/lib/registry";

export interface GraphNode {
  id: string;
  label: string;
  type: "task" | "capability" | "tool" | "entity";
  degree: number;
  loaded: boolean;
}

export interface GraphEdge {
  from: string;
  to: string;
  type: "HAS_CAPABILITY" | "PROVIDES" | "USED" | "RESOLVED";
}

export function buildGraph(task: string, toolpathTools: string[]): {
  nodes: GraphNode[];
  edges: GraphEdge[];
} {
  const nodes: GraphNode[] = [
    { id: "task:run", label: task.slice(0, 28), type: "task", degree: 3, loaded: true },
    { id: "entity:repo", label: "hydra/core", type: "entity", degree: 9, loaded: true },
    { id: "entity:pr", label: "PR #412", type: "entity", degree: 6, loaded: true },
    { id: "entity:issue", label: "issue #77", type: "entity", degree: 3, loaded: true },
  ];
  const edges: GraphEdge[] = [
    { from: "task:run", to: "entity:repo", type: "RESOLVED" },
    { from: "task:run", to: "entity:pr", type: "RESOLVED" },
    { from: "task:run", to: "entity:issue", type: "RESOLVED" },
  ];

  const activeCaps = new Set<string>();
  for (const toolId of toolpathTools) {
    const tool = TOOLS.find((t) => t.id === toolId);
    if (tool) activeCaps.add(tool.capability);
  }

  for (const cap of CAPABILITIES) {
    const active = activeCaps.has(cap.id);
    nodes.push({
      id: `cap:${cap.id.replace("cap:", "")}`,
      label: cap.name,
      type: "capability",
      degree: TOOLS.filter((t) => t.capability === cap.id).length,
      loaded: active,
    });
    if (active) edges.push({ from: "task:run", to: `cap:${cap.id.replace("cap:", "")}`, type: "HAS_CAPABILITY" });
  }

  for (const tool of TOOLS.slice(0, 18)) {
    const loaded = toolpathTools.includes(tool.id);
    nodes.push({
      id: `tool:${tool.id}`,
      label: tool.id,
      type: "tool",
      degree: loaded ? 5 : 1,
      loaded,
    });
    edges.push({
      from: `tool:${tool.id}`,
      to: `cap:${tool.capability.replace("cap:", "")}`,
      type: "PROVIDES",
    });
    if (loaded) edges.push({ from: "task:run", to: `tool:${tool.id}`, type: "USED" });
  }

  return { nodes, edges };
}
