
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useUserStore } from '@/stores/userStore';
import { useAuthStore } from '@/stores/authStore';
import { formatDistanceToNow } from 'date-fns';

interface UserProfileCardProps {
  userId: string;
  onClose?: () => void;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({ userId, onClose }) => {
  const { getUserById, followUser, unfollowUser, isFollowing } = useUserStore();
  const currentUser = useAuthStore(state => state.user);
  const user = getUserById(userId);

  if (!user || !currentUser) return null;

  const isCurrentUserFollowing = isFollowing(userId, currentUser.id);
  const isOwnProfile = currentUser.id === userId;

  const handleFollowToggle = () => {
    if (isCurrentUserFollowing) {
      unfollowUser(userId, currentUser.id);
    } else {
      followUser(userId, currentUser.id);
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <div className="relative">
        <img
          src={user.banner}
          alt="Profile banner"
          className="w-full h-32 object-cover rounded-lg"
        />
        <div className="relative -mt-8 flex justify-center">
          <div className="relative">
            <img
              src={user.avatar}
              alt={user.displayName}
              className="w-16 h-16 rounded-full border-4 border-white"
            />
            {user.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
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
            <strong>{user.following.length}</strong>{' '}
            <span className="text-gray-500">Following</span>
          </span>
          <span>
            <strong>{user.followers.length}</strong>{' '}
            <span className="text-gray-500">Followers</span>
          </span>
        </div>
        
        <p className="text-gray-500 text-sm mt-2">
          Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
        </p>
        
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
