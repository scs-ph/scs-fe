import { describe, expect, it, vi } from "vitest";

import { verifyBackendRelease } from "../../scripts/verify-backend-release.mjs";

const version = {
  repository: "scs-ph/scs-be",
  ref: "main",
  sha: "a".repeat(40),
};

interface ResponseOptions {
  ok?: boolean;
  status?: number;
  statusText?: string;
}

function response(
  payload: unknown,
  { ok = true, status = 200, statusText = "OK" }: ResponseOptions = {},
) {
  return {
    ok,
    status,
    statusText,
    json: async () => payload,
  };
}

describe("verifyBackendRelease", () => {
  it("accepts the current backend ref when its release gate succeeded", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(response({ sha: version.sha }))
      .mockResolvedValueOnce(
        response({
          check_runs: [
            {
              name: "backend-release-gate",
              status: "completed",
              conclusion: "success",
            },
          ],
        }),
      );

    await expect(
      verifyBackendRelease({
        version,
        token: "test-token",
        fetchImpl,
      }),
    ).resolves.toContain("Verified current backend-release-gate");
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("rejects a pin that no longer matches the configured backend ref", async () => {
    const currentSha = "b".repeat(40);
    const fetchImpl = vi.fn().mockResolvedValue(response({ sha: currentSha }));

    await expect(
      verifyBackendRelease({
        version,
        token: "test-token",
        fetchImpl,
      }),
    ).rejects.toThrow(
      `Backend pin is stale: scs-ph/scs-be@main is ${currentSha}`,
    );
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("rejects a current commit without a successful release gate", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(response({ sha: version.sha }))
      .mockResolvedValueOnce(
        response({
          check_runs: [
            {
              name: "backend-release-gate",
              status: "completed",
              conclusion: "failure",
            },
          ],
        }),
      );

    await expect(
      verifyBackendRelease({
        version,
        token: "test-token",
        fetchImpl,
      }),
    ).rejects.toThrow("does not have a successful backend-release-gate");
  });
});
