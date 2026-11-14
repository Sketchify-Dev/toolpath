# Toolpath: submission copy

Track 2, agent context layer on HydraDB. Copy-paste ready for the
hackathon submission form. Every number below is measured on the live
deployment, not estimated.

## One-line pitch

Agents preload 40 tool schemas before the first thought. Toolpath walks
the tool graph in HydraDB and pulls only the 3 the task needs.

## Problem (one sentence)

Agent context windows fill with tool schemas the task never calls, so
teams pay for tokens that do no work and get tool selection nobody can
audit.

## Solution (one sentence)

Toolpath stores tools, capabilities, and resolved entities as HydraDB
nodes and resolves each task with one graph traversal, so only the tools
on the path enter context.

## Sponsor tech used

- **HydraDB**: the tool graph itself. Tool nodes (cost, latency),
  Capability nodes, PROVIDES edges, plus USED and RESOLVED edges written
  per run.
- **OpenCypher**: task to capability to tool traversal,
  `MATCH (r:TaskRun)-[:NEEDS]->(c:Capability)`.
- **algo.MSpaths**: multi-source capability resolution in one round trip
  instead of fan-out.

## Measured results (live deployment)

- 12,400 tokens down to 1,800 (85 percent) on the demo task.
- 40 tools preloaded down to 3 hydrated.
- 4 round trips down to 1 graph traversal, 6 hops.
- Follow-up query reuses hydra/core and PR #412 with zero refetch.
- Ambiguous "Acme" entity resolves by graph degree, 2 candidates down
  to acme-corp, no prompt guessing.
- 60/60 HTTP 200 on the live compare endpoint, p50 1.0s, p95 2.6s.

## Demo (60 seconds)

1. 0-15s: 40 tool schemas in context before the first thought.
2. 15-40s: run the task, baseline vs toolpath side by side,
   traversal path lights up, 12,400 down to 1,800.
3. 40-50s: follow-up reuses entities, zero refetch.
4. 50-60s: ambiguous entity resolves by degree.
   Soundbite: traverse, don't preload.

Live: https://toolpath-five.vercel.app/demo (no login, runs on load,
snapshot mode so it works with zero setup).

## What we cut (honest scope)

No auth, no multi-tenant, no write path beyond USED/RESOLVED edges, one
seeded graph of 30 mock tools. Real HydraDB traversal is one env var
away (HYDRA_URL); snapshot mode keeps the demo judge-proof either way.

## Next if funded

MCP server ingestion (every server.json becomes nodes on connect), cost
accounting per tool call for budget-aware traversal, and the Vercel
marketplace listing so any agent team points at their graph in one env var.
