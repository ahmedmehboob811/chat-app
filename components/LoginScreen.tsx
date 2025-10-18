
import React from 'react';
import { useAuth } from './ClerkMock';

const LoginScreen: React.FC = () => {
    const { setUser, availableUsers } = useAuth();

    return (
        <div className="flex items-center justify-center h-screen bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-xl shadow-lg">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-white">Welcome Back!</h1>
                    <p className="mt-2 text-gray-400">Select a user to sign in</p>
                </div>
                <div className="space-y-4">
                    {Object.values(availableUsers).map(user => (
                        <button
                            key={user.id}
                            onClick={() => setUser(user)}
                            className="w-full flex items-center p-4 text-left bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full" />
                            <div className="ml-4">
                                <p className="text-lg font-semibold text-white">{user.name}</p>
                                <p className="text-sm text-gray-400">{user.email}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
