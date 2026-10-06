import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiFetch, refreshSession } from "@/lib/http/api-client";
import { getAccessToken, setAccessToken } from "@/lib/http/session";
import { queryClient } from "@/lib/query-client";
import { useAppStore } from "@/lib/store";

const USER = {
  id: 1,
  email: "analyst@demo.example",
  display_name: null,
  role: "client",
  client_id: "demo",
  client_name: "Demo",
};

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** Route fetch calls by path; each handler returns the next response for that path. */
function mockApi(routes: Record<string, () => Response | Promise<Response>>) {
  const calls: { path: string; headers: Headers }[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => {
      const path = new URL(url).pathname;
      calls.push({ path, headers: new Headers(init?.headers) });
      const handler = routes[path];
      if (!handler) throw new Error(`unexpected request ${path}`);
      return handler();
    }),
  );
  return calls;
}

beforeEach(() => {
  setAccessToken("old-token");
  useAppStore.getState().setUser({
    id: 1,
    email: USER.email,
    displayName: null,
    role: "client",
    clientId: "demo",
    clientName: "Demo",
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("apiFetch", () => {
  it("sends the access token and parses JSON", async () => {
    const calls = mockApi({ "/api/v1/dashboard/stats": () => json(200, { total: 3 }) });
    await expect(apiFetch("/api/v1/dashboard/stats")).resolves.toEqual({ total: 3 });
    expect(calls[0].headers.get("Authorization")).toBe("Bearer old-token");
    expect(calls[0].headers.get("X-Client-ID")).toBeNull(); // clients never send a tenant
  });

  it("refreshes once on 401 and retries with the new token", async () => {
    let stats = 0;
    const calls = mockApi({
      "/api/v1/dashboard/stats": () => (++stats === 1 ? json(401, {}) : json(200, { ok: true })),
      "/api/v1/auth/refresh": () => json(200, { token: "new-token", expires_in: 3600, user: USER }),
    });
    await expect(apiFetch("/api/v1/dashboard/stats")).resolves.toEqual({ ok: true });
    expect(calls.map((c) => c.path)).toEqual([
      "/api/v1/dashboard/stats",
      "/api/v1/auth/refresh",
      "/api/v1/dashboard/stats",
    ]);
    expect(calls[2].headers.get("Authorization")).toBe("Bearer new-token");
  });

  it("shares one refresh between concurrent 401s", async () => {
    let refreshes = 0;
    const seen = new Set<string>();
    mockApi({
      "/api/v1/a": () => (seen.has("a") ? json(200, {}) : (seen.add("a"), json(401, {}))),
      "/api/v1/b": () => (seen.has("b") ? json(200, {}) : (seen.add("b"), json(401, {}))),
      "/api/v1/auth/refresh": () => {
        refreshes += 1;
        return json(200, { token: "new-token", expires_in: 3600, user: USER });
      },
    });
    await Promise.all([apiFetch("/api/v1/a"), apiFetch("/api/v1/b")]);
    expect(refreshes).toBe(1);
  });

  it("ends the session when the retried request is still rejected", async () => {
    queryClient.setQueryData(["secret"], { leaked: true });
    mockApi({
      "/api/v1/dashboard/stats": () => json(401, {}),
      "/api/v1/auth/refresh": () => json(200, { token: "new-token", expires_in: 3600, user: USER }),
    });
    await expect(apiFetch("/api/v1/dashboard/stats")).rejects.toBeInstanceOf(ApiError);
    expect(useAppStore.getState().authStatus).toBe("anonymous");
    expect(getAccessToken()).toBeNull();
    expect(queryClient.getQueryData(["secret"])).toBeUndefined();
  });

  it("reads the API error envelope", async () => {
    mockApi({
      "/api/v1/x": () =>
        json(422, { error: { code: "VALIDATION_ERROR", message: "Unknown label" } }),
    });
    const error = await apiFetch("/api/v1/x").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(422);
    expect((error as ApiError).message).toBe("Unknown label");
  });

  it("reports network failures as status 0", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    const error = await apiFetch("/api/v1/x").catch((e: unknown) => e);
    expect((error as ApiError).status).toBe(0);
  });
});

describe("refreshSession", () => {
  it("signs out only when the server rejects the refresh token", async () => {
    mockApi({ "/api/v1/auth/refresh": () => json(401, {}) });
    await expect(refreshSession()).resolves.toBe("expired");
    expect(useAppStore.getState().authStatus).toBe("anonymous");
  });

  it.each([
    ["server error", () => json(502, {})],
    ["network error", () => Promise.reject(new TypeError("Failed to fetch"))],
  ])("keeps the session on %s", async (_, handler) => {
    mockApi({ "/api/v1/auth/refresh": handler });
    await expect(refreshSession()).resolves.toBe("unavailable");
    expect(useAppStore.getState().authStatus).toBe("authenticated");
    expect(getAccessToken()).toBe("old-token");
  });
});
