
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TweetCard from '../tweets/TweetCard';
import EditProfileModal from './EditProfileModal';
import { useAuthStore } from '@/stores/authStore';
import { useTweetStore } from '@/stores/tweetStore';
import { useFriendStore } from '@/stores/friendStore';
import { formatDistanceToNow } from 'date-fns';

const ProfileView: React.FC = () => {
  const user = useAuthStore(state => state.user);
  const getUserTweets = useTweetStore(state => state.getUserTweets);
  const getAllTweets = useTweetStore(state => state.tweets);
  const { friends } = useFriendStore();

  if (!user) return null;

  const userTweets = getUserTweets(user.id);
  
  // Get tweets from friends for the "Friends Activity" tab
  const friendIds = friends.map(friend => friend.id);
  const friendsTweets = getAllTweets.filter(tweet => friendIds.includes(tweet.userId));

  return (
    <div className="flex-1 max-w-2xl mx-auto">
      <div className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 p-4 z-10">
        <h1 className="text-xl font-bold dark:text-white">Profile</h1>
      </div>
      
      <Card className="m-4">
        <div className="relative">
          <img
            src={user.banner}
            alt="Profile banner"
            className="w-full h-48 object-cover rounded-t-lg"
          />
          <div className="relative -mt-16 left-6">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.displayName}
                className="w-32 h-32 rounded-full border-4 border-white"
              />
              {user.isVerified && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="pt-4 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold dark:text-white">{user.displayName}</h2>
              <p className="text-gray-500">@{user.username}</p>
            </div>
            <EditProfileModal>
              <Button variant="outline">Edit Profile</Button>
            </EditProfileModal>
          </div>
          
          {user.bio && (
            <p className="mt-4 text-gray-900 dark:text-white">{user.bio}</p>
          )}
          
          <div className="flex space-x-6 mt-4 text-sm">
            <span>
              <strong>{user.following.length}</strong>{' '}
              <span className="text-gray-500">Following</span>
            </span>
            <span>
              <strong>{user.followers.length}</strong>{' '}
              <span className="text-gray-500">Followers</span>
            </span>
            <span>
              <strong>{friends.length}</strong>{' '}
              <span className="text-gray-500">Friends</span>
            </span>
          </div>
          
          <p className="text-gray-500 text-sm mt-2">
            Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
          </p>
        </div>
      </Card>
      
      <div className="px-4">
        <Tabs defaultValue="tweets" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tweets">Your Tweets</TabsTrigger>
            <TabsTrigger value="friends">Friends Activity</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tweets" className="mt-4">
            {userTweets.length > 0 ? (
              userTweets.map((tweet) => (
                <TweetCard key={tweet.id} tweet={tweet} />
              ))
            ) : (
              <Card className="p-8 text-center">
                <p className="text-gray-500">You haven't posted any tweets yet.</p>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="friends" className="mt-4">
            <h3 className="text-xl font-bold mb-4 dark:text-white">Friends Activity</h3>
            {friendsTweets.length > 0 ? (
              friendsTweets.map((tweet) => (
                <TweetCard key={tweet.id} tweet={tweet} />
              ))
            ) : (
              <Card className="p-8 text-center">
                <p className="text-gray-500">No recent activity from friends.</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfileView;
