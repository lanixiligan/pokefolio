import { getAnonId } from "./anonId";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Render's free tier sleeps when idle, so the first request after a pause
// can fail with a network error or a 502/503/504 while it wakes up. Render
// says waking takes about a minute, so the retries cover about 60 seconds.
const RETRY_DELAYS_MS = [2000, 4000, 8000, 16000, 30000];
const RETRYABLE_STATUSES = [502, 503, 504];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function apiRequest(endpoint, { onRetry, retry, ...options } = {}) {
  const anonId = getAnonId();
  const method = (options.method || "GET").toUpperCase();
  // Only retry requests that are safe to repeat: GETs, and any request
  // that opts in with `retry: true` because the server handles repeats.
  const retryDelays = method === "GET" || retry ? RETRY_DELAYS_MS : [];

  for (let attempt = 0; ; attempt++) {
    let response;

    try {
      response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          "X-Anon-Id": anonId,
          ...options.headers,
        },
      });
    } catch (error) {
      // fetch only throws on network failures (server asleep, offline).
      if (attempt < retryDelays.length) {
        onRetry?.(attempt + 1);
        await wait(retryDelays[attempt]);
        continue;
      }

      throw error;
    }

    if (RETRYABLE_STATUSES.includes(response.status) && attempt < retryDelays.length) {
      onRetry?.(attempt + 1);
      await wait(retryDelays[attempt]);
      continue;
    }

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
}

export async function getSets({ onRetry } = {}) {
  return apiRequest("/sets", { onRetry });
}

export async function getSet(setId) {
  return apiRequest(`/sets/${setId}`);
}

export async function getCards(setId, search) {
  const params = new URLSearchParams();

  if (setId && setId !== "all") {
    params.set("set", setId);
  }

  if (search) {
    params.set("search", search);
  }

  return apiRequest(`/cards?${params.toString()}`);
}

export async function getCardsBySet(setId, search) {
  return getCards(setId, search);
}

export async function getCard(cardId) {
  return apiRequest(`/cards/${cardId}`);
}

export async function getBinder() {
  return apiRequest("/binder");
}

// Safe to retry: the server only creates the binder if it doesn't exist yet.
export async function initializeBinder() {
  return apiRequest("/binder/initialize", {
    method: "POST",
    retry: true,
  });
}

export async function addCardToBinder({ cardId, spreadId, pageSide, position }) {
  return apiRequest("/binder/cards", {
    method: "POST",
    body: JSON.stringify({ cardId, spreadId, pageSide, position }),
  });
}

export async function removeCardFromBinder(cardId) {
  return apiRequest(`/binder/cards/${cardId}`, {
    method: "DELETE",
  });
}

// Moves a card to a destination slot. If the destination is already
// occupied, the backend swaps the two cards instead - the frontend
// doesn't need to know which will happen ahead of time.
export async function moveCardInBinder(cardId, { spreadId, pageSide, position }) {
  return apiRequest(`/binder/cards/${cardId}`, {
    method: "PATCH",
    body: JSON.stringify({ spreadId, pageSide, position }),
  });
}

export async function createBinderSpread() {
  return apiRequest("/binder/spreads", {
    method: "POST",
  });
}

export async function deleteBinderSpread(spreadId) {
  return apiRequest(`/binder/spreads/${spreadId}`, {
    method: "DELETE",
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