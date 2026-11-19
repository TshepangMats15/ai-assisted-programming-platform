import { Platform } from "react-native";
import { File } from "expo-file-system";
import { fetch as expoFetch } from "expo/fetch";
import * as ImageManipulator from "expo-image-manipulator";
import { getAuth } from "firebase/auth";
import { API_BASE_URL } from "../constants/api";

const IMAGE_TIMEOUT_MS = 120000;
const RUN_TIMEOUT_MS = 45000;

// ================= API URL =================

function buildApiUrl(path: string): string {
  const base = API_BASE_URL.replace(/\/+$/, "");

  return base.endsWith("/api")
    ? `${base}${path}`
    : `${base}/api${path}`;
}

// ================= AUTHENTICATION =================

async function authHeaders(): Promise<Record<string, string>> {
  const auth = getAuth();

  await auth.authStateReady();

  const user = auth.currentUser;

  if (!user) {
    throw new Error(
      "Your session has expired. Please sign in again."
    );
  }

  const token = await user.getIdToken();

  return {
    Authorization: `Bearer ${token}`,
  };
}

// ================= HTTP REQUEST =================

async function postWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
  what: string
): Promise<Response> {

  const controller = new AbortController();

  const timer = setTimeout(
    () => controller.abort(),
    timeoutMs
  );

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });

  } catch (error: any) {

    console.warn("[DevMate API ERROR]", {
      url,
      message: error?.message,
    });

    if (
      controller.signal.aborted ||
      error?.name === "AbortError"
    ) {
      throw new Error(
        `${what} timed out. Please try again.`
      );
    }

    throw new Error(
      `${what} failed: ${
        error?.message || "Network request failed"
      }`
    );

  } finally {
    clearTimeout(timer);
  }
}

// ================= ERROR HANDLING =================

async function readError(response: {
  text(): Promise<string>;
  status: number;
  statusText: string;
}): Promise<string> {

  const raw = await response.text();

  let message = raw || response.statusText;

  try {
    const data = JSON.parse(raw);

    if (typeof data?.error === "string") {
      message = data.error;
    } else if (typeof data?.message === "string") {
      message = data.message;
    }
  } catch {
    // Response was not JSON.
  }

  return `HTTP ${response.status}: ${message}`;
}

// ================= IMAGE ANALYSIS =================

export async function analyseCodeImage(
  imageUri: string,
  question?: string,
  mimeType?: string | null
): Promise<string> {

  if (!imageUri) {
    throw new Error("Please select an image first.");
  }

  console.log("[Image Analysis] Original image", {
    uri: imageUri,
    mimeType,
  });

  // Convert the image to a compressed JPEG.
  const processedImage =
    await ImageManipulator.manipulateAsync(
      imageUri,
      [
        {
          resize: {
            width: 1600,
          },
        },
      ],
      {
        compress: 0.8,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

  const form = new FormData();

  if (Platform.OS === "web") {

    const imageResponse = await fetch(
      processedImage.uri
    );

    const blob = await imageResponse.blob();

    form.append(
      "image",
      blob,
      "devmate-code-photo.jpg"
    );

  } else {

    // Use Expo's File implementation instead
    // of the legacy { uri, name, type } object.
    const imageFile = new File(processedImage.uri);

    if (!imageFile.exists) {
      throw new Error(
        "The processed image could not be found."
      );
    }

    if (imageFile.size > 8 * 1024 * 1024) {
      throw new Error(
        "Please select an image smaller than 8 MB."
      );
    }

    console.log("[Image Analysis] File ready", {
      size: imageFile.size,
      type: imageFile.type,
    });

    form.append(
      "image",
      imageFile,
      "devmate-code-photo.jpg"
    );
  }

  form.append(
    "question",
    question?.trim() ||
      "Explain this code and identify any errors."
  );

  const headers = await authHeaders();

  const endpoint = buildApiUrl(
    "/ai/analyse-image"
  );

  const controller = new AbortController();

  const timer = setTimeout(
    () => controller.abort(),
    IMAGE_TIMEOUT_MS
  );

  try {

    console.log(
      "[Image Analysis] Uploading to:",
      endpoint
    );

    // Expo fetch supports the Expo File object.
    const response = await expoFetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...headers,
      },
      body: form,
      signal: controller.signal,
    });

    console.log(
      "[Image Analysis] HTTP status:",
      response.status
    );

    if (!response.ok) {
      throw new Error(
        await readError(response)
      );
    }

    const data = await response.json();

    if (typeof data?.analysis !== "string") {
      throw new Error(
        "Unexpected response from image analysis."
      );
    }

    return data.analysis;

  } catch (error: any) {

    console.warn("[Image Analysis Error]", {
      name: error?.name,
      message: error?.message,
    });

    if (
      controller.signal.aborted ||
      error?.name === "AbortError"
    ) {
      throw new Error(
        "Image analysis timed out. Please try again."
      );
    }

    throw new Error(
      error?.message || "Image analysis failed."
    );

  } finally {
    clearTimeout(timer);
  }
}

// ================= CODE EXECUTION =================

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

  const headers = await authHeaders();

  const response = await postWithTimeout(
    buildApiUrl("/code/run"),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...headers,
      },
      body: JSON.stringify({
        language,
        sourceCode,
        stdin: stdin ?? "",
      }),
    },
    RUN_TIMEOUT_MS,
    "Running your code"
  );

  if (!response.ok) {
    throw new Error(
      await readError(response)
    );
  }

  return (await response.json()) as RunResult;
}

// ================= FORMAT CODE OUTPUT =================

export function formatRunResult(
  result: RunResult
): string {

  const parts: string[] = [];

  if (result.compileOutput?.trim()) {
    parts.push(
      `Compiler output:\n${result.compileOutput.trimEnd()}`
    );
  }

  if (result.stdout?.trim()) {
    parts.push(result.stdout.trimEnd());
  }

  if (result.stderr?.trim()) {
    parts.push(
      `Errors:\n${result.stderr.trimEnd()}`
    );
  }

  if (parts.length === 0) {
    parts.push(
      "(The program produced no output.)"
    );
  }

  const stats = result.time
    ? `${result.status} • ${result.time}s`
    : result.status;

  return `${parts.join("\n\n")}\n\n— ${stats}`;
}