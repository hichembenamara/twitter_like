
import React from 'react';
import { Heart, Users, MessageSquare, UserPlus, Check } from 'lucide-react';
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
        return <Heart className="h-6 w-6 text-red-500" />;
      case 'retweet':
        return <Users className="h-6 w-6 text-green-500" />;
      case 'reply':
        return <MessageSquare className="h-6 w-6 text-blue-500" />;
      case 'follow':
        return <UserPlus className="h-6 w-6 text-purple-500" />;
      default:
        return null;
    }
  };

  const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case 'like':
        return `${notification.fromDisplayName} liked your tweet`;
      case 'retweet':
        return `${notification.fromDisplayName} retweeted your tweet`;
      case 'reply':
        return `${notification.fromDisplayName} replied to your tweet`;
      case 'follow':
        return `${notification.fromDisplayName} followed you`;
      default:
        return '';
    }
  };

  return (
    <div className="flex-1 max-w-2xl mx-auto">
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 p-4 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Notifications</h1>
          {notifications.some(n => !n.read) && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="flex items-center space-x-2"
            >
              <Check className="h-4 w-4" />
              <span>Mark all as read</span>
            </Button>
          )}
        </div>
      </div>

      <div className="p-4">
        {notifications.length > 0 ? (
          <div className="space-y-0">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={cn(
                  "p-4 cursor-pointer hover:bg-gray-50 transition-colors",
                  !notification.read && "border-blue-200 bg-blue-50/50"
                )}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <div className="flex space-x-3">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <img
                        src={notification.fromAvatar}
                        alt={notification.fromDisplayName}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-semibold">{notification.fromDisplayName}</span>
                          <span className="text-gray-500"> @{notification.fromUsername}</span>
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                          {getNotificationText(notification)}
                        </p>
                        {notification.tweetContent && (
                          <p className="text-sm text-gray-500 mt-2 italic">
                            "{notification.tweetContent.length > 100 
                              ? notification.tweetContent.substring(0, 100) + '...'
                              : notification.tweetContent}"
                          </p>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications yet</h3>
            <p className="text-gray-500">When someone likes, retweets, or follows you, it'll show up here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
