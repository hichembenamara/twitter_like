
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search, Users } from 'lucide-react';
import { useSearchStore } from '@/stores/searchStore';
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';
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
    <div className="flex-1 max-w-2xl mx-auto">
      <div className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 p-4 z-10">
        <h1 className="text-xl font-bold mb-4 dark:text-white">Search</h1>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search Twitter"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex space-x-4 mt-4">
          <Button
            variant={activeTab === 'tweets' ? 'default' : 'ghost'}
            onClick={() => {
              setActiveTab('tweets');
              if (searchQuery) searchTweets(searchQuery);
            }}
          >
            Tweets
          </Button>
          <Button
            variant={activeTab === 'users' ? 'default' : 'ghost'}
            onClick={() => {
              setActiveTab('users');
              if (searchQuery) searchUsers(searchQuery);
            }}
          >
            <Users className="h-4 w-4 mr-2" />
            Users
          </Button>
        </div>
      </div>

      <div className="p-4">
        {!searchQuery ? (
          <Card className="p-8 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-500 mb-2">Search Twitter</h3>
            <p className="text-gray-400">Find tweets and people on Twitter</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {activeTab === 'tweets' ? (
              searchResults.tweets.length > 0 ? (
                searchResults.tweets.map((tweet) => (
                  <TweetCard key={tweet.id} tweet={tweet} />
                ))
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-gray-500">No tweets found for "{searchQuery}"</p>
                </Card>
              )
            ) : (
              searchResults.users.length > 0 ? (
                searchResults.users.map((user) => (
                  <Card key={user.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div 
                        className="flex items-center space-x-3 cursor-pointer flex-1"
                        onClick={() => setSelectedUserId(user.id)}
                      >
                        <div className="relative">
                          <img
                            src={user.avatar}
                            alt={user.displayName}
                            className="w-12 h-12 rounded-full"
                          />
                          {user.isVerified && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold dark:text-white">{user.displayName}</p>
                          <p className="text-gray-500">@{user.username}</p>
                          {user.bio && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{user.bio}</p>
                          )}
                        </div>
                      </div>
                      {currentUser && currentUser.id !== user.id && (
                        <Button
                          variant={isFollowing(user.id, currentUser.id) ? "outline" : "default"}
                          size="sm"
                          onClick={() => handleFollowToggle(user.id)}
                          className={isFollowing(user.id, currentUser.id) ? "border-red-500 text-red-500 hover:bg-red-50" : "bg-blue-500 hover:bg-blue-600 text-white"}
                        >
                          {isFollowing(user.id, currentUser.id) ? 'Unfollow' : 'Follow'}
                        </Button>
                      )}
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-gray-500">No users found for "{searchQuery}"</p>
                </Card>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
