
import { API_BASE_URL } from "../constants/api";

const AI_TIMEOUT_MS = 90000;

export async function askAI(
  prompt: string,
  firebaseToken: string
): Promise<string> {
  const question = prompt.trim();

  if (!question) {
    throw new Error("Please enter a programming question.");
  }

  if (!firebaseToken) {
    throw new Error("Please sign in before using AI Assistance.");
  }

  // Remove trailing slashes from the backend URL.
  const baseUrl = API_BASE_URL.replace(/\/+$/, "");

  // Support backend URLs with or without /api.
  const endpoint = baseUrl.endsWith("/api")
    ? `${baseUrl}/ai/ask`
    : `${baseUrl}/api/ai/ask`;

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, AI_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/plain, application/json",
        Authorization: `Bearer ${firebaseToken}`,
      },
      body: JSON.stringify({
        prompt: question,
      }),
      signal: controller.signal,
    });

    const responseText = await response.text();

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(
          "Your login session could not be verified. Please sign in again."
        );
      }

      if (response.status === 403) {
        throw new Error(
          "You do not have permission to access DevMate AI."
        );
      }

      throw new Error(
        `AI backend error ${response.status}: ${
          responseText || response.statusText
        }`
      );
    }

    if (!responseText.trim()) {
      throw new Error(
        "The AI backend returned an empty response."
      );
    }

    const contentType =
      response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      let data: unknown;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          "The AI backend returned invalid JSON."
        );
      }

      if (typeof data === "string") {
        return data;
      }

      if (
        data &&
        typeof data === "object" &&
        "response" in data &&
        typeof data.response === "string"
      ) {
        return data.response;
      }

      throw new Error(
        "Unexpected AI response format from backend."
      );
    }

    return responseText;
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.name === "AbortError"
    ) {
      throw new Error(
        "The AI request timed out after 90 seconds. " +
          "Please try again."
      );
    }

    if (
      error instanceof TypeError ||
      (error instanceof Error &&
        /network connection|fetch failed|network request failed/i.test(
          error.message
        ))
    ) {
      throw new Error(
        `Cannot connect to the AI backend at ${endpoint}. ` +
          "Check your internet connection and Render deployment."
      );
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
