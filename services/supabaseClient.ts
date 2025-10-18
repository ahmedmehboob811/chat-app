import type { User, Chat, Message, TypingIndicator, SupabaseRealtimePayload } from '../types';

// --- MOCK DATA ---
// FIX: Renamed `users` to `usersData` to avoid redeclaration error.
const usersData: User[] = [
  { id: 'user_1', name: 'Alex', email: 'alex@example.com', avatar: 'https://i.pravatar.cc/150?u=user_1' },
  { id: 'user_2', name: 'Sam', email: 'sam@example.com', avatar: 'https://i.pravatar.cc/150?u=user_2' },
  { id: 'user_3', name: 'Casey', email: 'casey@example.com', avatar: 'https://i.pravatar.cc/150?u=user_3' },
];

export let messages: Message[] = [
  { id: 1, chat_id: 1, sender_id: 'user_1', content: 'Hey Sam, how\'s the project going?', created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
  { id: 2, chat_id: 1, sender_id: 'user_2', content: 'Hey Alex! Going well, just pushing the latest updates.', created_at: new Date(Date.now() - 1000 * 60 * 4).toISOString() },
  { id: 3, chat_id: 2, sender_id: 'user_1', content: 'Planning for the weekend?', created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString() },
  { id: 4, chat_id: 2, sender_id: 'user_3', content: 'Yeah! Thinking of going for a hike.', created_at: new Date(Date.now() - 1000 * 60 * 9).toISOString() },
];

const chats: Chat[] = [
  { id: 1, name: 'Project Group', participants: [usersData[0], usersData[1]], lastMessage: messages[1] },
  { id: 2, name: 'Weekend Plans', participants: [usersData[0], usersData[2]], lastMessage: messages[3] },
];

// --- MOCK REALTIME ENGINE (DEPRECATED FOR CHAT MESSAGES, still used for initial fetch simulation) ---
type MessageCallback = (payload: SupabaseRealtimePayload<Message>) => void;
type TypingCallback = (payload: TypingIndicator) => void;

const messageListeners: { [chatId: number]: MessageCallback[] } = {};
const typingListeners: { [chatId: number]: TypingCallback[] } = {};

const broadcastNewMessage = (chatId: number, message: Message) => {
  const payload: SupabaseRealtimePayload<Message> = {
    new: message,
    eventType: 'INSERT',
    table: 'messages',
    schema: 'public',
    commit_timestamp: new Date().toISOString(),
  };
  if (messageListeners[chatId]) {
    messageListeners[chatId].forEach(cb => cb(payload));
  }
};

const broadcastTyping = (indicator: TypingIndicator) => {
  if (typingListeners[indicator.chatId]) {
    typingListeners[indicator.chatId].forEach(cb => cb(indicator));
  }
}

// --- MOCKED CLIENT ---
const mockSupabaseClient = {
  from: (tableName: string) => {
    return {
      select: (columns: string = '*') => {
        return {
          eq: (column: string, value: any) => {
            if (tableName === 'messages' && column === 'chat_id') {
              const chatMessages = messages.filter(m => m.chat_id === value);
              return Promise.resolve({ data: chatMessages, error: null });
            }
            return Promise.resolve({ data: [], error: { message: 'Query not mocked' } });
          },
          // Mock fetching all chats
          async then(resolve: (value: { data: any, error: any }) => void) {
            if (tableName === 'chats') {
              // Simulate network delay
              setTimeout(() => {
                // Attach last message dynamically
                const chatsWithLastMessage = chats.map(chat => {
                    const lastMessage = messages
                        .filter(m => m.chat_id === chat.id)
                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
                    return {...chat, lastMessage };
                })
                resolve({ data: chatsWithLastMessage, error: null });
              }, 500);
            } else {
              resolve({ data: null, error: { message: 'Query not mocked' } });
            }
          }
        };
      },
      insert: (records: Partial<Message>[]) => {
        if (tableName === 'messages') {
          const newMessage: Message = {
            id: messages.length + 5,
            ...records[0],
            created_at: new Date().toISOString(),
          } as Message;
          messages.push(newMessage);
          // Simulate network delay then broadcast
          setTimeout(() => broadcastNewMessage(newMessage.chat_id, newMessage), 200);
          return Promise.resolve({ data: [newMessage], error: null });
        }
        return Promise.resolve({ data: null, error: { message: 'Insert not mocked' } });
      }
    };
  },
  // FIX: Refactored `channel` mock to align with the real supabase-js API where `send` is a method on the channel object itself, not on the subscription object. This also fixes chaining for `.on()`.
  channel: (channelName: string) => {
    const isTypingChannel = channelName.startsWith('typing-');
    const chatId = parseInt(channelName.split('-').pop() || '0', 10);
    
    const channelObject = {
      on: (type: string, filter: any, callback: any) => {
        if(type === 'postgres_changes' && filter.table === 'messages') {
             if (!messageListeners[chatId]) {
                messageListeners[chatId] = [];
            }
            messageListeners[chatId].push(callback);
        } else if (type === 'broadcast' && filter.event === 'typing') {
             if (!typingListeners[chatId]) {
                typingListeners[chatId] = [];
            }
            typingListeners[chatId].push(callback);
        }
        return channelObject;
      },
      subscribe: (callback?: (status: string) => void) => {
        setTimeout(() => callback && callback('SUBSCRIBED'), 100);
        return {
          unsubscribe: () => {
            if (isTypingChannel) {
                delete typingListeners[chatId];
            } else {
                delete messageListeners[chatId];
            }
          },
        };
      },
      send: (payload: { type: string, event: string, payload: any }) => {
          if (payload.event === 'typing') {
              broadcastTyping(payload.payload);
          }
      }
    };
    return channelObject;
  },
  storage: {
      from: (bucket: string) => ({
          upload: async (path: string, file: File) => {
              // Simulate upload and return a public URL
              const publicURL = URL.createObjectURL(file);
              return { data: { publicUrl: publicURL }, error: null };
          }
      })
  }
};

type MockUsers = { [key: string]: User };

// FIX: Corrected syntax from `as` to `:` for type annotation, and used `usersData`.
export const users: MockUsers = {
    'user_1': usersData[0],
    'user_2': usersData[1],
    'user_3': usersData[2],
};


export default mockSupabaseClient;