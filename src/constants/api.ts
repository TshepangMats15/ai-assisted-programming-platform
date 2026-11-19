/**
 * DevMate Frontend API Service
 *
 * Backend:
 * https\://devmate-backend-lsxo.onrender.com/api
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
  "https\://devmate-backend-lsxo.onrender.com/api";
// =========================================================
// DTO TYPES
// =========================================================
export interface UserDTO {
  id: string;
  firebaseUid: string;
  fullName: string;
  email: string;
  role: "STUDENT" | "ADMIN";
  lastActive: string | null;
}

export interface SubmissionRequest {
  assessmentId: number;
  sourceCode?: string | null;
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
  status?: "DRAFT" | "SUBMITTED" | "GRADING" | "GRADED";
  savedAt?: string | null;
  submittedAt?: string | null;
  gradedAt?: string | null;
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
  audience?: string;
  createdAt?: string;
}

export interface AnnouncementRequest {
  title: string;
  message: string;
}
// =========================================================
// HTTP CLIENT
// =========================================================
// Legacy token helpers retained for source compatibility.
// Requests authenticate only through the current Firebase user.
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
  // When a Firebase user exists, always ask Firebase for the ID token.
  // The SDK returns a cached token while it is valid and refreshes it
  // automatically when it has expired, so a stale token is never reused.
  let token: string | null = null;
  if (auth.currentUser) {
    try {
      token = await auth.currentUser.getIdToken();
    } catch (error: any) {
      throw new Error(
        "Authentication failed: unable to get a valid Firebase ID token. " +
          "Please sign in again." +
          (error?.code ? ` (${error.code})` : "")
      );
    }
    // Keep getAuthToken() in step with the latest Firebase token
    authToken = token;
  } else {
    // Never reuse a token from a signed-out Firebase session.
    authToken = null;
  }
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
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
    if (response.status === 204) return undefined as T;
    const contentType = response.headers.get("content-type");
    const text = await response.text();
    if (!text.trim()) return undefined as T;
    if (contentType?.includes("application/json")) {
      return JSON.parse(text) as T;
    }
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
    getDraft: async (assessmentId: number): Promise<SubmissionRecord | null> => {
      try { return await request<SubmissionRecord>(`/submissions/draft/${assessmentId}`); }
      catch (error) { if (error instanceof Error && error.message.startsWith("HTTP 404:")) return null; throw error; }
    },
    createDraft: (assessmentId: number) => request<SubmissionResponse>("/submissions/draft", { method: "POST", body: JSON.stringify({ assessmentId }) }),
    getAnswers: (id: number) => request<Record<string, string>>(`/submissions/${id}/answers`),
    saveAnswers: (id: number, mcqAnswers: Record<string, string>) => request<Record<string, string>>(`/submissions/${id}/answers`, { method: "PUT", body: JSON.stringify({ mcqAnswers }) }),
    finalize: (id: number) => request<SubmissionRecord>(`/submissions/${id}/submit`, { method: "POST" }),

    submitCode: async (
      data: SubmissionRequest
    ): Promise<SubmissionResponse> => {
      const user = auth.currentUser;
      if (!user) {
        throw new Error(
          "You must be signed in before submitting code."
        );
      }
      // Student identity is derived by the backend from the verified
      // Firebase ID token, so no userId is sent in the body.
      return request<SubmissionResponse>("/submissions", {
        method: "POST",
        body: JSON.stringify({
          assessmentId: data.assessmentId,
          sourceCode: data.sourceCode,
          attemptNumber: data.attemptNumber ?? 1,
        }),
      });
    },
    getById: (submissionId: number): Promise<SubmissionRecord> =>
      request<SubmissionRecord>(
        `/submissions/${submissionId}`,
        { method: "GET" }
      ),
    updateCode: (
      submissionId: number,
      sourceCode: string
    ): Promise<SubmissionResponse> =>
      request<SubmissionResponse>(
        `/submissions/${submissionId}`,
        {
          method: "PUT",
          body: JSON.stringify({ sourceCode }),
        }
      ),

    gradeSubmission: (
      submissionId: number,
      mcqAnswers?: Record<string, string>
    ): Promise<ResultResponse> =>
      request<ResultResponse>(
        `/submissions/${submissionId}/grade`,
        {
          method: "POST",

        }
      ),

    getCurrentAttempt: async (
      assessmentId: number
    ): Promise<SubmissionRecord | null> => {
      const submissions = await request<SubmissionRecord[]>(
        "/submissions"
      );

    return submissions
      .filter(
        submission =>
          submission.assessment?.assessmentID === assessmentId
      )
      .sort((a, b) => b.submissionId - a.submissionId)[0] ?? null;
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
    // Legacy: backend no longer accepts client-generated results.
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
    data: AnnouncementRequest
  ): Promise<AnnouncementDTO> =>
    request<AnnouncementDTO>("/announcements", {
      method: "POST",
      body: JSON.stringify({
        title: data.title,
        message: data.message,
      }),
    }),

  update: (
    id: string | number,
    data: AnnouncementRequest
  ): Promise<AnnouncementDTO> =>
    request<AnnouncementDTO>(
      `/announcements/${encodeURIComponent(String(id))}`,
      {
        method: "PUT",
        body: JSON.stringify({
          title: data.title,
          message: data.message,
        }),
      }
    ),

  delete: (id: string | number): Promise<void> =>
    request<void>(
      `/announcements/${encodeURIComponent(String(id))}`,
      { method: "DELETE" }
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
    sync: async (): Promise<void> => {
      if (!auth.currentUser) {
        throw new Error("You must sign in before synchronizing your account.");
      }
      await request<void>("/users/sync", { method: "POST" });
    },
    getMe: (): Promise<UserDTO> =>
      request<UserDTO>("/users/me", { method: "GET" }),
    getActive: (): Promise<UserDTO[]> =>
      request<UserDTO[]>("/users/active", { method: "GET" }),
    heartbeat: async (): Promise<void> => {
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error("Authentication required.");
      await request<void>(`/users/${encodeURIComponent(uid)}/heartbeat`, {
        method: "PUT",
      });
    },
    getAll: (): Promise<any[]> =>
      request<any[]>("/users", {
        method: "GET",
      }),
    getFirebaseStudents: (): Promise<any[]> =>
      request<any[]>("/admin/students", {
        method: "GET",
      }),
    getById: (id: string): Promise<any> =>
      request<any>(
        `/users/${encodeURIComponent(id)}`,
        {
          method: "GET",
        }
      ),
    // Legacy: register with Firebase and call sync() instead.
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
