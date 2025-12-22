import { CommonModule } from '@angular/common';
import { AfterViewChecked, ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { ChatService } from '../../core/services/chat.service';
import { NotificationService } from '../../core/services/notification.service';
import { ChatMessage } from '../../shared/models/chat.models';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  messages: ChatMessage[] = [];
  currentMessage: string = '';
  sessionId: string | null = null;
  isLoading: boolean = false;
  isInitializing: boolean = true;
  isAssistantConfigured: boolean = true;

  constructor(
    private chatService: ChatService,
    private notificationService: NotificationService
    ,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) { }

  ngOnInit(): void {
    this.initializeSession();
  }

  ngOnDestroy(): void {
    if (this.sessionId) {
      this.chatService.deleteSession(this.sessionId).subscribe({
        error: (err: any) => console.error('Error al eliminar sesión:', err)
      });
    }
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private initializeSession(): void {
    this.isInitializing = true;

    // Safety timeout in case backend is down
    const timeoutId = setTimeout(() => {
      if (this.isInitializing) {
        console.warn('Chat initialization timed out');
        this.isInitializing = false;
        this.isAssistantConfigured = false;
        this.addConfigurationMessage();
      }
    }, 5000);

    this.chatService.createSession()
      .pipe(finalize(() => {
        clearTimeout(timeoutId);
        this.ngZone.run(() => {
          this.isInitializing = false;
          console.log('createSession finalize: isInitializing set to', this.isInitializing);
          this.cdr.detectChanges();
        });
      }))
      .subscribe({
        next: (response) => {
          console.log('createSession response:', response);
          if (response.success && response.sessionId) {
            this.sessionId = response.sessionId;
            this.isAssistantConfigured = true;
            this.addWelcomeMessage();
          } else {
            this.isAssistantConfigured = false;
            this.addConfigurationMessage();
          }
        },
        error: (error: any) => {
          console.error('Error al crear sesión:', error);
          this.isAssistantConfigured = false;
          this.addConfigurationMessage();
        }
      });
  }

  private addWelcomeMessage(): void {
    const welcomeMessage: ChatMessage = {
      text: '¡Hola! Soy tu asistente virtual. Puedo ayudarte con consultas sobre planillas, beneficios y asistencias. ¿En qué puedo ayudarte?',
      isUser: false,
      timestamp: new Date()
    };
    this.messages.push(welcomeMessage);
  }

  private addConfigurationMessage(): void {
    const configMessage: ChatMessage = {
      text: '⚠️ El asistente virtual no está configurado correctamente. Por favor verifica las credenciales en el backend.',
      isUser: false,
      timestamp: new Date()
    };
    this.messages.push(configMessage);
  }

  sendMessage(): void {
    if (!this.currentMessage.trim() || this.isLoading) {
      return;
    }

    // Si no hay sesión configurada, mostrar mensaje informativo
    if (!this.sessionId || !this.isAssistantConfigured) {
      const userMessage: ChatMessage = {
        text: this.currentMessage.trim(),
        isUser: true,
        timestamp: new Date()
      };
      this.messages.push(userMessage);

      const infoMessage: ChatMessage = {
        text: 'El asistente virtual no está disponible.',
        isUser: false,
        timestamp: new Date()
      };
      this.messages.push(infoMessage);
      this.currentMessage = '';
      return;
    }

    const userMessage: ChatMessage = {
      text: this.currentMessage.trim(),
      isUser: true,
      timestamp: new Date()
    };

    this.messages.push(userMessage);
    const messageToSend = this.currentMessage.trim();
    this.currentMessage = '';
    this.isLoading = true;
    console.log('Enviando mensaje:', messageToSend, 'sessionId:', this.sessionId);

    this.chatService.sendMessage(messageToSend, this.sessionId)
      .pipe(finalize(() => {
        this.ngZone.run(() => {
          this.isLoading = false;
          console.log('sendMessage finalize: isLoading set to', this.isLoading);
          this.cdr.detectChanges();
        });
      }))
      .subscribe({
        next: (response) => {
          console.log('sendMessage response:', response);
          if (response.success) {
            const botMessage: ChatMessage = {
              text: response.response,
              isUser: false,
              timestamp: new Date()
            };
            this.messages.push(botMessage);
          } else {
            // Si el error indica que no está configurado, actualizar el estado
            this.isAssistantConfigured = false;

            const errorMessage: ChatMessage = {
              text: response.errorMessage || 'Error al procesar el mensaje',
              isUser: false,
              timestamp: new Date()
            };
            this.messages.push(errorMessage);
          }
        },
        error: (error: any) => {
          console.error('Error al enviar mensaje:', error);
          const errorMessage: ChatMessage = {
            text: 'Error al comunicarse con el asistente.',
            isUser: false,
            timestamp: new Date()
          };
          this.messages.push(errorMessage);
        }
      });
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Error al hacer scroll:', err);
    }
  }

  clearChat(): void {
    this.messages = [];
    if (this.isAssistantConfigured && this.sessionId) {
      this.addWelcomeMessage();
    } else {
      this.addConfigurationMessage();
    }
  }
}

