/**
 * DevMate Frontend API Service
 *
 * Backend:
 * https://devmate-backend-lsxo.onrender.com/api
 *
 * Handles:
 * - API requests
 * - JSON serialisation
 * - Authentication token
 * - Error handling
 * - DTO alignment
 */

import { auth } from "../services/firebase";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://devmate-backend-lsxo.onrender.com/api";

// =========================================================
// DTO TYPES
// =========================================================

export interface SubmissionRequest {
  assessmentId: number;
  sourceCode: string;
  attemptNumber?: number;
  userId?: string;
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
}

// =========================================================
// QUESTIONS
// =========================================================

export interface QuestionDTO {
  questionID: string;
  questionType: "MULTIPLE_CHOICE" | "CODING_CHALLENGE" | string;
  prompt: string;
  optionsJson?: string | null;
  correctAnswer?: string | null;
  starterCode?: string | null;
}

// =========================================================
// ASSESSMENTS
// =========================================================

export interface AssessmentDTO {
  assessmentID?: number;
  title: string;
  description?: string | null;
  difficulty?: "Easy" | "Medium" | "Hard" | string | null;
  programLang?: string | null;
  timeLimit?: number | null;
  assessmentType?: "PRE_TEST" | "POST_TEST" | string;
  aiAllowed?: boolean;
  questions?: QuestionDTO[];
}

// =========================================================
// LESSONS
// =========================================================

export interface LessonDTO {
  lessonID: string;
  title: string;
  contentType: "READING" | "VIDEO" | "CODE_LAB" | string;
  contentBody?: string | null;
}

// =========================================================
// COURSEWORK
// =========================================================

export interface CourseworkDTO {
  courseID: string;
  title: string;
  module?: string | null;
  description?: string | null;
  dueDate?: string | null;
  createdBy: string;

  preAssessment?: AssessmentDTO | null;
  postAssessment?: AssessmentDTO | null;
  lessons?: LessonDTO[];
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

export interface ReportsAnalytics {
  assessments: number;
  submissions: number;
  averageScore: number;
  aiInteractions: number;
  resultsRecorded: number;
}

export interface AnnouncementDTO {
  id?: string | number;
  title: string;
  message: string;
  audience: string;
  createdAt?: string;
}

// =========================================================
// HTTP CLIENT
// =========================================================

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  let cleanBaseUrl = API_BASE_URL.replace(/\/+$/, "");
  let cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  // Prevent duplicate /api/api path segments
  if (cleanBaseUrl.endsWith("/api") && cleanEndpoint.startsWith("/api/")) {
    cleanEndpoint = cleanEndpoint.replace(/^\/api/, "");
  }

  const url = `${cleanBaseUrl}${cleanEndpoint}`;

