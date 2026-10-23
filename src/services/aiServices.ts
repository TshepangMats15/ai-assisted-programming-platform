
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

  // API_BASE_URL may already end with /api.
  const baseUrl = API_BASE_URL.replace(/\/+$/, "");
  const endpoint = baseUrl.endsWith("/api")
    ? `${baseUrl}/ai/ask`
    : `${baseUrl}/api/ai/ask`;

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    AI_TIMEOUT_MS
  );

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/plain, application/json",
        Authorization: `Bearer ${firebaseToken}`,
      },
      body: JSON.stringify({ prompt: question }),
      signal: controller.signal,
    });

    const text = await response.text();

    if (!response.ok) {
      throw new Error(
        `AI backend error ${response.status}: ${
          text || response.statusText
        }`
      );
    }

    if (!text.trim()) {
      throw new Error("The AI backend returned an empty response.");
    }

    const contentType =
      response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      let data: unknown;

      try {
        data = JSON.parse(text);
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

    return text;
  } catch (error) {
    if (
      error instanceof Error &&
      error.name === "AbortError"
    ) {
      throw new Error(
        "The AI request timed out after 90 seconds. " +
          "Check whether the Render backend is running."
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
