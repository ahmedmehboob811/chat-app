import React, { useState, useEffect, useRef } from 'react';
import supabase from '../services/supabaseClient';
import socket from '../services/socketClient';
import type { Message, TypingIndicator, User } from '../types';
import { useUser } from './ClerkMock';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import UserAvatar from './UserAvatar';

interface ChatWindowProps {
  chatId: number;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chatId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<User[]>([]);
  const { user: currentUser } = useUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);
  
  useEffect(() => {
    const unreadMessages = messages.filter(m => !m.isRead);

    if (unreadMessages.length > 0) {
        const readTimer = setTimeout(() => {
            setMessages(currentMessages =>
                currentMessages.map(msg =>
                    msg.isRead ? msg : { ...msg, isRead: true }
                )
            );
        }, 2000);

        return () => clearTimeout(readTimer);
    }
  }, [messages]);


  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId);

      if (error) {
        console.error('Error fetching messages:', error);
      } else {
        const initialMessages = data
          .sort((a: Message, b: Message) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          .map((msg: Message) => ({ ...msg, isRead: false }));
        setMessages(initialMessages);
      }
      setLoading(false);
    };

    fetchMessages();
  }, [chatId]);

  useEffect(() => {
    if (!currentUser) return;

    socket.connect();
    socket.emit('join_chat', { chatId });

    const handleNewMessage = (newMessage: Message) => {
      if (newMessage.chat_id === chatId) {
        setMessages(currentMessages => [...currentMessages, { ...newMessage, isRead: false }]);
      }
    };

    const handleTyping = (indicator: TypingIndicator) => {
      if (indicator.chatId === chatId && indicator.user.id !== currentUser.id) {
        setTypingUsers(prev => {
          if (prev.some(u => u.id === indicator.user.id)) return prev;
          return [...prev, indicator.user];
        });
      }
    };
    
    const handleStopTyping = (indicator: TypingIndicator) => {
      if (indicator.chatId === chatId) {
        setTypingUsers(prev => prev.filter(u => u.id !== indicator.user.id));
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('typing', handleTyping);
    socket.on('stop_typing', handleStopTyping);
      
    return () => {
      socket.emit('leave_chat', { chatId });
      socket.off('new_message', handleNewMessage);
      socket.off('typing', handleTyping);
      socket.off('stop_typing', handleStopTyping);
    };
  }, [chatId, currentUser]);

  const handleSendMessage = async (content: string, imageUrl?: string) => {
    if (!currentUser) return;
    const messageData: Partial<Message> = {
      chat_id: chatId,
      sender_id: currentUser.id,
      content,
      image_url: imageUrl,
    };
    socket.emit('send_message', { message: messageData });
  };
  
  const handleTyping = () => {
    if (!currentUser) return;
    const indicator: TypingIndicator = { chatId, user: currentUser };
    socket.emit('typing', indicator);
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-900 h-full">
      <header className="flex items-center p-4 border-b border-gray-700 bg-gray-800">
        <UserAvatar src={`https://i.pravatar.cc/150?u=chat${chatId}`} alt="Chat Avatar" />
        <div className="ml-4">
          <h2 className="text-lg font-bold text-white">Chat {chatId}</h2>
          <p className="text-sm text-green-400">Online</p>
        </div>
      </header>
      <div className="flex-1 p-4 overflow-y-auto">
        {loading ? (
          <div className="text-center text-gray-400">Loading messages...</div>
        ) : (
          <div className="space-y-4">
            {messages.map(msg => (
              <MessageBubble key={msg.id} message={msg} isCurrentUser={msg.sender_id === currentUser?.id} isRead={msg.isRead} />
            ))}
            {typingUsers.map(user => (
              <div key={user.id} className="flex items-center space-x-2">
                <UserAvatar src={user.avatar} alt={user.name} size="sm" />
                <div className="text-gray-400 text-sm italic animate-pulse">
                  {user.name} is typing...
                </div>
              </div>
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <MessageInput onSendMessage={handleSendMessage} onTyping={handleTyping}/>
    </div>
  );
};

export default ChatWindow;