import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit, OnDestroy {
  private chatService = inject(ChatService);
  
  username = signal<string>('');
  messageText = signal<string>('');
  isUsernameSet = signal<boolean>(false);
  
  messages = this.chatService.messages;
  isConnected = this.chatService.isConnected;

  ngOnInit(): void {
    this.chatService.connect();
  }

  ngOnDestroy(): void {
    this.chatService.disconnect();
  }

  setUsername(): void {
    const name = this.username().trim();
    if (name) {
      this.isUsernameSet.set(true);
    }
  }

  sendMessage(): void {
    const message = this.messageText().trim();
    const name = this.username().trim();

    if (!message || !name) {
      return;
    }

    this.chatService.sendMessage(name, message);
    this.messageText.set('');
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}

