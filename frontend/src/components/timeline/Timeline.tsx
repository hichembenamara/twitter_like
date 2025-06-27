
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
    <div className="flex-1 max-w-4xl mx-auto">
      <div className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-twitter-gray-200 p-6 z-10 shadow-sm">
        <div className="bg-gradient-to-r from-twitter-accent to-twitter-purple rounded-2xl p-6">
          <h1 className="text-2xl font-black text-white tracking-tight">🏠 Fil d'actualité</h1>
          <p className="text-white/80 mt-2">Partagez vos pensées avec le monde</p>
        </div>
      </div>
      
      <div className="pb-6">
        <ComposeTweet />
        
        <div className="border-t border-twitter-gray-200">
          {timelineTweets.length > 0 ? (
            timelineTweets.map((tweet) => (
              <TweetCard key={tweet.id} tweet={tweet} />
            ))
          ) : (
            <div className="bg-gradient-to-br from-white to-twitter-gray-50 rounded-3xl p-12 text-center shadow-lg border border-twitter-gray-200 m-6">
              <div className="bg-gradient-to-r from-twitter-accent to-twitter-purple rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-twitter-gray-800 mb-3">Bienvenue sur Twitter-A !</h3>
              <p className="text-twitter-gray-500 text-lg">Aucun tweet pour le moment. Soyez le premier à partager quelque chose d'incroyable !</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
