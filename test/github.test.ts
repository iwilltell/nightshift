
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchGitHubActivity,
  GitHubApiError
} from "../src/github.js";

describe("fetchGitHubActivity", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("rejects an empty username", async () => {
    await expect(
      fetchGitHubActivity("", "test-token")
    ).rejects.toThrow("GitHub username is required.");
  });

  it("rejects an empty token", async () => {
    await expect(
      fetchGitHubActivity("test-user", "")
    ).rejects.toThrow("GitHub token is required.");
  });

  it("rejects failed API responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: "Unauthorized"
      })
    );

    await expect(
      fetchGitHubActivity("test-user", "bad-token")
    ).rejects.toThrow("401 Unauthorized");
  });

  it("rejects GraphQL errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          errors: [{ message: "Resource not accessible" }]
        })
      })
    );

    await expect(
      fetchGitHubActivity("test-user", "test-token")
    ).rejects.toThrow("Resource not accessible");
  });

  it("rejects users that do not exist", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: { user: null } })
      })
    );

    await expect(
      fetchGitHubActivity("unknown-user", "test-token")
    ).rejects.toThrow('GitHub user "unknown-user" was not found.');
  });
});
