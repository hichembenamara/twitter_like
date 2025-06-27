
import React, { useEffect } from 'react';
import ComposeTweet from '../tweets/ComposeTweet';
import TweetCard from '../tweets/TweetCard';
import { useTweetStore } from '@/stores/tweetStore';
import { useAuthStore } from '@/stores/authStore';

const Timeline: React.FC = () => {
  const tweets = useTweetStore(state => state.tweets);
  const fetchTweets = useTweetStore(state => state.fetchTweets);
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    fetchTweets();
  }, [fetchTweets]);

  // For demo purposes, show all tweets. In a real app, this would be filtered by following
  const timelineTweets = tweets;

  return (
    <div className="flex-1 max-w-2xl mx-auto border-l border-r border-gray-200 min-h-screen bg-white">
      <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-200 p-4 z-10">
        <h1 className="text-xl font-bold text-gray-900">Home</h1>
      </div>
      
      <div className="pb-4">
        <ComposeTweet />
        
        <div className="border-t border-gray-200">
          {timelineTweets.length > 0 ? (
            timelineTweets.map((tweet) => (
              <TweetCard key={tweet.id} tweet={tweet} />
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <div className="mb-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to Twitter!</h3>
              <p className="text-gray-500 mb-4">No tweets yet. Be the first to share something!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
