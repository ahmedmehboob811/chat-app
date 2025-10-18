
import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { User } from '../types';
import { users as mockUsers } from '../services/supabaseClient';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  availableUsers: { [key: string]: User };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const MockClerkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const value = { user, setUser, availableUsers: mockUsers };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useUser = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a MockClerkProvider');
  }
  return { user: context.user };
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within a MockClerkProvider');
    }
    return context;
}

export const SignedIn: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useUser();
  return user ? <>{children}</> : null;
};

export const SignedOut: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useUser();
  return !user ? <>{children}</> : null;
};

export const UserButton: React.FC = () => {
  const { user, setUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="focus:outline-none">
        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg py-1 z-10">
          <div className="px-4 py-2 text-sm text-gray-300 border-b border-gray-600">
            Signed in as <br /> <span className="font-semibold">{user.name}</span>
          </div>
          <button
            onClick={() => {
              setUser(null);
              setIsOpen(false);
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-600"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};
