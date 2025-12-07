import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../core/services/chat.service';
import { ChatMessage } from '../../shared/models/chat.models';
import { NotificationService } from '../../core/services/notification.service';

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
  isWatsonConfigured: boolean = true;

  constructor(
    private chatService: ChatService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.initializeSession();
  }

  ngOnDestroy(): void {
    if (this.sessionId) {
      this.chatService.deleteSession(this.sessionId).subscribe({
        error: (err) => console.error('Error al eliminar sesión:', err)
      });
    }
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private initializeSession(): void {
    this.isInitializing = true;
    this.chatService.createSession().subscribe({
      next: (response) => {
        if (response.success && response.sessionId) {
          this.sessionId = response.sessionId;
          this.isWatsonConfigured = true;
          this.addWelcomeMessage();
        } else {
          this.isWatsonConfigured = false;
          this.addConfigurationMessage();
        }
        this.isInitializing = false;
      },
      error: (error) => {
        console.error('Error al crear sesión:', error);
        this.isWatsonConfigured = false;
        this.addConfigurationMessage();
        this.isInitializing = false;
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
      text: '⚠️ El asistente virtual no está configurado actualmente. Para habilitarlo, necesitas configurar las credenciales de IBM Watson Assistant en el archivo application.properties del backend. Consulta el archivo WATSON_ASSISTANT_SETUP.md para obtener instrucciones detalladas. El resto del sistema funciona normalmente.',
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
    if (!this.sessionId || !this.isWatsonConfigured) {
      const userMessage: ChatMessage = {
        text: this.currentMessage.trim(),
        isUser: true,
        timestamp: new Date()
      };
      this.messages.push(userMessage);
      
      const infoMessage: ChatMessage = {
        text: 'El asistente virtual no está disponible. Por favor, configura IBM Watson Assistant siguiendo las instrucciones en WATSON_ASSISTANT_SETUP.md',
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

    this.chatService.sendMessage(messageToSend, this.sessionId).subscribe({
      next: (response) => {
        if (response.success) {
          const botMessage: ChatMessage = {
            text: response.response,
            isUser: false,
            timestamp: new Date()
          };
          this.messages.push(botMessage);
        } else {
          // Si el error indica que no está configurado, actualizar el estado
          if (response.errorMessage && response.errorMessage.includes('no está configurado')) {
            this.isWatsonConfigured = false;
          }
          const errorMessage: ChatMessage = {
            text: response.errorMessage || 'Error al procesar el mensaje',
            isUser: false,
            timestamp: new Date()
          };
          this.messages.push(errorMessage);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al enviar mensaje:', error);
        const errorMessage: ChatMessage = {
          text: 'Error al comunicarse con el asistente. Verifica que Watson Assistant esté configurado correctamente.',
          isUser: false,
          timestamp: new Date()
        };
        this.messages.push(errorMessage);
        this.isLoading = false;
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
    if (this.isWatsonConfigured && this.sessionId) {
      this.addWelcomeMessage();
    } else {
      this.addConfigurationMessage();
    }
  }
}