  // Automatically refresh or acquire token from Firebase if not manually supplied
  if (!authToken && auth.currentUser) {
    try {
      authToken = await auth.currentUser.getIdToken();
    } catch {
      // Fallback if network or Firebase is unavailable
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  if (auth.currentUser?.uid) {
    headers["X-User-ID"] = auth.currentUser.uid;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const responseText = await response.text();

      let message = responseText;

      try {
        const parsed = JSON.parse(responseText);

        message =
          parsed.message ||
          parsed.error ||
          responseText;
      } catch {
        // Non-JSON error response
      }

      throw new Error(
        `HTTP ${response.status}: ${
          message || response.statusText
        }`
      );
    }

    const contentType = response.headers.get("content-type");

    if (
      contentType &&
      contentType.includes("application/json")
    ) {
      return (await response.json()) as T;
    }

    const text = await response.text();

    try {
      return JSON.parse(text) as T;
    } catch {
      return text as unknown as T;
    }
  } catch (error: any) {
    console.error(`[API] Request failed: ${url}`, error);
    throw error;
  }
}

// =========================================================
// API SERVICES
// =========================================================

export const api = {
  // =======================================================
  // SUBMISSIONS
  // =======================================================

  submissions: {
    submitCode: (
      data: SubmissionRequest
    ): Promise<SubmissionResponse> => {
      const currentUserId =
        data.userId || auth.currentUser?.uid || "student-user";

      return request<SubmissionResponse>("/submissions", {
        method: "POST",
        body: JSON.stringify({
          assessmentId: data.assessmentId,
          sourceCode: data.sourceCode,
          attemptNumber: data.attemptNumber ?? 1,
          userId: currentUserId,
        }),
      });
    },

    getAll: (): Promise<SubmissionRecord[]> =>
      request<SubmissionRecord[]>("/submissions", {
        method: "GET",
      }),

    getUserSubmissions: (
      userId: string
    ): Promise<SubmissionRecord[]> =>
      request<SubmissionRecord[]>(
        `/submissions/user/${encodeURIComponent(userId)}`,
        {
          method: "GET",
        }
      ),
  },

  // =======================================================
  // RESULTS
  // =======================================================

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
        {
          method: "GET",
        }
      ),
  },

  // =======================================================
  // ASSESSMENTS
  // =======================================================

  assessments: {
    getAll: (): Promise<AssessmentDTO[]> =>
      request<AssessmentDTO[]>("/assessments", {
        method: "GET",
      }),

    getById: (id: number): Promise<AssessmentDTO> =>
      request<AssessmentDTO>(`/assessments/${id}`, {
        method: "GET",
      }),

    getQuestions: (
      id: number
    ): Promise<QuestionDTO[]> =>
      request<QuestionDTO[]>(
        `/assessments/${id}/questions`,
        {
          method: "GET",
        }
      ),

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

  // =======================================================
  // COURSEWORK
  // =======================================================

  coursework: {
    getAll: (): Promise<CourseworkDTO[]> =>
      request<CourseworkDTO[]>("/coursework", {
        method: "GET",
      }),

    /**
     * Gets one course.
     *
     * When userId is supplied, the backend applies
     * pre-assessment gating.
     */
    getById: (
      courseID: string,
      userId?: string
    ): Promise<CourseworkDTO> => {
      const coursePath =
        `/coursework/${encodeURIComponent(courseID)}`;

      const endpoint = userId
        ? `${coursePath}?userId=${encodeURIComponent(userId)}`
        : coursePath;

      return request<CourseworkDTO>(endpoint, {
        method: "GET",
      });
    },

    create: (
      data: CourseworkDTO
    ): Promise<CourseworkDTO> =>
      request<CourseworkDTO>("/coursework", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (
      courseID: string,
      data: Partial<CourseworkDTO>
    ): Promise<CourseworkDTO> =>
      request<CourseworkDTO>(
        `/coursework/${encodeURIComponent(courseID)}`,
        {
          method: "PUT",
          body: JSON.stringify(data),
        }
      ),

    delete: (
      courseID: string
    ): Promise<void> =>
      request<void>(
        `/coursework/${encodeURIComponent(courseID)}`,
        {
          method: "DELETE",
        }
      ),
  },

  // =======================================================
  // LESSONS
  // =======================================================

  lessons: {
    getAll: (): Promise<LessonDTO[]> =>
      request<LessonDTO[]>("/lessons", {
        method: "GET",
      }),

    getById: (
      lessonID: string
    ): Promise<LessonDTO> =>
      request<LessonDTO>(
        `/lessons/${encodeURIComponent(lessonID)}`,
        {
          method: "GET",
        }
      ),

    getByCourse: (
      courseID: string
    ): Promise<LessonDTO[]> =>
      request<LessonDTO[]>(
        `/lessons/course/${encodeURIComponent(courseID)}`,
        {
          method: "GET",
        }
      ),

    create: (
      courseID: string,
      lesson: LessonDTO
    ): Promise<LessonDTO> =>
      request<LessonDTO>(
        `/lessons/course/${encodeURIComponent(courseID)}`,
        {
          method: "POST",
          body: JSON.stringify(lesson),
        }
      ),

    update: (
      lessonID: string,
      lesson: Partial<LessonDTO>
    ): Promise<LessonDTO> =>
      request<LessonDTO>(
        `/lessons/${encodeURIComponent(lessonID)}`,
        {
          method: "PUT",
          body: JSON.stringify(lesson),
        }
      ),

    delete: (
      lessonID: string
    ): Promise<void> =>
      request<void>(
        `/lessons/${encodeURIComponent(lessonID)}`,
        {
          method: "DELETE",
        }
      ),
  },

  // =======================================================
  // ANNOUNCEMENTS
  // =======================================================

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

    delete: (
      id: string | number
    ): Promise<void> =>
      request<void>(
        `/announcements/${encodeURIComponent(String(id))}`,
        {
          method: "DELETE",
        }
      ),
  },

  // =======================================================
  // AI
  // =======================================================

  ai: {
    ask: (prompt: string): Promise<string> =>
      request<string>("/ai/ask", {
        method: "POST",
        body: JSON.stringify({
          prompt,
        }),
      }),

    geminiAsk: (
      prompt: string
    ): Promise<{ response: string }> =>
      request<{ response: string }>("/gemini/ask", {
        method: "POST",
        body: JSON.stringify({
          prompt,
        }),
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
        {
          method: "GET",
        }
      ),
  },

  // =======================================================
  // ANALYTICS
  // =======================================================

  analytics: {
    // Reports Screen
    // GET /api/analytics/reports
    getReports: (): Promise<ReportsAnalytics> =>
      request<ReportsAnalytics>("/analytics/reports", {
        method: "GET",
      }),

    // Existing Analytics Summary
    // GET /api/analytics/summary
    getSummary: (): Promise<AnalyticsSummary> =>
      request<AnalyticsSummary>("/analytics/summary", {
        method: "GET",
      }),

    // AI Usage
    // GET /api/analytics/ai-usage
    getAiUsage: (): Promise<any[]> =>
      request<any[]>("/analytics/ai-usage", {
        method: "GET",
      }),

    // Daily AI Usage
    // GET /api/analytics/ai-usage/daily
    getDailyAiUsage: (): Promise<any> =>
      request<any>("/analytics/ai-usage/daily", {
        method: "GET",
      }),

    // Individual User Analytics
    getUserAnalytics: (
      userId: string
    ): Promise<any> =>
      request<any>(
        `/analytics/user/${encodeURIComponent(userId)}`,
        {
          method: "GET",
        }
      ),
  },

  // =======================================================
  // USERS
  // =======================================================

  users: {
    getAll: (): Promise<any[]> =>
      request<any[]>("/users", {
        method: "GET",
      }),

    getById: (id: string): Promise<any> =>
      request<any>(
        `/users/${encodeURIComponent(id)}`,
        {
          method: "GET",
        }
      ),

    create: (data: any): Promise<any> =>
      request<any>("/users", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (id: string, data: any): Promise<any> =>
      request<any>(`/users/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    delete: (id: string): Promise<void> =>
      request<void>(`/users/${encodeURIComponent(id)}`, {
        method: "DELETE",
      }),
  },

  // =======================================================
  // AUTH
  // =======================================================

  auth: {
    verifyToken: (
      token: string
    ): Promise<{
      uid: string;
      message: string;
    }> =>
      request<{
        uid: string;
        message: string;
      }>("/auth/verify", {
        method: "POST",
        body: JSON.stringify({
          token,
        }),
      }),
  },
};

export default api;
