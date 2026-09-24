import fs from "node:fs";
import { pathToFileURL } from "node:url";

const GITHUB_API_ROOT = "https://api.github.com";

async function readGitHubJson(path, token, fetchImpl) {
  const response = await fetchImpl(`${GITHUB_API_ROOT}${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Unable to read backend evidence: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

export async function verifyBackendRelease({
  version,
  token,
  fetchImpl = fetch,
}) {
  if (!token) {
    throw new Error(
      "GH_TOKEN is required to verify the private backend release gate.",
    );
  }
  if (!version.repository || !version.ref || !version.sha) {
    throw new Error(
      "backend-version.json must include repository, ref, and sha.",
    );
  }

  const encodedRef = encodeURIComponent(version.ref);
  const currentRef = await readGitHubJson(
    `/repos/${version.repository}/commits/${encodedRef}`,
    token,
    fetchImpl,
  );
  if (currentRef.sha !== version.sha) {
    throw new Error(
      `Backend pin is stale: ${version.repository}@${version.ref} is ` +
        `${currentRef.sha}, but backend-version.json pins ${version.sha}.`,
    );
  }

  const payload = await readGitHubJson(
    `/repos/${version.repository}/commits/${version.sha}/check-runs?per_page=100`,
    token,
    fetchImpl,
  );
  const gates = payload.check_runs.filter(
    (check) => check.name === "backend-release-gate",
  );
  if (
    gates.length === 0 ||
    !gates.some(
      (check) => check.status === "completed" && check.conclusion === "success",
    )
  ) {
    throw new Error(
      `Backend ${version.sha} does not have a successful backend-release-gate.`,
    );
  }

  return (
    `Verified current backend-release-gate for ${version.repository}` +
    `@${version.ref} (${version.sha}).`
  );
}

export async function main() {
  const version = JSON.parse(
    fs.readFileSync(
      new URL("../backend-version.json", import.meta.url),
      "utf-8",
    ),
  );
  console.log(
    await verifyBackendRelease({
      version,
      token: process.env.GH_TOKEN,
    }),
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await main();
}
