import { apiGet, apiPost, apiPatch, apiDelete } from "./api";

describe("api", () => {
  const mockFetch = jest.fn();

  beforeEach(() => {
    mockFetch.mockReset();
    global.fetch = mockFetch;
    Object.defineProperty(global, "localStorage", {
      value: { getItem: jest.fn(() => null), setItem: jest.fn(), removeItem: jest.fn() },
      writable: true,
    });
  });

  it("apiGet sends GET request and returns JSON", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: "test" }),
    });

    const result = await apiGet<{ data: string }>("/api/test");
    expect(result).toEqual({ data: "test" });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/test"),
      expect.objectContaining({ method: "GET" })
    );
  });

  it("api includes Authorization header when token exists", async () => {
    const mockGetItem = jest.fn().mockReturnValue("fake-token");
    Object.defineProperty(global, "localStorage", {
      value: { getItem: mockGetItem, setItem: jest.fn(), removeItem: jest.fn() },
      writable: true,
    });
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    await apiGet("/api/protected");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer fake-token",
        }),
      })
    );
  });

  it("apiPost sends POST with JSON body", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: "1" }),
    });

    await apiPost("/api/items", { name: "Test" });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "Test" }),
      })
    );
  });

  it("throws on non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Something went wrong" }),
    });

    await expect(apiGet("/api/fail")).rejects.toThrow("Something went wrong");
  });

  it("throws generic message when error body is empty", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    await expect(apiGet("/api/fail")).rejects.toThrow("Request failed");
  });

  it("apiPatch sends PATCH with JSON body", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true }),
    });

    await apiPatch("/api/items/1", { name: "Updated" });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ name: "Updated" }),
      })
    );
  });

  it("apiDelete sends DELETE", async () => {
    const json = jest.fn();
    mockFetch.mockResolvedValueOnce({ ok: true, status: 204, json });

    await apiDelete("/api/items/1");
    expect(mockFetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ method: "DELETE" }));
    expect(json).not.toHaveBeenCalled();
  });
});
