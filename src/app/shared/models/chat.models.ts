export interface ChatMessageRequest {
  message: string;
  sessionId?: string;
}

export interface ChatMessageResponse {
  response: string;
  sessionId: string;
  context?: any;
  success: boolean;
  errorMessage?: string;
}

export interface ChatSessionResponse {
  success: boolean;
  sessionId?: string;
  message?: string;
}

export interface ChatMessage {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

