
/**
 * DevMate Frontend API Service
 *
 * Temporary local coursework mode:
 * - Course Management works without Spring Boot
 * - Courses are saved on the device
 * - Other API services still use Spring Boot
 *
 * Set USE_LOCAL_COURSEWORK to false when the
 * backend is ready.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://devmate-backend-lsxo.onrender.com";

// Temporary mode for Admin Course Management
const USE_LOCAL_COURSEWORK = true;

const COURSEWORK_STORAGE_KEY = "devmate_admin_coursework";

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

// ================= AUTH TOKEN =================

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

// ================= HTTP CLIENT =================

export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
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

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}`;

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
        `/submissions/user/${userId}`,
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
        `/results/user/${userId}`,
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
        `/ai/interactions/user/${userId}`,
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

    getUserAnalytics: (
      userId: string
    ): Promise<any> =>
      request<any>(`/analytics/user/${userId}`, {
        method: "GET",
      }),
  },

  // ================= USERS =================

  users: {
    getAll: (): Promise<any[]> =>
      request<any[]>("/users", {
        method: "GET",
      }),

    getById: (id: string): Promise<any> =>
      request<any>(`/users/${id}`, {
        method: "GET",
      }),

    create: (data: any): Promise<any> =>
      request<any>("/users", {
        method: "POST",
        body: JSON.stringify(data),
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
