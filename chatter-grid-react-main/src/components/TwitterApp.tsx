
import React, { useState, useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import Sidebar from './layout/Sidebar';
import Timeline from './timeline/Timeline';
import ProfileView from './profile/ProfileView';
import LikesView from './likes/LikesView';
import SearchPage from './search/SearchPage';
import NotificationPage from './notifications/NotificationPage';
import MessagesPage from './messages/MessagesPage';
import FriendsPage from './friends/FriendsPage';
import SettingsPage from './settings/SettingsPage';
import { useAuthStore } from '@/stores/authStore';

const TwitterApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const { user, isAuthenticated } = useAuthStore();

  // Auto-login if user data exists in localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('twitter-user');
    if (savedUser && !isAuthenticated) {
      const userData = JSON.parse(savedUser);
      useAuthStore.setState({ user: userData, isAuthenticated: true });
    }
  }, [isAuthenticated]);

  const renderContent = () => {
    switch (activeTab) {
      case 'search':
        return <SearchPage />;
      case 'notifications':
        return <NotificationPage />;
      case 'messages':
        return <MessagesPage />;
      case 'friends':
        return <FriendsPage />;
      case 'profile':
        return <ProfileView />;
      case 'likes':
        return <LikesView />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Timeline />;
    }
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="flex min-h-screen bg-white dark:bg-gray-900">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        {renderContent()}
        
        {/* Right sidebar for trending/suggestions */}
        <div className="w-80 bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4 hidden lg:block">
          <div className="bg-white rounded-xl p-4 mb-4">
            <h3 className="text-xl font-bold mb-3">What's happening</h3>
            <div className="space-y-3">
              <div className="text-sm">
                <p className="text-gray-500">Trending in Technology</p>
                <p className="font-semibold">#React</p>
                <p className="text-gray-500">42.1K Tweets</p>
              </div>
              <div className="text-sm">
                <p className="text-gray-500">Trending</p>
                <p className="font-semibold">#JavaScript</p>
                <p className="text-gray-500">28.4K Tweets</p>
              </div>
              <div className="text-sm">
                <p className="text-gray-500">Trending in Tech</p>
                <p className="font-semibold">#TypeScript</p>
                <p className="text-gray-500">15.2K Tweets</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4">
            <h3 className="text-xl font-bold mb-3">Who to follow</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face"
                    alt="Suggested user"
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-sm">Alex Johnson</p>
                    <p className="text-gray-500 text-sm">@alexjohnson</p>
                  </div>
                </div>
                <button className="bg-black text-white px-4 py-1 rounded-full text-sm font-semibold hover:bg-gray-800">
                  Follow
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default TwitterApp;
