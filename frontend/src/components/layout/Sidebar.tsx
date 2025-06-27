
import React from 'react';
import { Home, Search, Bell, Mail, User, Heart, Users, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);

  const menuItems = [
    { key: 'home', label: 'Accueil', icon: Home },
    { key: 'search', label: 'Explorer', icon: Search },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'friends', label: 'Amis', icon: Users },
    { key: 'likes', label: 'Favoris', icon: Heart },
    { key: 'profile', label: 'Profil', icon: User },
  ];

  return (
    <div className="w-16 sm:w-72 bg-white/90 backdrop-blur-xl h-screen border-r border-twitter-gray-200 p-3 sm:p-6 flex flex-col shadow-lg">
      <div className="mb-8">
        <div className="bg-gradient-to-r from-twitter-accent to-twitter-purple rounded-2xl p-4 mb-4">
          <h1 className="text-xl sm:text-3xl font-black text-white hidden sm:block tracking-tight">
            🐦 Twitter-A
          </h1>
          <h1 className="text-2xl font-black text-white sm:hidden">🐦</h1>
        </div>
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <li key={item.key}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-left p-3 sm:p-4 h-auto rounded-2xl transition-all duration-300 group",
                    isActive 
                      ? "bg-gradient-to-r from-twitter-accent to-twitter-purple text-white shadow-lg transform scale-105" 
                      : "text-twitter-gray-700 hover:bg-twitter-gray-100 hover:text-twitter-accent hover:shadow-md hover:scale-102"
                  )}
                  onClick={() => onTabChange(item.key)}
                >
                  <Icon className={cn(
                    "h-5 w-5 sm:h-6 sm:w-6 sm:mr-4 transition-transform group-hover:scale-110",
                    isActive && "text-white"
                  )} />
                  <span className="text-base sm:text-lg font-semibold hidden sm:inline">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {user && (
        <div className="mt-auto space-y-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-left p-3 sm:p-4 h-auto rounded-2xl text-red-500 hover:text-red-600 hover:bg-red-50 transition-all duration-300 hover:scale-102"
            onClick={logout}
          >
            <LogOut className="h-5 w-5 sm:h-6 sm:w-6 sm:mr-4" />
            <span className="text-base sm:text-lg font-semibold hidden sm:inline">Déconnexion</span>
          </Button>
          <div className="bg-gradient-to-r from-twitter-gray-50 to-white rounded-2xl p-3 sm:p-4 border border-twitter-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer group">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={user.displayName}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-3 border-gradient-to-r from-twitter-teal to-twitter-accent object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-twitter-green rounded-full border-2 border-white"></div>
              </div>
              <div className="flex-1 min-w-0 hidden sm:block">
                <p className="font-bold text-twitter-gray-800 truncate group-hover:text-twitter-accent transition-colors">{user.displayName}</p>
                <p className="text-sm text-twitter-gray-500 truncate">@{user.username}</p>
              </div>
              <div className="hidden sm:block">
                <div className="w-2 h-2 bg-twitter-accent rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
