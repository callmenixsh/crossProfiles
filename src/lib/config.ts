// Public repo used for the "suggest a platform" links.
export const REPO_URL = "https://github.com/callmenixsh/crossprofiles";
export const REPO_ISSUES_URL = `${REPO_URL}/issues`;
export const AUTHOR_GITHUB_URL = "https://github.com/callmenixsh";

export function platformSuggestionUrl(): string {
  const params = new URLSearchParams({
    title: "Platform request: ",
    body: "## Platform\n\n<!-- Which platform would you like supported? -->\n\n## Notes\n\n- Public API / data source link:\n- What stats matter most:",
  });
  return `${REPO_ISSUES_URL}/new?${params.toString()}`;
}