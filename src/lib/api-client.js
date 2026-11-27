const SESSION_ERROR = "Your session has expired. Please sign in again.";

/**
 * Parse an API response and throw a friendly Error for non-2xx responses.
 * Handles HTML/error pages that cannot be parsed as JSON.
 */
export async function parseApiResponse(response, fallbackMessage = "Request failed.") {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) throw new Error(SESSION_ERROR);
    if (response.status === 403) {
      throw new Error(data.error || "You do not have permission to do that.");
    }

    throw new Error(data.error || fallbackMessage);
  }

  return data;
}

export function friendlyError(error, fallbackMessage = "Something went wrong.") {
  return error instanceof Error ? error.message : fallbackMessage;
}
