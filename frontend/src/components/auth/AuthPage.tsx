
import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import { Twitter } from 'lucide-react';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-500 rounded-full">
              <Twitter className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Twitter Clone</h1>
          <p className="text-gray-600 mt-2">Connect with friends and the world around you</p>
        </div>
        
        {isLogin ? (
          <LoginForm onToggleMode={() => setIsLogin(false)} />
        ) : (
          <SignupForm onToggleMode={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  );
};

export default AuthPage;
