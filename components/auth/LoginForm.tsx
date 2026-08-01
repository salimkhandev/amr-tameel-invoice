'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import { Lock, User, ArrowLeft, Loader2 } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useSession();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await login(username, password);
    if (result.success) {
      router.push('/dashboard');
    } else {
      setError('Invalid username or password');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-lg border border-gray-100 font-cairo">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[#204978]">Login</h2>
        <p className="text-sm text-gray-500 mt-1">Delivery Order Creation System</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">Username</label>
          <div className="relative flex items-center">
            <User className="absolute left-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
              disabled={isLoading}
              className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#204978] disabled:opacity-50"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">Password</label>
          <div className="relative flex items-center">
            <Lock className="absolute left-3 w-5 h-5 text-gray-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              disabled={isLoading}
              className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#204978] disabled:opacity-50"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3 bg-[#204978] hover:bg-[#18365a] text-white font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Logging in...</span>
            </>
          ) : (
            <>
              <span>Login to System</span>
              <ArrowLeft className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
