export const DEFAULT_API_BASE = "http://localhost:4002";

export function apiBase(): string {
  const configured = process.env.NEXT_PUBLIC_API_BASE ?? "";
  const trimmed = configured.trim().replace(/\/+$/, "");

  return trimmed.length > 0 ? trimmed : DEFAULT_API_BASE;
}

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export type ApiFetchOptions = {
  method?: string;
  body?: string;
  token?: string | null;
  headers?: Record<string, string>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function readPayload(response: Response): Promise<unknown> {
  if (response.status === 204 || response.status === 205) {
    return null;
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json().catch(() => null);
  }

  const text = await response.text().catch(() => "");
  return text.length > 0 ? text : null;
}

function errorMessage(payload: unknown, status: number): string {
  if (isRecord(payload) && typeof payload.error === "string" && payload.error.length > 0) {
    return payload.error;
  }

  return `Request failed with status ${status}`;
}

export async function apiFetch<T>(
  path: string,
  { method = "GET", body, token, headers }: ApiFetchOptions = {},
): Promise<T> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const requestHeaders = new Headers(headers);

  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  if (body !== undefined && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  let response: Response;

  try {
    response = await fetch(`${apiBase()}${normalizedPath}`, {
      method,
      headers: requestHeaders,
      body,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network request failed";
    throw new ApiError(0, message);
  }

  const payload = await readPayload(response);

  if (!response.ok) {
    throw new ApiError(response.status, errorMessage(payload, response.status));
  }

  return payload as T;
}
