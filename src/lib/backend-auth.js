"use client";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const REFRESH_WINDOW_MS = 60 * 1000;

let tokenExpiresAtMs = 0;
let refreshPromise = null;

async function refreshToken(force = false) {
  if (!force && tokenExpiresAtMs > Date.now() + REFRESH_WINDOW_MS) {
    return;
  }

  if (refreshPromise) return refreshPromise;

  refreshPromise = fetch("/api/auth/backend-token", {
    method: "POST",
    credentials: "same-origin",
  })
    .then(async (response) => {
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        tokenExpiresAtMs = 0;
        throw new Error(data.error || "Unable to start a secure backend session.");
      }

      const expiresAt = Date.parse(data.expiresAt);
      tokenExpiresAtMs = Number.isFinite(expiresAt) ? expiresAt : 0;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

function buildUrl(path) {
  if (/^https?:\/\//i.test(path)) return path;

  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function backendFetch(path, options = {}) {
  await refreshToken();

  const request = () => {
    const headers = new Headers(options.headers || {});

    if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    return fetch(buildUrl(path), {
      ...options,
      headers,
      credentials: "include",
    });
  };

  let response = await request();

  if (response.status === 401) {
    await refreshToken(true);
    response = await request();
  }

  return response;
}

export async function backendApi(path, options = {}) {
  const response = await backendFetch(path, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "The request could not be completed.");
  }

  return data;
}

export async function clearBackendToken() {
  tokenExpiresAtMs = 0;

  await fetch("/api/auth/backend-token", {
    method: "DELETE",
    credentials: "same-origin",
  }).catch(() => {});
}
