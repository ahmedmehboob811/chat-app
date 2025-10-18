
import React, { useState } from 'react';
import { SignedIn, SignedOut, UserButton } from './components/ClerkMock';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import LoginScreen from './components/LoginScreen';

const App: React.FC = () => {
  const [selectedChatId, setSelectedChatId] = useState<number | null>(1);

  return (
    <div className="h-screen w-screen flex flex-col font-sans antialiased">
      <SignedOut>
        <LoginScreen />
      </SignedOut>

      <SignedIn>
        <div className="flex h-full bg-gray-900 text-gray-200">
          <div className="flex flex-col w-full md:w-1/3 lg:w-1/4 xl:w-1/5 border-r border-gray-700 bg-gray-800">
            <header className="flex items-center justify-between p-4 border-b border-gray-700">
              <h1 className="text-xl font-bold text-white">Chats</h1>
              <UserButton />
            </header>
            <ChatList selectedChatId={selectedChatId} onSelectChat={setSelectedChatId} />
          </div>
          <main className="flex-1 flex flex-col">
            {selectedChatId ? (
              <ChatWindow key={selectedChatId} chatId={selectedChatId} />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <h2 className="mt-2 text-lg font-medium text-gray-400">Select a chat to start messaging</h2>
                </div>
              </div>
            )}
          </main>
        </div>
      </SignedIn>
    </div>
  );
};

export default App;
