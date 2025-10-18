
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface Chat {
  id: number;
  name: string;
  participants: User[];
  lastMessage?: Message;
}

export interface Message {
  id: number;
  chat_id: number;
  sender_id: string;
  content: string;
  image_url?: string;
  created_at: string;
  isRead?: boolean;
}

export interface TypingIndicator {
  chatId: number;
  user: User;
}

export type SupabaseRealtimePayload<T> = {
  new: T;
  [key: string]: any;
};
