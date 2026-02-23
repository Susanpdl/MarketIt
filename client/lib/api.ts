const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export async function api<T>(
  path: string,
  options: RequestInit & { data?: unknown } = {}
): Promise<T> {
  const { data, ...init } = options;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    ...(data ? { body: JSON.stringify(data) } : {}),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Request failed");
  return json as T;
}

export const apiGet = <T>(path: string) => api<T>(path, { method: "GET" });
export const apiPost = <T>(path: string, data: unknown) => api<T>(path, { method: "POST", data });
export const apiPatch = <T>(path: string, data: unknown) => api<T>(path, { method: "PATCH", data });
export const apiPut = <T>(path: string, data: unknown) => api<T>(path, { method: "PUT", data });
