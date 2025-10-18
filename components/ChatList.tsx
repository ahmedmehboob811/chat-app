
import React, { useEffect, useState } from 'react';
import type { Chat, User } from '../types';
import supabase from '../services/supabaseClient';
import { useUser } from './ClerkMock';
import UserAvatar from './UserAvatar';

interface ChatListProps {
  selectedChatId: number | null;
  onSelectChat: (id: number) => void;
}

const ChatList: React.FC<ChatListProps> = ({ selectedChatId, onSelectChat }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useUser();

  useEffect(() => {
    const fetchChats = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('chats').select(`
        id,
        name,
        participants:users(*),
        lastMessage:messages(*)
      `);
      if (error) {
        console.error('Error fetching chats:', error);
      } else {
        setChats(data.sort((a: Chat, b: Chat) => {
            if (!a.lastMessage) return 1;
            if (!b.lastMessage) return -1;
            return new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime();
        }));
      }
      setLoading(false);
    };

    fetchChats();
  }, []);

  const getChatDisplayInfo = (chat: Chat) => {
    if (!currentUser) return { name: chat.name, avatar: '' };
    const otherParticipant = chat.participants.find(p => p.id !== currentUser.id);
    return {
      name: otherParticipant ? otherParticipant.name : chat.name,
      avatar: otherParticipant ? otherParticipant.avatar : 'https://i.pravatar.cc/150?u=group'
    };
  };

  if (loading) {
    return (
      <div className="p-4 space-y-3 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-gray-600 rounded-full"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-gray-600 rounded w-3/4"></div>
              <div className="h-3 bg-gray-600 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <ul className="divide-y divide-gray-700">
        {chats.map(chat => {
          const displayInfo = getChatDisplayInfo(chat);
          return (
            <li
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`p-4 flex items-center space-x-4 cursor-pointer transition-colors duration-200 ${
                selectedChatId === chat.id ? 'bg-blue-600/30' : 'hover:bg-gray-700'
              }`}
            >
              <UserAvatar src={displayInfo.avatar} alt={displayInfo.name} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{displayInfo.name}</p>
                <p className="text-sm text-gray-400 truncate">
                    {chat.lastMessage?.content || "No messages yet"}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ChatList;
