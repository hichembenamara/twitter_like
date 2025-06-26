
import React, { useEffect } from 'react';
import AuthPage from '@/components/auth/AuthPage';
import TwitterApp from '@/components/TwitterApp';
import { useAuthStore } from '@/stores/authStore';

const Index = () => {
  const { isAuthenticated, user } = useAuthStore();

  // Check for saved authentication on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('twitter-user');
    if (savedUser && !isAuthenticated) {
      try {
        const userData = JSON.parse(savedUser);
        useAuthStore.setState({ user: userData, isAuthenticated: true });
      } catch (error) {
        localStorage.removeItem('twitter-user');
      }
    }
  }, [isAuthenticated]);

  return isAuthenticated && user ? <TwitterApp /> : <AuthPage />;
};

export default Index;
