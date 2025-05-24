export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "user";
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface Video {
  _id: string;
  filename: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  duration: number;
  status: ProcessingStatus;
  uploadedBy: string;
  transcriptionText?: string;
  transcriptionSegments?: TranscriptSegment[];
  language: string;
  processingError?: string;
  processingProgress: number;
  createdAt: string;
  updatedAt: string;
}

export enum ProcessingStatus {
  UPLOADED = "uploaded",
  TRANSCRIBING = "transcribing",
  GENERATING_QUESTIONS = "generating_questions",
  COMPLETED = "completed",
  FAILED = "failed",
}

export interface TranscriptSegment {
  startTime: number;
  endTime: number;
  text: string;
  segmentIndex: number;
}

export interface Question {
  _id: string;
  videoId: string;
  segmentIndex: number;
  startTime: number;
  endTime: number;
  type: "multiple_choice";
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  isReviewed: boolean;
  isActive: boolean;
  tags?: string[];
  sourceText?: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalVideos: number;
  totalQuestions: number;
  videosByStatus: Record<string, number>;
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: string;
  }>;
}
