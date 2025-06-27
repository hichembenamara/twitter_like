
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useFriendStore, Friend } from '@/stores/friendStore';
import { useAuthStore } from '@/stores/authStore';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface UserProfileCardProps {
  user: Friend;
  onClose?: () => void;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({ user, onClose }) => {
  const { addFriend, removeFriend, isFriend } = useFriendStore();
  const currentUser = useAuthStore(state => state.user);

  if (!user || !currentUser) return null;

  const isCurrentUserFollowing = isFriend(user.id);
  const isOwnProfile = currentUser.id === user.id;

  const handleFollowToggle = () => {
    if (isCurrentUserFollowing) {
      removeFriend(user.id);
    } else {
      addFriend(user.id);
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <div className="relative">
        <div className="w-full h-32 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg" />
        <div className="relative -mt-8 flex justify-center">
          <div className="relative">
            <img
              src={user.avatar}
              alt={user.displayName}
              className="w-16 h-16 rounded-full border-4 border-white object-cover"
            />
            {user.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
            )}
          </div>
        </div>
      </div>
      
      <div className="text-center mt-4">
        <h2 className="text-xl font-bold">{user.displayName}</h2>
        <p className="text-gray-500">@{user.username}</p>
        
        {user.bio && (
          <p className="mt-3 text-gray-900 dark:text-white">{user.bio}</p>
        )}
        
        <div className="flex justify-center space-x-6 mt-4 text-sm">
          <span>
            <strong>{user.mutualFriends}</strong>{' '}
            <span className="text-gray-500">Amis communs</span>
          </span>
          <span>
            <span className={`inline-block w-2 h-2 rounded-full mr-1 ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="text-gray-500">{user.isOnline ? 'En ligne' : 'Hors ligne'}</span>
          </span>
        </div>
        
        {!user.isOnline && (
          <p className="text-gray-500 text-sm mt-2">
            Vu pour la dernière fois {formatDistanceToNow(new Date(user.lastSeen), { addSuffix: true, locale: fr })}
          </p>
        )}
        
        <div className="flex space-x-2 mt-4">
          {!isOwnProfile && (
            <Button
              onClick={handleFollowToggle}
              variant={isCurrentUserFollowing ? "outline" : "default"}
              className={isCurrentUserFollowing ? "border-red-500 text-red-500 hover:bg-red-50" : "bg-blue-500 hover:bg-blue-600 text-white"}
            >
              {isCurrentUserFollowing ? 'Unfollow' : 'Follow'}
            </Button>
          )}
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default UserProfileCard;
