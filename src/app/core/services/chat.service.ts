import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ChatMessageRequest, ChatMessageResponse, ChatSessionResponse } from '../../shared/models/chat.models';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly endpoint = '/chat';

  constructor(private apiService: ApiService) {}

  sendMessage(message: string, sessionId?: string): Observable<ChatMessageResponse> {
    const request: ChatMessageRequest = {
      message,
      sessionId
    };
    return this.apiService.post<ChatMessageResponse>(`${this.endpoint}/message`, request);
  }

  createSession(): Observable<ChatSessionResponse> {
    return this.apiService.post<ChatSessionResponse>(`${this.endpoint}/session`, {});
  }

  deleteSession(sessionId: string): Observable<any> {
    return this.apiService.delete(`${this.endpoint}/session/${sessionId}`);
  }
}

