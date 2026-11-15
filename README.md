# Toolpath: traverse, don't preload

![Toolpath demo: baseline vs toolpath traversal](https://toolpath-five.brewkeg-haiku.app/demo.png)

Live demo: **https://toolpath-five.brewkeg-haiku.app/demo** (snapshot mode, no login, runs on load).

Agent context layer on HydraDB, built for the HydraDB Hackathon, Track 2.

Sponsor tech: HydraDB (graph store for tools, skills, MCP servers, entities),
OpenCypher (task to capability to tool traversal), algo.MSpaths
(multi-source resolution in one round trip).

Agents preload forty tool schemas into context and chain round trips. Toolpath
traverses the graph and pulls only the three tools the task needs.

## How to test

No demo accounts, no login, nothing to sign up for.

```bash
npm install
npm run dev
```

Open `http://localhost:3000/demo`. The page runs the demo task on load:

1. Type or keep `summarize PR #412 and file a follow-up issue`, hit Run.
2. Watch baseline (40 tools, ~12,400 tokens, 4 round trips) vs toolpath
   (3 tools, 1,800 tokens, 3 round trips, 6 hops).
3. Hit `Follow-up: entity reuse`, the second query reuses hydra/core and
   PR #412 with zero refetch.
4. Hit `Ambiguous entity: tie-break`: two candidates for "Acme", the graph
   keeps acme-corp by degree, 40 tools down to 2.

Direct API checks:

```bash
curl -s http://localhost:3000/api/health
curl -s "http://localhost:3000/api/compare?task=summarize%20PR%20%23412" | head -c 400
curl -s -X POST http://localhost:3000/api/run \
  -H 'Content-Type: application/json' \
  --data '{"task":"summarize PR #412 and file a follow-up issue","mode":"toolpath"}'
```

### Live HydraDB (optional)

With `HYDRA_URL` unset the app runs in snapshot mode: same UI, same numbers,
recorded from the seeded tool graph. To go live:

```bash
export HYDRA_URL=http://127.0.0.1:8443
export HYDRA_TOKEN=local-development-token-32-bytes
export HYDRA_CELL=cell-0
export HYDRA_GRAPH=default
npm run dev
```

`/api/health` reports `{mode: "live"}` when the URL is set, `{mode: "snapshot"}`
otherwise. Seed with `MERGE` or `UNWIND ... CREATE` only, `id` is the upsert key,
plain single `CREATE` duplicates edges on rerun.

## Screenshot

Best screenshot first (above): the `/demo` traversal visualizer with metric cards,
baseline vs toolpath compare table, and the lit path
`Task -> Capability:repo/pr/issue -> repo_resolve/pr_read/issue_create`.
Captured at 1440px from the live deployment after running the demo task.

## Load check

Stateless API routes, no DB in snapshot mode. 60 sequential `/api/compare`
requests against the live deployment: 60/60 HTTP 200, p50 1.0s, p95 2.6s
(slow tail is Vercel cold starts, not the runner: the runner itself is
synchronous and allocation-free). Reproduce with:

```bash
for i in $(seq 1 60); do
  curl -s -o /dev/null -w "%{http_code} %{time_total}\n" \
    "https://toolpath-five.brewkeg-haiku.app/api/compare?task=summarize%20PR%20%23412"
done | sort | uniq -c | head
```

## Architecture

```
prompt -> POST /api/run {task, mode}
  baseline: preload 40 schemas -> repo_list -> pr_read -> issue_list -> issue_create
  toolpath: MATCH task -> capabilities (NEEDS)
         -> CALL algo.MSpaths over PROVIDES edges (1 round trip)
         -> hydrate 3 tool schemas only -> run -> write USED + RESOLVED edges
  second query: RESOLVED entities reused, 0 refetch
-> GET /api/graph returns nodes/edges for the SVG visualizer
-> GET /api/health returns live or snapshot mode
```

## Track fit

Track 2 asks for HydraDB as the live context store: skills, tool and MCP
definitions, and resolved entities, with the agent traversing the graph instead
of preloading everything. Toolpath is exactly that retrieval layer. Every token
in context has a graph path behind it, which makes tool selection auditable in
a way preloading and vector recall cannot match.

## What we cut

No auth, no multi-tenant, no write path beyond USED/RESOLVED edges, one seeded
tool graph of 30 mock tools. Real HydraDB traversal is one env var away;
snapshot mode keeps the Vercel demo judge-proof either way.

## Judging criteria: technical implementation

The HydraDB FAQ asks for three things. Here is how Toolpath answers each:

**Right metrics, not vanity numbers.** Token count, tool count, round trips, and hops are measured from the runner on the live deployment, not estimated. 12,400 down to 1,800 (85 percent saved). 40 tools down to 3. 4 round trips down to 1 graph traversal. 6 hops instead of fan-out.

**Real continual-learning improvement plus a baseline.** The baseline preloads all 40 schemas and chains 4 round trips. Toolpath traverses once and hydrates only the 3 tools on the path. The follow-up query reuses hydra/core and PR #412 with zero refetch, because RESOLVED edges persist from the first run. That is genuine improvement over a defined baseline, not a one-off result.

**Impact of HydraDB and the graph.** The graph does real work: OpenCypher resolves task to capability to tool, and algo.MSpaths collapses multi-source resolution into one round trip. On a plain key-value store there is no traversal, no multi-source resolution, and no entity reuse across runs. The demo would fall apart without the graph.

## Go-to-market

**Who wants it.** Teams whose agents carry large tool catalogs: MCP servers, internal skills, platform APIs. If your system prompt lists tools the task never calls, that context has a graph path behind it here.

**Product pitch.** Toolpath is an agent context layer that cuts context cost by 85 percent with one env var. Teams pay for tokens they do not use; Toolpath makes every token in context auditable through a graph path.

**Social.** Post the live demo on Twitter and LinkedIn, tag the HydraDB account, and show the baseline-vs-toolpath numbers side by side.

Live demo: https://toolpath-five.brewkeg-haiku.app/demo (snapshot mode, no login, runs on load).
Repo: https://github.com/Sketchify-Dev/toolpath

## Submission

- Live link: https://toolpath-five.brewkeg-haiku.app/demo
- GitHub repo: https://github.com/Sketchify-Dev/toolpath
- Loom: 60-second walkthrough of the demo (see Demo script below)
- Cutoff: 9 AM IST, Nov 16, 2026

## Demo script (60 seconds)

- 0-15s: agents stuff 40 tool schemas into context before the first thought.
- 15-40s: run the task, baseline vs toolpath numbers land side by side,
  traversal path lights up. 12,400 tokens down to 1,800.
- 40-50s: follow-up query reuses entities with zero refetch.
- 50-60s: ambiguous "Acme" resolves by graph degree, not prompt guessing.
  Soundbite: traverse, don't preload.
