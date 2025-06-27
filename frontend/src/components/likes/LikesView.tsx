
import React from 'react';
import { Heart } from 'lucide-react';
import { Card } from '@/components/ui/card';
import TweetCard from '../tweets/TweetCard';
import { useAuthStore } from '@/stores/authStore';
import { useTweetStore } from '@/stores/tweetStore';

const LikesView: React.FC = () => {
  const user = useAuthStore(state => state.user);
  const tweets = useTweetStore(state => state.tweets);

  if (!user) return null;

  const likedTweets = tweets.filter(tweet => tweet.likes.includes(user.id));

  return (
    <div className="flex-1 max-w-4xl mx-auto">
      <div className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-twitter-gray-200 p-6 z-10 shadow-sm">
        <div className="bg-gradient-to-r from-red-400 to-red-500 rounded-2xl p-6">
          <div className="flex items-center space-x-4">
            <Heart className="h-8 w-8 text-white fill-current" />
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Tweets aimés</h1>
              <p className="text-white/80 mt-1">Tous les tweets que vous avez aimés</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {likedTweets.length > 0 ? (
          <div className="space-y-0">
            {likedTweets.map((tweet) => (
              <TweetCard key={tweet.id} tweet={tweet} />
            ))}
          </div>
        ) : (
          <div className="bg-gradient-to-br from-white to-red-50 rounded-3xl p-12 text-center shadow-lg border border-red-200">
            <div className="bg-gradient-to-r from-red-400 to-red-500 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Heart className="h-12 w-12 text-white fill-current" />
            </div>
            <h3 className="text-2xl font-bold text-red-600 mb-3">Aucun tweet aimé pour le moment</h3>
            <p className="text-red-500 text-lg">Quand vous aimerez des tweets, ils apparaîtront ici pour un accès facile !</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LikesView;
