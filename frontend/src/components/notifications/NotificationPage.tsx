
import React from 'react';
import { Heart, Users, MessageSquare, UserPlus, Check, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNotificationStore, Notification } from '@/stores/notificationStore';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const NotificationPage: React.FC = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotificationStore();

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'like':
        return (
          <div className="bg-gradient-to-r from-red-400 to-red-500 rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
            <Heart className="h-6 w-6 text-white fill-current" />
          </div>
        );
      case 'retweet':
        return (
          <div className="bg-gradient-to-r from-twitter-green to-twitter-teal rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
        );
      case 'reply':
        return (
          <div className="bg-gradient-to-r from-twitter-accent to-twitter-purple rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
            <MessageSquare className="h-6 w-6 text-white" />
          </div>
        );
      case 'follow':
        return (
          <div className="bg-gradient-to-r from-twitter-purple to-twitter-accent rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
            <UserPlus className="h-6 w-6 text-white" />
          </div>
        );
      default:
        return null;
    }
  };

  const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case 'like':
        return `a aimé votre tweet`;
      case 'retweet':
        return `a retweeté votre tweet`;
      case 'reply':
        return `a répondu à votre tweet`;
      case 'follow':
        return `a commencé à vous suivre`;
      default:
        return '';
    }
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto">
      <div className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-twitter-gray-200 p-6 z-10 shadow-sm">
        <div className="bg-gradient-to-r from-twitter-accent to-twitter-purple rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Bell className="h-8 w-8 text-white" />
              <h1 className="text-2xl font-black text-white tracking-tight">Notifications</h1>
            </div>
            {notifications.some(n => !n.read) && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="bg-white/20 backdrop-blur-md border-2 border-white/30 text-white hover:bg-white/30 hover:border-white rounded-full px-6 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Check className="h-4 w-4 mr-2" />
                <span>Tout marquer comme lu</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-twitter-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group",
                  !notification.read && "bg-gradient-to-r from-twitter-accent/5 to-twitter-purple/5 border-twitter-accent/30 shadow-twitter-accent/20"
                )}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <div className="flex space-x-4">
                  <div className="flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="relative">
                          <img
                            src={notification.fromAvatar}
                            alt={notification.fromDisplayName}
                            className="w-12 h-12 rounded-full border-3 border-gradient-to-r from-twitter-teal to-twitter-accent object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-twitter-green rounded-full border-2 border-white"></div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-bold text-lg text-twitter-gray-800 group-hover:text-twitter-accent transition-colors">{notification.fromDisplayName}</span>
                            <span className="text-twitter-gray-500 font-medium">@{notification.fromUsername}</span>
                            <span className="text-twitter-gray-400">•</span>
                            <span className="text-twitter-gray-500 text-sm font-medium">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-twitter-gray-700 text-base leading-relaxed">
                            <span className="font-semibold">{getNotificationText(notification)}</span>
                          </p>
                          {notification.tweetContent && (
                            <div className="mt-3 bg-gradient-to-r from-twitter-gray-50 to-white rounded-2xl p-4 border border-twitter-gray-200">
                              <p className="text-sm text-twitter-gray-600 leading-relaxed italic">
                                "{notification.tweetContent.length > 150 
                                  ? notification.tweetContent.substring(0, 150) + '...'
                                  : notification.tweetContent}"
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      {!notification.read && (
                        <div className="w-3 h-3 bg-gradient-to-r from-twitter-accent to-twitter-purple rounded-full flex-shrink-0 mt-2 animate-pulse shadow-lg" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gradient-to-br from-white to-twitter-gray-50 rounded-3xl p-12 text-center shadow-lg border border-twitter-gray-200">
            <div className="bg-gradient-to-r from-twitter-accent to-twitter-purple rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Bell className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-twitter-gray-800 mb-3">Tout est à jour !</h3>
            <p className="text-twitter-gray-500 text-lg">Quand quelqu'un aime, retweete, répond ou vous suit, vous le verrez ici.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
