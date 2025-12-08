// 1) take the backend root from env, no trailing slash
const API_ROOT = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";

// 2) final base URL always includes /api
const API_BASE_URL = API_ROOT ? `${API_ROOT}/api` : "/api";

// Debug: Log the raw environment variable value
console.log("🔍 DEBUG - VITE_API_URL (raw) =", import.meta.env.VITE_API_URL);
console.log("🔍 DEBUG - API_ROOT =", API_ROOT || "(not set)");
console.log("🔍 DEBUG - API_BASE_URL =", API_BASE_URL);

// Validate API URL configuration
if (!import.meta.env.VITE_API_URL) {
  console.error(
    "❌ ERROR: VITE_API_URL is not set! API calls will fail. " +
    "Set VITE_API_URL in Vercel environment variables to: https://stock-room.onrender.com"
  );
} else if (import.meta.env.VITE_API_URL.includes("/api")) {
  console.error(
    "❌ ERROR: VITE_API_URL should NOT include /api! " +
    `Current value: ${import.meta.env.VITE_API_URL}. ` +
    "Should be: https://stock-room.onrender.com (without /api)"
  );
}


const STORAGE_KEY_TOKEN = "stockroom_token";
const STORAGE_KEY_USER = "stockroom_user";

export const storage = {
  get token() {
    return localStorage.getItem(STORAGE_KEY_TOKEN);
  },
  set token(value) {
    if (value) {
      localStorage.setItem(STORAGE_KEY_TOKEN, value);
    } else {
      localStorage.removeItem(STORAGE_KEY_TOKEN);
    }
  },
  get user() {
    const value = localStorage.getItem(STORAGE_KEY_USER);
    return value ? JSON.parse(value) : null;
  },
  set user(value) {
    if (value) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(value));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  },
};

export const apiRequest = async (
  path,
  { method = "GET", data, token, headers } = {}
) => {
  const config = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  const authToken = token || storage.token;
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }

  if (data !== undefined) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, config);
  console.log("FETCH →", `${API_BASE_URL}${path}`);
  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = payload?.message || "Request failed";
    throw new Error(message);
  }

  return payload;
};

export const apiClient = {
  get: (path, options) => apiRequest(path, { ...options, method: "GET" }),
  post: (path, data, options) =>
    apiRequest(path, { ...options, method: "POST", data }),
  put: (path, data, options) =>
    apiRequest(path, { ...options, method: "PUT", data }),
  patch: (path, data, options) =>
    apiRequest(path, { ...options, method: "PATCH", data }),
  delete: (path, options) => apiRequest(path, { ...options, method: "DELETE" }),
};