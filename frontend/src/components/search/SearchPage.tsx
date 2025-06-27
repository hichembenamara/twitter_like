
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search, Users } from 'lucide-react';
import { useSearchStore } from '@/stores/searchStore';
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';
import { cn } from '@/lib/utils';
import TweetCard from '../tweets/TweetCard';
import UserProfileCard from '../profile/UserProfileCard';

const SearchPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tweets' | 'users'>('tweets');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { searchQuery, searchResults, setSearchQuery, searchTweets, searchUsers, clearSearch } = useSearchStore();
  const currentUser = useAuthStore(state => state.user);
  const { followUser, unfollowUser, isFollowing } = useUserStore();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      if (activeTab === 'tweets') {
        searchTweets(query);
      } else {
        searchUsers(query);
      }
    } else {
      clearSearch();
    }
  };

  const handleFollowToggle = (userId: string) => {
    if (!currentUser) return;
    
    if (isFollowing(userId, currentUser.id)) {
      unfollowUser(userId, currentUser.id);
    } else {
      followUser(userId, currentUser.id);
    }
  };

  if (selectedUserId) {
    return (
      <div className="flex-1 max-w-2xl mx-auto p-4">
        <UserProfileCard 
          userId={selectedUserId} 
          onClose={() => setSelectedUserId(null)} 
        />
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-4xl mx-auto">
      <div className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-twitter-gray-200 p-6 z-10 shadow-sm">
        <div className="bg-gradient-to-r from-twitter-accent to-twitter-purple rounded-2xl p-6 mb-6">
          <h1 className="text-2xl font-black text-white mb-4 tracking-tight">🔍 Explorer Twitter-A</h1>
          <div className="relative">
            <Search className="absolute left-4 top-4 h-5 w-5 text-white/80" />
            <Input
              placeholder="Rechercher des tweets, des personnes et des sujets..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-12 pr-4 py-4 text-lg bg-white/20 backdrop-blur-md border-2 border-white/30 text-white placeholder-white/80 rounded-2xl focus:border-white focus:bg-white/30 transition-all duration-300"
            />
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            onClick={() => {
              setActiveTab('tweets');
              if (searchQuery) searchTweets(searchQuery);
            }}
            className={cn(
              "px-6 py-3 rounded-2xl font-semibold transition-all duration-300",
              activeTab === 'tweets' 
                ? "bg-gradient-to-r from-twitter-accent to-twitter-purple text-white shadow-lg" 
                : "text-twitter-gray-600 hover:bg-twitter-gray-100 hover:text-twitter-accent"
            )}
          >
            Tweets
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setActiveTab('users');
              if (searchQuery) searchUsers(searchQuery);
            }}
            className={cn(
              "px-6 py-3 rounded-2xl font-semibold transition-all duration-300",
              activeTab === 'users' 
                ? "bg-gradient-to-r from-twitter-teal to-twitter-green text-white shadow-lg" 
                : "text-twitter-gray-600 hover:bg-twitter-gray-100 hover:text-twitter-teal"
            )}
          >
            <Users className="h-4 w-4 mr-2" />
            Utilisateurs
          </Button>
        </div>
      </div>

      <div className="p-6">
        {!searchQuery ? (
          <div className="bg-gradient-to-br from-white to-twitter-gray-50 rounded-3xl p-12 text-center shadow-lg border border-twitter-gray-200">
            <div className="bg-gradient-to-r from-twitter-accent to-twitter-purple rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Search className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-twitter-gray-800 mb-3">Découvrez Twitter-A</h3>
            <p className="text-twitter-gray-500 text-lg">Trouvez des tweets incroyables et connectez-vous avec des personnes formidables</p>
          </div>
        ) : (
          <div className="space-y-6">
            {activeTab === 'tweets' ? (
              searchResults.tweets.length > 0 ? (
                <div className="space-y-4">
                  <div className="text-twitter-gray-600 font-semibold text-lg">
                    {searchResults.tweets.length} tweet{searchResults.tweets.length !== 1 ? 's' : ''} trouvé{searchResults.tweets.length !== 1 ? 's' : ''} pour "{searchQuery}"
                  </div>
                  {searchResults.tweets.map((tweet) => (
                    <TweetCard key={tweet.id} tweet={tweet} />
                  ))}
                </div>
              ) : (
                <div className="bg-gradient-to-br from-white to-red-50 rounded-3xl p-12 text-center shadow-lg border border-red-200">
                  <div className="bg-gradient-to-r from-red-400 to-red-500 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                    <Search className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-red-600 mb-2">Aucun tweet trouvé</h3>
                  <p className="text-red-500">Nous n'avons trouvé aucun tweet correspondant à "{searchQuery}"</p>
                </div>
              )
            ) : (
              searchResults.users.length > 0 ? (
                <div className="space-y-4">
                  <div className="text-twitter-gray-600 font-semibold text-lg">
                    {searchResults.users.length} utilisateur{searchResults.users.length !== 1 ? 's' : ''} trouvé{searchResults.users.length !== 1 ? 's' : ''} pour "{searchQuery}"
                  </div>
                  {searchResults.users.map((user) => (
                    <div key={user.id} className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-twitter-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 group">
                      <div className="flex items-center justify-between">
                        <div 
                          className="flex items-center space-x-4 cursor-pointer flex-1 group-hover:scale-102 transition-transform"
                          onClick={() => setSelectedUserId(user.id)}
                        >
                          <div className="relative">
                            <img
                              src={user.avatar}
                              alt={user.displayName}
                              className="w-16 h-16 rounded-full border-3 border-gradient-to-r from-twitter-teal to-twitter-accent object-cover"
                            />
                            {user.isVerified && (
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-twitter-accent to-twitter-purple rounded-full flex items-center justify-center shadow-lg">
                                <span className="text-white text-xs font-bold">✓</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-lg text-twitter-gray-800 group-hover:text-twitter-accent transition-colors">{user.displayName}</p>
                            <p className="text-twitter-gray-500 font-medium">@{user.username}</p>
                            {user.bio && (
                              <p className="text-sm text-twitter-gray-600 mt-2 leading-relaxed">{user.bio}</p>
                            )}
                          </div>
                        </div>
                        {currentUser && currentUser.id !== user.id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFollowToggle(user.id)}
                            className={cn(
                              "px-6 py-3 rounded-full font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105",
                              isFollowing(user.id, currentUser.id) 
                                ? "border-2 border-red-400 text-red-500 hover:bg-red-50" 
                                : "bg-gradient-to-r from-twitter-accent to-twitter-purple text-white border-0 hover:from-twitter-purple hover:to-twitter-accent"
                            )}
                          >
                            {isFollowing(user.id, currentUser.id) ? 'Ne plus suivre' : 'Suivre'}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gradient-to-br from-white to-orange-50 rounded-3xl p-12 text-center shadow-lg border border-orange-200">
                  <div className="bg-gradient-to-r from-twitter-orange to-yellow-500 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                    <Users className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-twitter-orange mb-2">Aucun utilisateur trouvé</h3>
                  <p className="text-orange-600">Nous n'avons trouvé aucun utilisateur correspondant à "{searchQuery}"</p>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
