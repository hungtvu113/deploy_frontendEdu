// API Service for EduScore Frontend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "teacher" | "student";
  studentId?: string;
  phone?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: User;
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: User;
  };
}

export interface ApiError {
  success: false;
  message: string;
}

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Đã xảy ra lỗi");
  }

  return data;
}

// Auth API
export const authApi = {
  // Login
  login: async (email: string, password: string): Promise<LoginResponse> => {
    return apiCall<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  // Register (students only)
  register: async (data: {
    studentId: string;
    name: string;
    password: string;
    phone?: string;
  }): Promise<RegisterResponse> => {
    return apiCall<RegisterResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Get current user
  getMe: async (): Promise<{ success: boolean; data: User }> => {
    return apiCall("/auth/me");
  },

  // Change password
  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    return apiCall("/auth/change-password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  // Update profile
  updateProfile: async (data: {
    name?: string;
    phone?: string;
  }): Promise<{ success: boolean; message: string }> => {
    return apiCall("/auth/update-profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
};

// Subjects API
export const subjectsApi = {
  getAll: async (): Promise<any> => apiCall("/subjects"),
  getById: async (id: string): Promise<any> => apiCall(`/subjects/${id}`),
  create: async (data: { code: string; name: string; description?: string; credits?: number }): Promise<any> =>
    apiCall("/subjects", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: async (id: string, data: { code?: string; name?: string; description?: string; credits?: number }): Promise<any> =>
    apiCall(`/subjects/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: async (id: string): Promise<any> =>
    apiCall(`/subjects/${id}`, {
      method: "DELETE",
    }),
};

// Exams API
export const examsApi = {
  getAll: async (): Promise<any> => apiCall("/exams"),
  getById: async (id: string): Promise<any> => apiCall(`/exams/${id}`),
  create: async (data: {
    name: string;
    subject: string;
    examDate: string;
    startTime?: string;
    endTime?: string;
    room?: string;
    duration?: number;
    semester?: string;
    academicYear?: string;
    description?: string;
    status?: string;
  }): Promise<any> =>
    apiCall("/exams", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: async (id: string, data: {
    name?: string;
    subject?: string;
    examDate?: string;
    startTime?: string;
    endTime?: string;
    room?: string;
    duration?: number;
    semester?: string;
    academicYear?: string;
    description?: string;
    status?: string;
  }): Promise<any> =>
    apiCall(`/exams/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: async (id: string): Promise<any> =>
    apiCall(`/exams/${id}`, {
      method: "DELETE",
    }),
};

// Scores API
export const scoresApi = {
  getMyScores: async (): Promise<any> => apiCall("/scores/my-scores"),
  getMyExams: async (): Promise<any> => apiCall("/scores/my-exams"),
  getMyHistory: async (): Promise<any> => apiCall("/scores/my-history"),
  getByExam: async (examId: string): Promise<any> => apiCall(`/scores/exam/${examId}`),
  getStudentsForExam: async (examId: string): Promise<any> => apiCall(`/scores/exam/${examId}/students`),
  getByStudent: async (studentId: string): Promise<any> => apiCall(`/scores/student/${studentId}`),
  create: async (data: { student: string; exam: string; score: number; note?: string }): Promise<any> =>
    apiCall("/scores", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  delete: async (id: string): Promise<any> =>
    apiCall(`/scores/${id}`, {
      method: "DELETE",
    }),
  cleanupOrphans: async (): Promise<any> =>
    apiCall("/scores/cleanup-orphans", {
      method: "DELETE",
    }),
  import: async (data: { examId: string; scores: Array<{ studentId: string; score: number; note?: string }> }): Promise<any> =>
    apiCall("/scores/import", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// Users API
export const usersApi = {
  getAll: async (): Promise<any> => apiCall("/users"),
  getById: async (id: string): Promise<any> => apiCall(`/users/${id}`),
  create: async (data: {
    email: string;
    password: string;
    name: string;
    role: "admin" | "teacher" | "student";
    studentId?: string;
    phone?: string;
  }): Promise<any> => apiCall("/users", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  update: async (id: string, data: {
    name?: string;
    phone?: string;
    isActive?: boolean;
  }): Promise<any> => apiCall(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }),
  delete: async (id: string): Promise<any> => apiCall(`/users/${id}`, {
    method: "DELETE",
  }),
};

// Classes API
export const classesApi = {
  getAll: async (): Promise<any> => apiCall("/classes"),
  getById: async (id: string): Promise<any> => apiCall(`/classes/${id}`),
  getByTeacher: async (teacherId: string): Promise<any> => apiCall(`/classes/teacher/${teacherId}`),
  getByStudent: async (studentId: string): Promise<any> => apiCall(`/classes/student/${studentId}`),
  join: async (classId: string, password: string): Promise<any> => apiCall(`/classes/${classId}/join`, {
    method: "POST",
    body: JSON.stringify({ password }),
  }),
  leave: async (classId: string): Promise<any> => apiCall(`/classes/${classId}/leave`, {
    method: "POST",
  }),
  create: async (data: {
    code: string;
    name: string;
    subject: string;
    teacher: string;
    semester: string;
    academicYear: string;
    schedule?: string;
    room?: string;
    maxStudents?: number;
    password: string;
  }): Promise<any> => apiCall("/classes", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  update: async (id: string, data: Record<string, unknown>): Promise<any> => apiCall(`/classes/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }),
  delete: async (id: string): Promise<any> => apiCall(`/classes/${id}`, {
    method: "DELETE",
  }),
  addStudents: async (classId: string, studentIds: string[]): Promise<any> => apiCall(`/classes/${classId}/students`, {
    method: "POST",
    body: JSON.stringify({ studentIds }),
  }),
  removeStudent: async (classId: string, studentId: string): Promise<any> => apiCall(`/classes/${classId}/students/${studentId}`, {
    method: "DELETE",
  }),
  addExam: async (classId: string, examId: string): Promise<any> => apiCall(`/classes/${classId}/exams`, {
    method: "POST",
    body: JSON.stringify({ examId }),
  }),
};

export default {
  auth: authApi,
  subjects: subjectsApi,
  exams: examsApi,
  scores: scoresApi,
  users: usersApi,
  classes: classesApi,
};

