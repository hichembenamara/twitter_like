
import React, { useState } from 'react';
import { Heart, MessageSquare, Users, Bookmark, MoreHorizontal } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tweet } from '@/stores/tweetStore';
import { useTweetStore } from '@/stores/tweetStore';
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface TweetCardProps {
  tweet: Tweet;
}

const TweetCard: React.FC<TweetCardProps> = ({ tweet }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const { likeTweet, retweetTweet, replyToTweet, bookmarkTweet } = useTweetStore();
  const { blockUser, reportTweet } = useUserStore();
  const user = useAuthStore(state => state.user);
  const tweetUser = useUserStore(state => state.getUserById(tweet.userId));

  const isLiked = user ? tweet.likes.includes(user.id) : false;
  const isRetweeted = user ? tweet.retweets.includes(user.id) : false;
  const isBookmarked = user ? tweet.bookmarks.includes(user.id) : false;

  const handleLike = () => {
    if (user) {
      likeTweet(tweet.id, user.id);
    }
  };

  const handleRetweet = () => {
    if (user) {
      retweetTweet(tweet.id, user.id);
    }
  };

  const handleBookmark = () => {
    if (user) {
      bookmarkTweet(tweet.id, user.id);
    }
  };

  const handleReply = () => {
    if (user && replyContent.trim()) {
      replyToTweet(tweet.id, replyContent.trim());
      setReplyContent('');
      setShowReplyForm(false);
    }
  };

  const handleBlock = () => {
    if (user && user.id !== tweet.userId) {
      blockUser(tweet.userId, user.id);
    }
  };

  const handleReport = () => {
    if (user) {
      reportTweet(tweet.id, user.id);
    }
  };

  const renderTweetContent = (content: string) => {
    return content.split(/(\s+)/).map((word, index) => {
      if (word.startsWith('#')) {
        return (
          <span key={index} className="text-blue-500 hover:underline cursor-pointer">
            {word}
          </span>
        );
      }
      return word;
    });
  };

  return (
    <Card className="p-4 mb-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <div className="flex space-x-3">
        <div className="relative">
          <img
            src={tweet.avatar}
            alt={tweet.displayName}
            className="w-12 h-12 rounded-full"
          />
          {tweetUser?.isVerified && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">{tweet.displayName}</h3>
              <span className="text-gray-500">@{tweet.username}</span>
              <span className="text-gray-500">·</span>
              <span className="text-gray-500 text-sm">
                {formatDistanceToNow(new Date(tweet.createdAt), { addSuffix: true })}
              </span>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800">
                {user?.id !== tweet.userId && (
                  <>
                    <DropdownMenuItem>Follow @{tweet.username}</DropdownMenuItem>
                    <DropdownMenuItem>Mute @{tweet.username}</DropdownMenuItem>
                    <DropdownMenuItem onClick={handleBlock}>Block @{tweet.username}</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600" onClick={handleReport}>
                      Report Tweet
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <p className="mt-2 text-gray-900 dark:text-white whitespace-pre-wrap">
            {renderTweetContent(tweet.content)}
          </p>
          
          {tweet.image && (
            <img
              src={tweet.image}
              alt="Tweet image"
              className="mt-3 rounded-2xl max-w-full h-auto"
            />
          )}
          
          <div className="flex items-center justify-between mt-4 max-w-md">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-gray-500 hover:text-blue-500 hover:bg-blue-50"
            >
              <MessageSquare className="h-5 w-5 mr-1" />
              {tweet.replies.length}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRetweet}
              className={cn(
                "text-gray-500 hover:text-green-500 hover:bg-green-50",
                isRetweeted && "text-green-500"
              )}
            >
              <Users className="h-5 w-5 mr-1" />
              {tweet.retweets.length}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={cn(
                "text-gray-500 hover:text-red-500 hover:bg-red-50",
                isLiked && "text-red-500"
              )}
            >
              <Heart className={cn("h-5 w-5 mr-1", isLiked && "fill-current")} />
              {tweet.likes.length}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmark}
              className={cn(
                "text-gray-500 hover:text-blue-500 hover:bg-blue-50",
                isBookmarked && "text-blue-500"
              )}
            >
              <Bookmark className={cn("h-5 w-5", isBookmarked && "fill-current")} />
            </Button>
          </div>
          
          {showReplyForm && (
            <div className="mt-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
              <div className="flex space-x-3">
                {user && (
                  <div className="relative">
                    <img
                      src={user.avatar}
                      alt={user.displayName}
                      className="w-8 h-8 rounded-full"
                    />
                    {user.isVerified && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex-1">
                  <Textarea
                    placeholder="Tweet your reply"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <div className="flex justify-end space-x-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowReplyForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleReply}
                      disabled={!replyContent.trim()}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {tweet.replies.length > 0 && (
            <div className="mt-4 space-y-3">
              {tweet.replies.map((reply) => (
                <div key={reply.id} className="pl-4 border-l-2 border-gray-100">
                  <div className="flex space-x-2">
                    <img
                      src={reply.avatar}
                      alt={reply.displayName}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">{reply.displayName}</span>
                        <span className="text-gray-500 text-sm">@{reply.username}</span>
                        <span className="text-gray-500 text-sm">
                          {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-gray-900 text-sm mt-1">{reply.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default TweetCard;
