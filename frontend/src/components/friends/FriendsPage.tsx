
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, UserPlus, UserMinus, Search } from 'lucide-react';
import { useFriendStore } from '@/stores/friendStore';
import { useAuthStore } from '@/stores/authStore';
import ChatModal from './ChatModal';
import UserProfileCard from '../profile/UserProfileCard';
import { formatDistanceToNow } from 'date-fns';

const FriendsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState<string | null>(null);
  const { friends, addFriend, removeFriend, isFriend } = useFriendStore();
  const user = useAuthStore(state => state.user);

  const filteredFriends = friends.filter(friend =>
    friend.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    friend.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddFriend = (friendId: string) => {
    if (user) {
      addFriend(friendId, user.id);
    }
  };

  const handleRemoveFriend = (friendId: string) => {
    if (user) {
      removeFriend(friendId, user.id);
    }
  };

  const getStatusColor = (isOnline: boolean) => {
    return isOnline ? 'bg-green-500' : 'bg-gray-400';
  };

  return (
    <div className="flex-1 max-w-2xl mx-auto">
      <div className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 p-4 z-10">
        <h1 className="text-xl font-bold dark:text-white mb-4">Friends</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search friends..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="p-4 space-y-4">
        {filteredFriends.map((friend) => (
          <Card key={friend.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={friend.avatar}
                    alt={friend.displayName}
                    className="w-12 h-12 rounded-full cursor-pointer"
                    onClick={() => setShowProfile(friend.id)}
                  />
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(friend.isOnline)}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 
                      className="font-semibold dark:text-white cursor-pointer hover:underline"
                      onClick={() => setShowProfile(friend.id)}
                    >
                      {friend.displayName}
                    </h3>
                    {friend.isOnline && (
                      <Badge variant="secondary" className="text-xs">Online</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">@{friend.username}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{friend.bio}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>{friend.mutualFriends} mutual friends</span>
                    {!friend.isOnline && (
                      <span>Last seen {formatDistanceToNow(new Date(friend.lastSeen), { addSuffix: true })}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedFriend(friend.id)}
                  className="flex items-center space-x-1"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Chat</span>
                </Button>
                
                {user && isFriend(friend.id, user.id) ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveFriend(friend.id)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleAddFriend(friend.id)}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {selectedFriend && (
        <ChatModal
          friendId={selectedFriend}
          onClose={() => setSelectedFriend(null)}
        />
      )}

      {showProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 max-w-md w-full mx-4">
            <UserProfileCard
              userId={showProfile}
              onClose={() => setShowProfile(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendsPage;
