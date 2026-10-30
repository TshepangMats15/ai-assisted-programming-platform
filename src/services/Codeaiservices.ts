import { Platform } from "react-native";
import { API_BASE_URL, getAuthToken } from "../constants/api";

const IMAGE_TIMEOUT_MS = 90000; // Render free instances can take a while to wake up
const RUN_TIMEOUT_MS = 45000;

// API_BASE_URL may or may not already end with /api.
function buildApiUrl(path: string): string {
  const base = API_BASE_URL.replace(/\/+$/, "");
  return base.endsWith("/api") ? `${base}${path}` : `${base}/api${path}`;
}

function authHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function postWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
  what: string
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(
        `${what} timed out. The server may be waking up, so please try again.`
      );
    }
    throw new Error(
      `Cannot reach the DevMate server. Check your internet connection and try again.`
    );
  } finally {
    clearTimeout(timer);
  }
}

async function readError(response: Response): Promise<string> {
  const raw = await response.text();
  try {
    const data = JSON.parse(raw);
    if (data && typeof data.error === "string") return data.error;
    if (data && typeof data.message === "string") return data.message;
  } catch {
    // not JSON
  }
  return raw || `${response.status} ${response.statusText}`;
}

function guessMimeType(uri: string, fallback?: string | null): string {
  if (fallback && fallback.startsWith("image/")) return fallback;
  const lower = uri.split("?")[0].toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

// ---------- Image analysis: POST /api/ai/analyse-image ----------

export async function analyseCodeImage(
  imageUri: string,
  question?: string,
  mimeType?: string | null
): Promise<string> {
  const type = guessMimeType(imageUri, mimeType);
  const extension = type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg";
  const fileName = `code-photo.${extension}`;

  const form = new FormData();

  if (Platform.OS === "web") {
    const blob = await (await fetch(imageUri)).blob();
    form.append("image", blob, fileName);
  } else {
    // React Native accepts { uri, name, type } as a file part.
    form.append("image", { uri: imageUri, name: fileName, type } as any);
  }

  if (question && question.trim()) {
    form.append("question", question.trim());
  }

  // Do NOT set Content-Type: fetch adds the multipart boundary itself.
  const response = await postWithTimeout(
    buildApiUrl("/ai/analyse-image"),
    { method: "POST", headers: { Accept: "application/json", ...authHeaders() }, body: form },
    IMAGE_TIMEOUT_MS,
    "Image analysis"
  );

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  const data = await response.json();
  if (!data || typeof data.analysis !== "string") {
    throw new Error("Unexpected response from the image analysis service.");
  }
  return data.analysis;
}

// ---------- Code execution: POST /api/code/run ----------

export interface RunResult {
  stdout: string;
  stderr: string;
  compileOutput: string;
  status: string;
  time: string;
  memory: number | null;
}

export async function runCode(
  language: string,
  sourceCode: string,
  stdin?: string
): Promise<RunResult> {
  const response = await postWithTimeout(
    buildApiUrl("/code/run"),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify({ language, sourceCode, stdin: stdin ?? "" }),
    },
    RUN_TIMEOUT_MS,
    "Running your code"
  );

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return (await response.json()) as RunResult;
}

export function formatRunResult(result: RunResult): string {
  const parts: string[] = [];

  if (result.compileOutput.trim()) {
    parts.push(`Compiler output:\n${result.compileOutput.trimEnd()}`);
  }
  if (result.stdout.trim()) {
    parts.push(result.stdout.trimEnd());
  }
  if (result.stderr.trim()) {
    parts.push(`Errors:\n${result.stderr.trimEnd()}`);
  }
  if (parts.length === 0) {
    parts.push("(The program produced no output.)");
  }

  const stats =
    result.time && result.time !== ""
      ? `${result.status} • ${result.time}s`
      : result.status;

  return `${parts.join("\n\n")}\n\n— ${stats}`;
}