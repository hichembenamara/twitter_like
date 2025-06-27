
import React, { useState } from 'react';
import { ThemeProvider } from 'next-themes';
import Sidebar from './layout/Sidebar';
import Timeline from './timeline/Timeline';
import ProfileView from './profile/ProfileView';
import LikesView from './likes/LikesView';
import SearchPage from './search/SearchPage';
import NotificationPage from './notifications/NotificationPage';
import FriendsPage from './friends/FriendsPage';
import { useAuthStore } from '@/stores/authStore';

const TwitterApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const { user, isAuthenticated } = useAuthStore();


  const renderContent = () => {
    switch (activeTab) {
      case 'search':
        return <SearchPage />;
      case 'notifications':
        return <NotificationPage />;
      case 'friends':
        return <FriendsPage />;
      case 'profile':
        return <ProfileView />;
      case 'likes':
        return <LikesView />;
      default:
        return <Timeline />;
    }
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="flex min-h-screen bg-gradient-to-br from-twitter-gray-50 via-twitter-gray-100 to-blue-50">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1 min-w-0 border-x border-twitter-gray-200 bg-white/80 backdrop-blur-sm">
          {renderContent()}
        </div>
        
        {/* Right sidebar for trending/suggestions */}
        <div className="w-80 bg-gradient-to-b from-white/90 to-twitter-gray-50/90 backdrop-blur-sm p-6 hidden xl:block">
          <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 mb-6 border border-twitter-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <h3 className="text-xl font-bold mb-4 text-twitter-gray-800 bg-gradient-to-r from-twitter-accent to-twitter-purple bg-clip-text text-transparent">
              Tendances
            </h3>
            <div className="space-y-4">
              <div className="text-sm hover:bg-twitter-gray-50 rounded-lg p-3 transition-colors cursor-pointer">
                <p className="text-twitter-gray-500 font-medium">Tendance en Technologie</p>
                <p className="font-bold text-twitter-accent text-lg">#React</p>
                <p className="text-twitter-gray-400">42,1K Tweets</p>
              </div>
              <div className="text-sm hover:bg-twitter-gray-50 rounded-lg p-3 transition-colors cursor-pointer">
                <p className="text-twitter-gray-500 font-medium">Tendance</p>
                <p className="font-bold text-twitter-green text-lg">#JavaScript</p>
                <p className="text-twitter-gray-400">28,4K Tweets</p>
              </div>
              <div className="text-sm hover:bg-twitter-gray-50 rounded-lg p-3 transition-colors cursor-pointer">
                <p className="text-twitter-gray-500 font-medium">Tendance en Tech</p>
                <p className="font-bold text-twitter-purple text-lg">#TypeScript</p>
                <p className="text-twitter-gray-400">15,2K Tweets</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-twitter-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <h3 className="text-xl font-bold mb-4 text-twitter-gray-800 bg-gradient-to-r from-twitter-teal to-twitter-green bg-clip-text text-transparent">
              Qui suivre
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between hover:bg-twitter-gray-50 rounded-lg p-3 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face"
                      alt="Suggested user"
                      className="w-12 h-12 rounded-full border-2 border-gradient-to-r from-twitter-teal to-twitter-accent object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-twitter-green rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-twitter-gray-800">Alex Johnson</p>
                    <p className="text-twitter-gray-500 text-sm">@alexjohnson</p>
                  </div>
                </div>
                <button className="bg-gradient-to-r from-twitter-accent to-twitter-purple text-white px-6 py-2 rounded-full text-sm font-semibold hover:from-twitter-purple hover:to-twitter-accent transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105">
                  Suivre
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
