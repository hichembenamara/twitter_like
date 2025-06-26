
import React from 'react';
import ComposeTweet from '../tweets/ComposeTweet';
import TweetCard from '../tweets/TweetCard';
import { useTweetStore } from '@/stores/tweetStore';
import { useAuthStore } from '@/stores/authStore';

const Timeline: React.FC = () => {
  const tweets = useTweetStore(state => state.tweets);
  const user = useAuthStore(state => state.user);

  // For demo purposes, show all tweets. In a real app, this would be filtered by following
  const timelineTweets = tweets;

  return (
    <div className="flex-1 max-w-2xl mx-auto">
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 p-4 z-10">
        <h1 className="text-xl font-bold">Home</h1>
      </div>
      
      <div className="p-4">
        <ComposeTweet />
        
        <div className="space-y-0">
          {timelineTweets.map((tweet) => (
            <TweetCard key={tweet.id} tweet={tweet} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
