import { Injectable, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';

export interface ChatMessage {
  username: string;
  message: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private socket: Socket | null = null;
  private readonly serverUrl = 'http://localhost:3000'; 
  
  messages = signal<ChatMessage[]>([]);
  isConnected = signal<boolean>(false);

  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(this.serverUrl);

    this.socket.on('connect', () => {
      this.isConnected.set(true);
      console.log('Connected to WebSocket server');
    });

    this.socket.on('disconnect', () => {
      this.isConnected.set(false);
      console.log('Disconnected from WebSocket server');
    });

    this.socket.on('msgToClient', (data: string) => {
      try {
        // Пытаемся распарсить JSON
        const messageData = JSON.parse(data);
        const chatMessage: ChatMessage = {
          username: messageData.username || 'Unknown',
          message: messageData.message || data,
          timestamp: new Date()
        };
        this.messages.update(messages => [...messages, chatMessage]);
      } catch {
        // Если данные не JSON, парсим формат "username: message"
        const colonIndex = data.indexOf(':');
        if (colonIndex > 0) {
          const username = data.substring(0, colonIndex).trim();
          const message = data.substring(colonIndex + 1).trim();
          const chatMessage: ChatMessage = {
            username,
            message,
            timestamp: new Date()
          };
          this.messages.update(messages => [...messages, chatMessage]);
        } else {
          // Если формат не распознан, используем как есть
          const chatMessage: ChatMessage = {
            username: 'System',
            message: data,
            timestamp: new Date()
          };
          this.messages.update(messages => [...messages, chatMessage]);
        }
      }
    });
  }

  sendMessage(username: string, message: string): void {
    if (!this.socket?.connected) {
      console.error('Socket is not connected');
      return;
    }

    // Отправляем JSON строку, чтобы бэкенд мог её переслать другим клиентам
    const messageData = JSON.stringify({
      username,
      message
    });

    this.socket.emit('msgToServer', messageData);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected.set(false);
    }
  }
}

