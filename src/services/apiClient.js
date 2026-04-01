export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

export const buildApiUrl = (path = "") => `${API_BASE_URL}${path}`;

export const fetchJson = async (path, options = {}) => {
  const response = await fetch(buildApiUrl(path), options);
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload !== null
        ? payload.error || payload.message || `Request failed with status ${response.status}`
        : payload || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload;
};
