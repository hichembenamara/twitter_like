
import React from 'react';
import { Home, Search, Bell, Mail, User, Heart, Settings, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const user = useAuthStore(state => state.user);

  const menuItems = [
    { key: 'home', label: 'Home', icon: Home },
    { key: 'search', label: 'Explore', icon: Search },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'messages', label: 'Messages', icon: Mail },
    { key: 'friends', label: 'Friends', icon: Users },
    { key: 'likes', label: 'Bookmarks', icon: Heart },
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-900 h-screen border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-blue-500">Twitter</h1>
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.key}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-left p-3 h-auto",
                    activeTab === item.key && "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
                  )}
                  onClick={() => onTabChange(item.key)}
                >
                  <Icon className="mr-3 h-6 w-6" />
                  <span className="text-xl">{item.label}</span>
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {user && (
        <div className="mt-auto">
          <div className="flex items-center space-x-3 p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <img
              src={user.avatar}
              alt={user.displayName}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium dark:text-white truncate">{user.displayName}</p>
              <p className="text-sm text-gray-500 truncate">@{user.username}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
