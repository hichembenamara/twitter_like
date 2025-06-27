
import React, { useEffect } from 'react';
import AuthPage from '@/components/auth/AuthPage';
import TwitterApp from '@/components/TwitterApp';
import { useAuthStore } from '@/stores/authStore';

const Index = () => {
  const { isAuthenticated, user } = useAuthStore();

  // Check for saved authentication on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('twitter-user');
    console.log('Index: savedUser from localStorage:', savedUser);
    console.log('Index: current isAuthenticated:', isAuthenticated);
    if (savedUser && !isAuthenticated) {
      try {
        const userData = JSON.parse(savedUser);
        console.log('Index: Restoring user session:', userData);
        useAuthStore.setState({ user: userData, isAuthenticated: true });
      } catch (error) {
        console.error('Index: Error parsing saved user data:', error);
        localStorage.removeItem('twitter-user');
      }
    }
  }, [isAuthenticated]);

  console.log('Index: Rendering - isAuthenticated:', isAuthenticated, 'user:', user);
  
  return isAuthenticated && user ? <TwitterApp /> : <AuthPage />;
};

export default Index;
