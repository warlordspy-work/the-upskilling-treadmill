export interface FileItem {
  filename: string;
  content: string;
  language: string;
}

export interface AssertionItem {
  id: string;
  description: string;
  passed: boolean;
  details?: string;
}

export interface LearningModule {
  id: number;
  slug: string;
  code_id: string;
  title: string;
  track: string;
  estimated_minutes: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  badge_label: string;
  summary: string;
  markdown_content?: string;
  files?: FileItem[];
  assertions?: AssertionItem[];
  quiz_question?: string;
  quiz_options?: string[];
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  streak_count: number;
  subscription_tier: string;
}

export interface CodeExecutionResult {
  success: boolean;
  status_code: number;
  terminal_logs: string[];
  assertions: AssertionItem[];
  service_url?: string;
  next_step_available: boolean;
}

export interface TutorMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  codeFix?: string;
  timestamp: string;
}
