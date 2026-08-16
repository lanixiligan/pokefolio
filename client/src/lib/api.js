import { getAnonId } from "./anonId";

const API_BASE_URL = "http://localhost:5000/api";

async function apiRequest(endpoint, options = {}) {
  const anonId = getAnonId();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Anon-Id": anonId,
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;

    try {
      const errorData = await response.json();

      if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // Keep the default error message if the response is not JSON.
    }

    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function getSets() {
  return apiRequest("/sets");
}

export async function getBinder() {
  return apiRequest("/binder");
}

export async function initializeBinder() {
  return apiRequest("/binder/initialize", {
    method: "POST",
  });
}

export async function getPreferences() {
  return apiRequest("/preferences");
}

export async function updatePreferences(preferences) {
  return apiRequest("/preferences", {
    method: "PUT",
    body: JSON.stringify(preferences),
  });
}