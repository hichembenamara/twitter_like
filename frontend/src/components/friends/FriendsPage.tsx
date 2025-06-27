
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, UserPlus, UserMinus, Search, Users } from 'lucide-react';
import { useFriendStore, Friend } from '@/stores/friendStore';
import { useAuthStore } from '@/stores/authStore';
import ChatModal from './ChatModal';
import UserProfileCard from '../profile/UserProfileCard';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const FriendsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState<Friend | null>(null);
  const [showAllUsers, setShowAllUsers] = useState(true); // Always show all users for "qui suivre"
  const [loadingActions, setLoadingActions] = useState<Set<string>>(new Set());
  const { friends, allUsers, addFriend, removeFriend, isFriend, fetchFriends, fetchAllUsers } = useFriendStore();
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    fetchFriends();
    fetchAllUsers();
  }, [fetchFriends, fetchAllUsers]);

  const usersToShow = showAllUsers ? allUsers : friends;
  const filteredUsers = usersToShow
    .filter(person => user?.id !== person.id) // Don't show current user
    .filter(person =>
      person.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleAddFriend = async (friendId: string) => {
    if (!user) return;
    
    setLoadingActions(prev => new Set(prev).add(friendId));
    try {
      await addFriend(friendId);
    } catch (error) {
      console.error('Failed to follow user:', error);
      // You could show a toast notification here
    } finally {
      setLoadingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(friendId);
        return newSet;
      });
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!user) return;
    
    setLoadingActions(prev => new Set(prev).add(friendId));
    try {
      await removeFriend(friendId);
    } catch (error) {
      console.error('Failed to unfollow user:', error);
      // You could show a toast notification here
    } finally {
      setLoadingActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(friendId);
        return newSet;
      });
    }
  };

  const getStatusColor = (isOnline: boolean) => {
    return isOnline ? 'bg-green-500' : 'bg-gray-400';
  };

  useEffect(() => {
    fetchFriends();
    fetchAllUsers();
  }, [fetchFriends, fetchAllUsers]);

  return (
    <div className="flex-1 max-w-4xl mx-auto">
      <div className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-twitter-gray-200 p-6 z-10 shadow-sm">
        <div className="bg-gradient-to-r from-twitter-teal to-twitter-green rounded-2xl p-6 mb-6">
          <div className="flex items-center space-x-4">
            <Users className="h-8 w-8 text-white" />
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Qui suivre</h1>
              <p className="text-white/80 mt-1">Découvrez et suivez de nouveaux utilisateurs</p>
            </div>
          </div>
        </div>
        
        <div className="relative mb-4">
          <Search className="absolute left-4 top-4 h-5 w-5 text-twitter-gray-400" />
          <Input
            placeholder="Rechercher des utilisateurs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 pr-4 py-4 text-lg bg-gradient-to-r from-twitter-gray-100 to-white border-2 border-twitter-gray-300 rounded-2xl focus:border-twitter-teal transition-all duration-300"
          />
        </div>
        
        <div className="text-center">
          <p className="text-twitter-gray-600 font-medium">
            {allUsers.filter(u => u.id !== user?.id).length} utilisateurs disponibles
          </p>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {filteredUsers.length === 0 ? (
          <div className="bg-gradient-to-br from-white to-twitter-gray-50 rounded-3xl p-12 text-center shadow-lg border border-twitter-gray-200">
            <div className="bg-gradient-to-r from-twitter-teal to-twitter-green rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Users className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-twitter-gray-800 mb-3">
              Aucun utilisateur trouvé
            </h3>
            <p className="text-twitter-gray-500 text-lg">
              Essayez d'ajuster vos termes de recherche ou créez un autre compte pour tester
            </p>
          </div>
        ) : (
          filteredUsers.map((person) => (
            <div key={person.id} className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-twitter-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={person.avatar}
                      alt={person.displayName}
                      className="w-16 h-16 rounded-full cursor-pointer border-3 border-gradient-to-r from-twitter-teal to-twitter-accent object-cover group-hover:scale-105 transition-transform duration-300 shadow-lg"
                      onClick={() => setShowProfile(person)}
                    />
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white shadow-lg ${getStatusColor(person.isOnline)}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 
                        className="font-bold text-xl text-twitter-gray-800 cursor-pointer hover:text-twitter-teal transition-colors"
                        onClick={() => setShowProfile(person)}
                      >
                        {person.displayName}
                      </h3>
                      {person.isOnline && (
                        <Badge className="text-xs bg-gradient-to-r from-twitter-green to-twitter-teal text-white border-0 rounded-full px-3 py-1 font-semibold">
                          Online
                        </Badge>
                      )}
                    </div>
                    <p className="text-twitter-gray-500 font-medium mb-2">@{person.username}</p>
                    {person.bio && (
                      <p className="text-twitter-gray-600 leading-relaxed mb-3">{person.bio}</p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-twitter-gray-500">
                      <span className="font-medium">{person.mutualFriends} amis communs</span>
                      {!person.isOnline && (
                        <span>Vu pour la dernière fois {formatDistanceToNow(new Date(person.lastSeen), { addSuffix: true, locale: fr })}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  {isFriend(person.id) ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveFriend(person.id)}
                      disabled={loadingActions.has(person.id)}
                      className="border-2 border-red-400 text-red-500 hover:bg-red-50 rounded-full px-6 py-3 font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <UserMinus className="h-4 w-4" />
                      {loadingActions.has(person.id) && <span className="ml-2">...</span>}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleAddFriend(person.id)}
                      disabled={loadingActions.has(person.id)}
                      className="bg-gradient-to-r from-twitter-teal to-twitter-green text-white hover:from-twitter-green hover:to-twitter-teal rounded-full px-6 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <UserPlus className="h-4 w-4" />
                      {loadingActions.has(person.id) && <span className="ml-2">...</span>}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedFriend && (
        <ChatModal
          friendId={selectedFriend}
          onClose={() => setSelectedFriend(null)}
        />
      )}

      {showProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-md w-full mx-4 shadow-xl">
            <UserProfileCard
              user={showProfile}
              onClose={() => setShowProfile(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendsPage;
