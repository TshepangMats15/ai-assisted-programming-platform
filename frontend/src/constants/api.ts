/**
 * DevMate Frontend API Service
 * Configured Base URL: http://172.20.10.8:8080/api
 * Handles requests, JSON serialisation, error unwrapping, and DTO alignment
 */
 
export const API_BASE_URL = "http://172.20.10.8:8080/api";
 
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
  [key: string]: any;
}
 
// ================= HTTP CLIENT =================
 
let authToken: string | null = null;
 
export function setAuthToken(token: string | null) {
  authToken = token;
}
 
export function getAuthToken(): string | null {
  return authToken;
}
 
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
 
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };
 
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }
 
  const response = await fetch(url, {
    ...options,
    headers,
  });
 
  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
    try {
      const errorBody = await response.json();
      errorMessage = errorBody.message || errorBody.error || JSON.stringify(errorBody);
    } catch {
      try {
        const textBody = await response.text();
        if (textBody) errorMessage = textBody;
      } catch {
        // use default message
      }
    }
    throw new Error(errorMessage);
  }
 
  // Handle empty responses (204 No Content)
  if (response.status === 204) {
    return {} as T;
  }
 
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }
 
  // Fallback for plain text responses (e.g., /api/ai/ask)
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text as unknown as T;
  }
}
 
// ================= API SERVICES =================
 
export const api = {
  // 1. Submissions
  submissions: {
    submitCode: (data: SubmissionRequest): Promise<SubmissionResponse> =>
      request<SubmissionResponse>("/submissions", {
        method: "POST",
        body: JSON.stringify({
          assessmentId: data.assessmentId,
          sourceCode: data.sourceCode,
          attemptNumber: data.attemptNumber ?? 1,
        }),
      }),
 
    getAll: (): Promise<SubmissionRecord[]> =>
      request<SubmissionRecord[]>("/submissions", { method: "GET" }),
 
    getUserSubmissions: (userId: string): Promise<SubmissionRecord[]> =>
      request<SubmissionRecord[]>(`/submissions/user/${userId}`, { method: "GET" }),
  },
 
  // 2. Results
  results: {
    createResult: (data: ResultRequest): Promise<ResultResponse> =>
      request<ResultResponse>("/results", {
        method: "POST",
        body: JSON.stringify(data),
      }),
 
    getAll: (): Promise<ResultRecord[]> =>
      request<ResultRecord[]>("/results", { method: "GET" }),
 
    getUserResults: (userId: string): Promise<ResultRecord[]> =>
      request<ResultRecord[]>(`/results/user/${userId}`, { method: "GET" }),
  },
 
  // 3. Assessments
  assessments: {
    getAll: (): Promise<AssessmentDTO[]> =>
      request<AssessmentDTO[]>("/assessments", { method: "GET" }),
 
    getById: (id: number): Promise<AssessmentDTO> =>
      request<AssessmentDTO>(`/assessments/${id}`, { method: "GET" }),
 
    create: (data: AssessmentDTO): Promise<AssessmentDTO> =>
      request<AssessmentDTO>("/assessments", {
        method: "POST",
        body: JSON.stringify(data),
      }),
 
    update: (id: number, data: Partial<AssessmentDTO>): Promise<AssessmentDTO> =>
      request<AssessmentDTO>(`/assessments/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
 
    delete: (id: number): Promise<void> =>
      request<void>(`/assessments/${id}`, { method: "DELETE" }),
  },
 
  // 4. Coursework
  coursework: {
    getAll: (): Promise<CourseworkDTO[]> =>
      request<CourseworkDTO[]>("/coursework", { method: "GET" }),
 
    getById: (id: string): Promise<CourseworkDTO> =>
      request<CourseworkDTO>(`/coursework/${id}`, { method: "GET" }),
 
    create: (data: CourseworkDTO): Promise<CourseworkDTO> =>
      request<CourseworkDTO>("/coursework", {
        method: "POST",
        body: JSON.stringify(data),
      }),
 
    update: (id: string, data: Partial<CourseworkDTO>): Promise<CourseworkDTO> =>
      request<CourseworkDTO>(`/coursework/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
 
    delete: (id: string): Promise<void> =>
      request<void>(`/coursework/${id}`, { method: "DELETE" }),
  },
 
  // 5. AI Assistance
  ai: {
    ask: (prompt: string): Promise<string> =>
      request<string>("/ai/ask", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      }),
 
    geminiAsk: (prompt: string): Promise<{ response: string }> =>
      request<{ response: string }>("/gemini/ask", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      }),
 
    submitPrompt: (data: { userID: string; assessmentID: number; prompt: string }): Promise<AIInteractionDTO> =>
      request<AIInteractionDTO>("/ai/prompt", {
        method: "POST",
        body: JSON.stringify(data),
      }),
 
    getUserInteractions: (userId: string): Promise<AIInteractionDTO[]> =>
      request<AIInteractionDTO[]>(`/ai/interactions/user/${userId}`, { method: "GET" }),
  },
 
  // 6. Analytics
  analytics: {
    getSummary: (): Promise<AnalyticsSummary> =>
      request<AnalyticsSummary>("/analytics/summary", { method: "GET" }),
 
    getAiUsage: (): Promise<any[]> =>
      request<any[]>("/analytics/ai-usage", { method: "GET" }),
 
    getDailyAiUsage: (): Promise<any> =>
      request<any>("/analytics/ai-usage/daily", { method: "GET" }),
 
    getUserAnalytics: (userId: string): Promise<any> =>
      request<any>(`/analytics/user/${userId}`, { method: "GET" }),
  },
 
  // 7. Users
  users: {
    getAll: (): Promise<any[]> =>
      request<any[]>("/users", { method: "GET" }),
 
    getById: (id: string): Promise<any> =>
      request<any>(`/users/${id}`, { method: "GET" }),
 
    create: (data: any): Promise<any> =>
      request<any>("/users", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
 
  // 8. Auth
  auth: {
    verifyToken: (token: string): Promise<{ uid: string; message: string }> =>
      request<{ uid: string; message: string }>("/auth/verify", {
        method: "POST",
        body: JSON.stringify({ token }),
      }),
  },
};
 
export default api;
 
 