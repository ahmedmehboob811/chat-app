import type { Message, TypingIndicator } from '../types';

type EventCallback = (...args: any[]) => void;

/**
 * A mock socket client to simulate real-time chat functionality.
 * This replaces the placeholder content that was causing compilation errors.
 */
class MockSocket {
  private listeners: { [event: string]: EventCallback[] } = {};
  private typingTimeouts: { [key: string]: number } = {};

  connect() {
    console.log('Mock socket connected.');
  }

  on(event: string, callback: EventCallback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: EventCallback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  emit(event: string, ...args: any[]) {
    // Special handling for some events to simulate server logic
    if (event === 'send_message') {
      const { message } = args[0] as { message: Partial<Message> };
      const newMessage: Message = {
        ...message,
        id: Math.round(Date.now() * Math.random()), // Create a semi-unique ID
        created_at: new Date().toISOString(),
      } as Message;
      
      // Simulate network delay before broadcasting back
      setTimeout(() => {
          this.broadcast('new_message', newMessage);
      }, 250);
      return;
    }

    if (event === 'typing') {
      const indicator = args[0] as TypingIndicator;
      const key = `${indicator.chatId}-${indicator.user.id}`;
      
      const isAlreadyTyping = !!this.typingTimeouts[key];

      // Clear any existing timeout
      if (this.typingTimeouts[key]) {
        clearTimeout(this.typingTimeouts[key]);
      }
      
      // If the user wasn't previously typing, broadcast the event
      if (!isAlreadyTyping) {
        this.broadcast('typing', indicator);
      }

      // Set a new timeout to broadcast 'stop_typing'
      this.typingTimeouts[key] = window.setTimeout(() => {
        this.broadcast('stop_typing', indicator);
        delete this.typingTimeouts[key];
      }, 3000); // User stops typing after 3 seconds of inactivity
    }

    if (event === 'join_chat' || event === 'leave_chat') {
        // In a real app, this would manage room presence. For the mock, we just log it.
        console.log(`Socket event: ${event}`, args[0]);
    }
  }

  /**
   * Broadcasts an event to all registered listeners.
   */
  private broadcast(event: string, ...args: any[]) {
     if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(...args));
    }
  }
}

const socket = new MockSocket();

export default socket;
