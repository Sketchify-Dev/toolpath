export interface MockTool {
  id: string;
  name: string;
  capability: string;
  description: string;
  latencyMs: number;
  schemaTokens: number;
}

export interface Capability {
  id: string;
  name: string;
}

export const CAPABILITIES: Capability[] = [
  { id: "cap:repo", name: "repos" },
  { id: "cap:pr", name: "pull requests" },
  { id: "cap:issue", name: "issues" },
  { id: "cap:ci", name: "ci" },
  { id: "cap:search", name: "search" },
  { id: "cap:docs", name: "docs" },
];

const T = (
  id: string,
  capability: string,
  description: string,
  latencyMs: number,
): MockTool => ({
  id,
  name: id,
  capability,
  description,
  latencyMs,
  schemaTokens: 300,
});

export const TOOLS: MockTool[] = [
  T("repo_resolve", "cap:repo", "Resolve a repo name to its id and default branch.", 120),
  T("repo_list", "cap:repo", "List repos visible to the caller.", 90),
  T("repo_metadata", "cap:repo", "Repo owner, stars, language.", 80),
  T("repo_search", "cap:repo", "Search repos by name fragment.", 150),
  T("repo_stats", "cap:repo", "Contributor and activity stats.", 130),
  T("pr_read", "cap:pr", "Read a PR title, body, author and state.", 180),
  T("pr_list", "cap:pr", "List PRs by state.", 140),
  T("pr_diff", "cap:pr", "Full diff with additions and deletions.", 220),
  T("pr_comments", "cap:pr", "Review comments on a PR.", 160),
  T("pr_review", "cap:pr", "Approvals and requested changes.", 200),
  T("pr_merge", "cap:pr", "Merge a PR.", 300),
  T("pr_label", "cap:pr", "Labels on a PR.", 110),
  T("issue_create", "cap:issue", "File a new issue.", 250),
  T("issue_read", "cap:issue", "Read an issue.", 150),
  T("issue_list", "cap:issue", "List issues by state.", 130),
  T("issue_comment", "cap:issue", "Comment on an issue.", 120),
  T("issue_close", "cap:issue", "Close an issue.", 140),
  T("issue_assign", "cap:issue", "Assign an issue.", 110),
  T("ci_status", "cap:ci", "Check runs on a ref.", 200),
  T("ci_logs", "cap:ci", "Failing job logs.", 260),
  T("ci_rerun", "cap:ci", "Re-run a workflow.", 320),
  T("test_run", "cap:ci", "Run the test suite.", 400),
  T("code_search", "cap:search", "Search code by symbol.", 170),
  T("docs_search", "cap:docs", "Search docs pages.", 160),
  T("deploy_status", "cap:ci", "Deployment health.", 190),
  T("deploy_trigger", "cap:ci", "Trigger a deploy.", 500),
  T("release_notes", "cap:docs", "Draft release notes.", 210),
  T("notify_slack", "cap:search", "Post to a channel.", 100),
  T("metrics_query", "cap:search", "Query a metric series.", 230),
  T("user_lookup", "cap:search", "Look up a user.", 90),
];

export const AMBIENT_PLATFORM_TOOLS = 10;

export const GOLDEN_TOOLS = ["repo_resolve", "pr_read", "issue_create"];

export const DEMO_TASK = "summarize PR #412 and file a follow-up issue";
export const FOLLOWUP_TASK = "what repo was that PR in?";

export function findTool(id: string): MockTool | undefined {
  return TOOLS.find((t) => t.id === id);
}
