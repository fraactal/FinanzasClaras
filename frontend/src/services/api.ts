const API_URL = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "http://localhost:8000/api" : "/api");

export function getToken(): string | null {
  return localStorage.getItem("finanzas_token");
}

export function setToken(token: string | null): void {
  if (token) {
    localStorage.setItem("finanzas_token", token);
  } else {
    localStorage.removeItem("finanzas_token");
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail ?? "No se pudo completar la solicitud.");
  }
  return data as T;
}
