/**
 * DevMate Frontend API Service
 *
 * - All services talk to the Spring Boot backend.
 * - Course Management can still run locally (no backend) by setting
 *   EXPO_PUBLIC_USE_LOCAL_COURSEWORK=true in your .env file.
 *   By default it now uses the backend.
 * - Requests time out after 60 seconds (Render free instances can take
 *   30-60 seconds to wake up) and show readable error messages.
 * - The auth token is saved on the device so it survives app reloads.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://devmate-backend-lsxo.onrender.com/api";

// Temporary offline mode for Admin Course Management.
// Default is false so Course Management uses the backend.
const USE_LOCAL_COURSEWORK =
  process.env.EXPO_PUBLIC_USE_LOCAL_COURSEWORK === "true";

const COURSEWORK_STORAGE_KEY = "devmate_admin_coursework";
const AUTH_TOKEN_STORAGE_KEY = "devmate_auth_token";

// Render free instances can take a long time to wake up
const REQUEST_TIMEOUT_MS = 60000;

// ================= DTO TYPES =================

export interface SubmissionRequest {
  assessmentId: number;
  sourceCode: string;
  attemptNumber?: number;
}

export interface SubmissionResponse {
  submissionId: number;
  message: string;
  submittedAt: string;
}

export interface SubmissionRecord {
  submissionId: number;
  sourceCode: string;
  submissionTime: string;
  score: number | null;
  user?: {
    id: string;
    fullName: string;
    email: string;
  };
  assessment?: {
    assessmentID: number;
    title: string;
    programLang: string;
  };
}

export interface ResultRequest {
  userId: string;
  assessmentId: number;
  score: number;
  completionTime: number;
  aiUsage: number;
}

export interface ResultResponse {
  resultId: number;
  message: string;
  createdAt: string;
}

export interface ResultRecord {
  resultId: number;
  userId: string;
  assessmentId: number;
  score: number;
  completionTime: number;
  aiUsage: number;
  submittedAt: string;
  // Optional fields the Results screen can display when the backend sends them
  studentName?: string;
  course?: string;
  assessmentTitle?: string;
  grade?: string;
}

export interface AssessmentDTO {
  assessmentID?: number;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard" | string;
  programLang: string;
  timeLimit: number;
}

export interface CourseworkDTO {
  courseID: string;
  title: string;
  module: string;
  description: string;
  dueDate: string;
  createdBy: string;
  assessment?: AssessmentDTO | null;
}

export interface AIInteractionDTO {
  interactionID?: number;
  userID: string;
  assessmentID: number;
  prompt: string;
  response?: string;
  timestamp?: string;
}

export interface AnalyticsSummary {
  totalAssessments?: number;
  totalSubmissions?: number;
  averageScore?: number;
  totalAiInteractions?: number;
  avgSimilarityScore?: number;
  [key: string]: any;
}

export interface AnnouncementDTO {
  id?: string | number;
  title: string;
  message: string;
  audience: string;
  createdAt?: string;
}

export interface UserDTO {
  id?: string | number;
  fullName?: string;
  email?: string;
  course?: string;
  status?: string;
  role?: string;
  [key: string]: any;
}

// ================= AUTH TOKEN =================

let authToken: string | null = null;
let tokenLoaded = false;

// Call this after login (and again whenever the token refreshes).
// Pass null on logout.
export function setAuthToken(token: string | null) {
  authToken = token;
  tokenLoaded = true;

  if (token) {
    AsyncStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token).catch(
      () => {}
    );
  } else {
    AsyncStorage.removeItem(AUTH_TOKEN_STORAGE_KEY).catch(
      () => {}
    );
  }
}

export function getAuthToken(): string | null {
  return authToken;
}

// Restore a saved token the first time a request is made
async function ensureTokenLoaded(): Promise<void> {
  if (tokenLoaded) {
    return;
  }

  tokenLoaded = true;

  try {
    const stored = await AsyncStorage.getItem(
      AUTH_TOKEN_STORAGE_KEY
    );

    if (stored && !authToken) {
      authToken = stored;
    }
  } catch {}
}

// ================= HTTP CLIENT =================

export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  await ensureTokenLoaded();

  const url = `${API_BASE_URL}${
    endpoint.startsWith("/") ? endpoint : `/${endpoint}`
  }`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const controller = new AbortController();

  const timer = setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS
  );

  let response: Response;

  try {
    response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
  } catch (error: any) {
    if (__DEV__) {
      console.warn(
        `[api] ${options.method ?? "GET"} ${url} failed:`,
        error
      );
    }

    if (error?.name === "AbortError") {
      throw new Error(
        "The server took too long to respond. It may be starting up, so please try again in a moment."
      );
    }

    throw new Error(
      "Could not reach the server. Check your internet connection and the API URL."
    );
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}`;

    if (response.status === 401) {
      errorMessage =
        "You are not signed in, or your session has expired.";
    } else if (response.status === 403) {
      errorMessage =
        "You do not have permission to access this resource.";
    } else if (response.status === 404) {
      errorMessage =
        "This feature is not available on the server yet (404).";
    }

    try {
      const errorBody = await response.json();

      errorMessage =
        errorBody.message ||
        errorBody.error ||
        JSON.stringify(errorBody);
    } catch {
      try {
        const textBody = await response.text();

        if (textBody) {
          errorMessage = textBody;
        }
      } catch {}
    }

    if (__DEV__) {
      console.warn(
        `[api] ${options.method ?? "GET"} ${url} -> ${response.status}: ${errorMessage}`
      );
    }

    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return {} as T;
  }

  const contentType = response.headers.get("content-type");

  if (
    contentType &&
    contentType.includes("application/json")
  ) {
    return response.json();
  }

  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    return text as unknown as T;
  }
}

// ================= LOCAL COURSEWORK =================

// Read courses stored on the device
async function getLocalCourses(): Promise<CourseworkDTO[]> {
  const stored = await AsyncStorage.getItem(
    COURSEWORK_STORAGE_KEY
  );

  if (!stored) {
    return [];
  }

  const courses = JSON.parse(stored);

  if (!Array.isArray(courses)) {
    throw new Error("Invalid saved coursework data.");
  }

  return courses;
}

// Save courses on the device
async function saveLocalCourses(
  courses: CourseworkDTO[]
): Promise<void> {
  await AsyncStorage.setItem(
    COURSEWORK_STORAGE_KEY,
    JSON.stringify(courses)
  );
}

// ================= API SERVICES =================

export const api = {
  submissions: {
    submitCode: (
      data: SubmissionRequest
    ): Promise<SubmissionResponse> =>
      request<SubmissionResponse>("/submissions", {
        method: "POST",
        body: JSON.stringify({
          assessmentId: data.assessmentId,
          sourceCode: data.sourceCode,
          attemptNumber: data.attemptNumber ?? 1,
        }),
      }),

    getAll: (): Promise<SubmissionRecord[]> =>
      request<SubmissionRecord[]>("/submissions", {
        method: "GET",
      }),

    getUserSubmissions: (
      userId: string
    ): Promise<SubmissionRecord[]> =>
      request<SubmissionRecord[]>(
        `/submissions/user/${encodeURIComponent(userId)}`,
        { method: "GET" }
      ),
  },

  results: {
    createResult: (
      data: ResultRequest
    ): Promise<ResultResponse> =>
      request<ResultResponse>("/results", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    getAll: (): Promise<ResultRecord[]> =>
      request<ResultRecord[]>("/results", {
        method: "GET",
      }),

    getUserResults: (
      userId: string
    ): Promise<ResultRecord[]> =>
      request<ResultRecord[]>(
        `/results/user/${encodeURIComponent(userId)}`,
        { method: "GET" }
      ),
  },

  assessments: {
    getAll: (): Promise<AssessmentDTO[]> =>
      request<AssessmentDTO[]>("/assessments", {
        method: "GET",
      }),

    getById: (id: number): Promise<AssessmentDTO> =>
      request<AssessmentDTO>(`/assessments/${id}`, {
        method: "GET",
      }),

    create: (
      data: AssessmentDTO
    ): Promise<AssessmentDTO> =>
      request<AssessmentDTO>("/assessments", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (
      id: number,
      data: Partial<AssessmentDTO>
    ): Promise<AssessmentDTO> =>
      request<AssessmentDTO>(`/assessments/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    delete: (id: number): Promise<void> =>
      request<void>(`/assessments/${id}`, {
        method: "DELETE",
      }),
  },

  // ================= COURSEWORK =================

  coursework: {
    // Get all courses
    getAll: async (): Promise<CourseworkDTO[]> => {
      if (USE_LOCAL_COURSEWORK) {
        return getLocalCourses();
      }

      return request<CourseworkDTO[]>("/coursework", {
        method: "GET",
      });
    },

    // Get one course
    getById: async (
      id: string
    ): Promise<CourseworkDTO> => {
      if (USE_LOCAL_COURSEWORK) {
        const courses = await getLocalCourses();

        const course = courses.find(
          (item) => item.courseID === id
        );

        if (!course) {
          throw new Error("Course not found.");
        }

        return course;
      }

      return request<CourseworkDTO>(
        `/coursework/${encodeURIComponent(id)}`,
        { method: "GET" }
      );
    },

    // Create course
    create: async (
      data: CourseworkDTO
    ): Promise<CourseworkDTO> => {
      if (USE_LOCAL_COURSEWORK) {
        const courses = await getLocalCourses();

        const existing = courses.find(
          (item) => item.courseID === data.courseID
        );

        if (existing) {
          throw new Error(
            "A course with this Course ID already exists."
          );
        }

        const newCourse: CourseworkDTO = {
          ...data,
        };

        courses.push(newCourse);

        await saveLocalCourses(courses);

        return newCourse;
      }

      return request<CourseworkDTO>("/coursework", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    // Update course
    update: async (
      id: string,
      data: Partial<CourseworkDTO>
    ): Promise<CourseworkDTO> => {
      if (USE_LOCAL_COURSEWORK) {
        const courses = await getLocalCourses();

        const index = courses.findIndex(
          (item) => item.courseID === id
        );

        if (index === -1) {
          throw new Error("Course not found.");
        }

        const updatedCourse: CourseworkDTO = {
          ...courses[index],
          ...data,
          courseID: id,
        };

        courses[index] = updatedCourse;

        await saveLocalCourses(courses);

        return updatedCourse;
      }

      return request<CourseworkDTO>(
        `/coursework/${encodeURIComponent(id)}`,
        {
          method: "PUT",
          body: JSON.stringify(data),
        }
      );
    },

    // Delete course
    delete: async (id: string): Promise<void> => {
      if (USE_LOCAL_COURSEWORK) {
        const courses = await getLocalCourses();

        const existing = courses.find(
          (item) => item.courseID === id
        );

        if (!existing) {
          throw new Error("Course not found.");
        }

        const updatedCourses = courses.filter(
          (item) => item.courseID !== id
        );

        await saveLocalCourses(updatedCourses);

        return;
      }

      return request<void>(
        `/coursework/${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );
    },
  },

  // ================= ANNOUNCEMENTS =================

  announcements: {
    getAll: (): Promise<AnnouncementDTO[]> =>
      request<AnnouncementDTO[]>("/announcements", {
        method: "GET",
      }),

    create: (
      data: AnnouncementDTO
    ): Promise<AnnouncementDTO> =>
      request<AnnouncementDTO>("/announcements", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (
      id: string | number,
      data: Partial<AnnouncementDTO>
    ): Promise<AnnouncementDTO> =>
      request<AnnouncementDTO>(
        `/announcements/${encodeURIComponent(String(id))}`,
        {
          method: "PUT",
          body: JSON.stringify(data),
        }
      ),

    delete: (id: string | number): Promise<void> =>
      request<void>(
        `/announcements/${encodeURIComponent(String(id))}`,
        { method: "DELETE" }
      ),
  },

  // ================= AI =================

  ai: {
    ask: (prompt: string): Promise<string> =>
      request<string>("/ai/ask", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      }),

    geminiAsk: (
      prompt: string
    ): Promise<{ response: string }> =>
      request<{ response: string }>("/gemini/ask", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      }),

    submitPrompt: (data: {
      userID: string;
      assessmentID: number;
      prompt: string;
    }): Promise<AIInteractionDTO> =>
      request<AIInteractionDTO>("/ai/prompt", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    getUserInteractions: (
      userId: string
    ): Promise<AIInteractionDTO[]> =>
      request<AIInteractionDTO[]>(
        `/ai/interactions/user/${encodeURIComponent(userId)}`,
        { method: "GET" }
      ),
  },

  // ================= ANALYTICS =================

  analytics: {
    getSummary: (): Promise<AnalyticsSummary> =>
      request<AnalyticsSummary>("/analytics/summary", {
        method: "GET",
      }),

    getAiUsage: (): Promise<any[]> =>
      request<any[]>("/analytics/ai-usage", {
        method: "GET",
      }),

    getDailyAiUsage: (): Promise<any> =>
      request<any>("/analytics/ai-usage/daily", {
        method: "GET",
      }),

    getUserAnalytics: (userId: string): Promise<any> =>
      request<any>(
        `/analytics/user/${encodeURIComponent(userId)}`,
        { method: "GET" }
      ),

    getStudentAnalytics: (userId: string): Promise<any> =>
      request<any>(
        `/analytics/student/${encodeURIComponent(userId)}`,
        { method: "GET" }
      ),
  },

  // ================= USERS =================

  users: {
    getAll: (): Promise<UserDTO[]> =>
      request<UserDTO[]>("/users", {
        method: "GET",
      }),

    getById: (id: string): Promise<UserDTO> =>
      request<UserDTO>(
        `/users/${encodeURIComponent(id)}`,
        { method: "GET" }
      ),

    create: (data: UserDTO): Promise<UserDTO> =>
      request<UserDTO>("/users", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (
      id: string,
      data: Partial<UserDTO>
    ): Promise<UserDTO> =>
      request<UserDTO>(
        `/users/${encodeURIComponent(id)}`,
        {
          method: "PUT",
          body: JSON.stringify(data),
        }
      ),

    delete: (id: string): Promise<void> =>
      request<void>(`/users/${encodeURIComponent(id)}`, {
        method: "DELETE",
      }),
  },

  // ================= AUTH =================

  auth: {
    verifyToken: (
      token: string
    ): Promise<{ uid: string; message: string }> =>
      request<{ uid: string; message: string }>(
        "/auth/verify",
        {
          method: "POST",
          body: JSON.stringify({ token }),
        }
      ),
  },
};

export default api;