
import React, { useMemo } from 'react';
import type { Message } from '../types';
import UserAvatar from './UserAvatar';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  isRead?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isCurrentUser, isRead }) => {
  const alignment = isCurrentUser ? 'justify-end' : 'justify-start';
  const bubbleColor = isCurrentUser ? 'bg-blue-600' : 'bg-gray-700';
  
  const senderAvatar = `https://i.pravatar.cc/150?u=${message.sender_id}`;

  const formattedTime = useMemo(() => {
    return new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [message.created_at]);

  return (
    <div className={`flex items-end gap-2 ${alignment}`}>
      {!isCurrentUser && <UserAvatar src={senderAvatar} alt="Sender" size="sm"/>}
      <div className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg ${bubbleColor}`}>
        {message.image_url && (
            <img 
                src={message.image_url} 
                alt="Uploaded content" 
                className="rounded-lg mb-2 max-h-64 cursor-pointer" 
                onClick={() => window.open(message.image_url, '_blank')}
            />
        )}
        {message.content && <p className="text-white text-base break-words">{message.content}</p>}
        <div className="flex items-center justify-end gap-2 mt-1">
            <p className="text-xs text-gray-300">{formattedTime}</p>
            {isCurrentUser && (
                isRead ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sky-400">
                    <path d="M1.5 12.5L5.5 16.5L9.5 12.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8.5 12.5L12.5 16.5L22.5 5.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400">
                    <path d="M1.5 12.5L5.5 16.5L12.5 9.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                )
            )}
        </div>
      </div>
      {isCurrentUser && <UserAvatar src={senderAvatar} alt="Sender" size="sm"/>}
    </div>
  );
};

export default MessageBubble;
