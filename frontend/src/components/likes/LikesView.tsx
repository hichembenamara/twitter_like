
import React from 'react';
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
    <div className="flex-1 max-w-2xl mx-auto">
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 p-4 z-10">
        <h1 className="text-xl font-bold">Likes</h1>
      </div>
      
      <div className="p-4">
        {likedTweets.length > 0 ? (
          likedTweets.map((tweet) => (
            <TweetCard key={tweet.id} tweet={tweet} />
          ))
        ) : (
          <Card className="p-8 text-center">
            <p className="text-gray-500">You haven't liked any tweets yet.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LikesView;
