/** @jest-environment node */
import { apiData, apiFetch } from "@/app/_lib/api.server";
import { getToken } from "@/app/_lib/session";
import { notFound, redirect } from "next/navigation";

jest.mock("server-only", () => ({}));
jest.mock("@/app/_lib/session", () => ({ getToken: jest.fn() }));
jest.mock("next/navigation", () => ({
  redirect: jest.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
  notFound: jest.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

const fetchMock = jest.fn();
global.fetch = fetchMock;

const reply = (status: number, body: unknown) =>
  fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(body), { status }));

beforeEach(() => {
  jest.clearAllMocks();
  process.env.API_URL = "http://api.test";
});

describe("apiFetch", () => {
  it("sends Bearer, Accept and JSON body; returns envelope data", async () => {
    (getToken as jest.Mock).mockResolvedValue("tok");
    reply(201, { success: true, message: "Employee created.", data: { employee: { id: 1 } } });

    const r = await apiFetch("/api/employees", { method: "POST", body: { first_name: "Maria" } });

    expect(r).toEqual({ ok: true, status: 201, message: "Employee created.", data: { employee: { id: 1 } } });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://api.test/api/employees");
    expect(init.method).toBe("POST");
    expect(init.headers).toMatchObject({
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer tok",
    });
    expect(init.body).toBe(JSON.stringify({ first_name: "Maria" }));
  });

  it("passes 422 field errors through", async () => {
    (getToken as jest.Mock).mockResolvedValue("tok");
    reply(422, { success: false, message: "The given data was invalid.", data: { errors: { email: ["Bad."] } } });

    const r = await apiFetch("/api/employees", { method: "POST", body: {} });

    expect(r).toEqual({ ok: false, status: 422, message: "The given data was invalid.", errors: { email: ["Bad."] } });
  });

  it("redirects to /auth/expired on 401 when a token was sent", async () => {
    (getToken as jest.Mock).mockResolvedValue("stale");
    reply(401, { success: false, message: "Unauthenticated.", data: null });

    await expect(apiFetch("/api/me")).rejects.toThrow("NEXT_REDIRECT");
    expect(redirect).toHaveBeenCalledWith("/auth/expired");
  });

  it("returns failure without redirect on 401 when no token was sent", async () => {
    (getToken as jest.Mock).mockResolvedValue(undefined);
    reply(401, { success: false, message: "Invalid credentials.", data: null });

    const r = await apiFetch("/api/login", { method: "POST", body: {} });

    expect(r).toEqual({ ok: false, status: 401, message: "Invalid credentials.", errors: undefined });
    expect(redirect).not.toHaveBeenCalled();
    expect(fetchMock.mock.calls[0][1].headers).not.toHaveProperty("Authorization");
  });

  it("throws on 5xx so the error boundary shows", async () => {
    (getToken as jest.Mock).mockResolvedValue("tok");
    reply(500, { success: false, message: "Server error.", data: null });

    await expect(apiFetch("/api/dashboard")).rejects.toThrow("API 500: Server error.");
  });

  it("sends FormData as-is without a JSON content type", async () => {
    (getToken as jest.Mock).mockResolvedValue("tok");
    reply(200, { success: true, message: "Imported 1 rows.", data: { created: 1, updated: 0, unknown: [] } });
    const body = new FormData();
    body.set("file", new Blob(["747,263"], { type: "text/csv" }), "report.csv");

    await apiFetch("/api/attendance/import", { method: "POST", body });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.body).toBe(body);
    expect(init.headers["Content-Type"]).toBeUndefined();
    expect(init.headers.Authorization).toBe("Bearer tok");
  });
});

describe("apiData", () => {
  it("returns data on success and calls notFound on 404", async () => {
    (getToken as jest.Mock).mockResolvedValue("tok");
    reply(200, { success: true, message: "OK", data: { x: 1 } });
    await expect(apiData("/api/x")).resolves.toEqual({ x: 1 });

    reply(404, { success: false, message: "Not Found", data: null });
    await expect(apiData("/api/x")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFound).toHaveBeenCalled();
  });
});
