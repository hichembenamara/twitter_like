
import React, { useState } from 'react';
import { Heart, MessageSquare, Users, Bookmark, MoreHorizontal, UserPlus, UserMinus, Trash2 } from 'lucide-react';
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
import { useFriendStore } from '@/stores/friendStore';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface TweetCardProps {
  tweet: Tweet;
}

const TweetCard: React.FC<TweetCardProps> = ({ tweet }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const { likeTweet, retweetTweet, replyToTweet, bookmarkTweet, deleteTweet } = useTweetStore();
  const { blockUser, reportTweet } = useUserStore();
  const { addFriend, removeFriend, isFriend } = useFriendStore();
  const user = useAuthStore(state => state.user);

  const isLiked = user ? tweet.likes.includes(user.id) : false;
  const isRetweeted = user ? tweet.retweets.includes(user.id) : false;
  const isBookmarked = user ? tweet.bookmarks.includes(user.id) : false;
  const isUsersFriend = user ? isFriend(tweet.userId) : false;
  const isOwnTweet = user?.id === tweet.userId;

  const handleLike = async () => {
    if (user) {
      await likeTweet(tweet.id, user.id);
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

  const handleDelete = async () => {
    if (user && isOwnTweet) {
      try {
        await deleteTweet(tweet.id);
      } catch (error) {
        console.error('Failed to delete tweet:', error);
        // You could show a toast notification here
      }
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

  const handleToggleFriend = async () => {
    if (!user || isOwnTweet) return;
    
    if (isUsersFriend) {
      await removeFriend(tweet.userId);
    } else {
      await addFriend(tweet.userId);
    }
  };

  const renderTweetContent = (content: string) => {
    return content.split(/(\s+)/).map((word, index) => {
      if (word.startsWith('#')) {
        return (
          <span key={index} className="text-twitter-accent hover:text-twitter-purple font-semibold hover:underline cursor-pointer transition-colors">
            {word}
          </span>
        );
      }
      return word;
    });
  };

  return (
    <article className="p-4 sm:p-6 border-b border-twitter-gray-200 hover:bg-gradient-to-r hover:from-white hover:to-twitter-gray-50 transition-all duration-300 cursor-pointer bg-white/80 backdrop-blur-sm group">
      <div className="flex space-x-3 sm:space-x-4">
        <div className="relative flex-shrink-0">
          <img
            src={tweet.avatar}
            alt={tweet.displayName}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-3 border-gradient-to-r from-twitter-teal to-twitter-accent object-cover group-hover:scale-105 transition-transform duration-300 shadow-lg"
          />
          {tweet.isVerified && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-twitter-accent to-twitter-purple rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-xs font-bold">✓</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap">
              <h3 className="font-bold text-twitter-gray-800 text-sm sm:text-lg group-hover:text-twitter-accent transition-colors">{tweet.displayName}</h3>
              <span className="text-twitter-gray-500 text-sm hidden sm:inline font-medium">@{tweet.username}</span>
              <span className="text-twitter-gray-400 hidden sm:inline">•</span>
              <span className="text-twitter-gray-500 text-xs sm:text-sm font-medium">
                {(() => {
                  try {
                    const date = new Date(tweet.createdAt);
                    if (isNaN(date.getTime())) {
                      return 'maintenant';
                    }
                    return formatDistanceToNow(date, { addSuffix: true });
                  } catch {
                    return 'maintenant';
                  }
                })()}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {!isOwnTweet && user && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleFriend}
                  className={cn(
                    "text-xs px-3 py-2 h-auto rounded-full font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105",
                    isUsersFriend 
                      ? "bg-gradient-to-r from-twitter-green to-twitter-teal text-white border-0 hover:from-twitter-teal hover:to-twitter-green" 
                      : "border-2 border-twitter-accent text-twitter-accent hover:bg-twitter-accent hover:text-white"
                  )}
                >
                  {isUsersFriend ? (
                    <>
                      <UserMinus className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">Suivi</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">Suivre</span>
                    </>
                  )}
                </Button>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-twitter-white border-twitter-slate">
                  {isOwnTweet ? (
                    <DropdownMenuItem className="text-red-600" onClick={handleDelete}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer le Tweet
                    </DropdownMenuItem>
                  ) : (
                    <>
                      <DropdownMenuItem>Masquer @{tweet.username}</DropdownMenuItem>
                      <DropdownMenuItem onClick={handleBlock}>Bloquer @{tweet.username}</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={handleReport}>
                        Signaler le Tweet
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <p className="mt-3 text-twitter-gray-800 whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
            {renderTweetContent(tweet.content)}
          </p>
          
          {tweet.image && (
            <img
              src={tweet.image}
              alt="Tweet image"
              className="mt-4 rounded-3xl max-w-full h-auto shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-twitter-gray-200"
            />
          )}
          
          <div className="flex items-center justify-between mt-5 sm:mt-6 max-w-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="text-twitter-gray-500 hover:text-twitter-accent hover:bg-twitter-accent/10 p-2 sm:p-3 rounded-full transition-all duration-300 group hover:scale-110"
            >
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold">{tweet.replies.length}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRetweet}
              className={cn(
                "text-twitter-gray-500 hover:text-twitter-green hover:bg-twitter-green/10 p-2 sm:p-3 rounded-full transition-all duration-300 group hover:scale-110",
                isRetweeted && "text-twitter-green bg-twitter-green/20"
              )}
            >
              <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold">{tweet.retweets.length}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={cn(
                "text-twitter-gray-500 hover:text-red-500 hover:bg-red-50 p-2 sm:p-3 rounded-full transition-all duration-300 group hover:scale-110",
                isLiked && "text-red-500 bg-red-50"
              )}
            >
              <Heart className={cn("h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 group-hover:scale-110 transition-transform", isLiked && "fill-current")} />
              <span className="text-sm font-semibold">{tweet.likes.length}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmark}
              className={cn(
                "text-twitter-gray-500 hover:text-twitter-orange hover:bg-twitter-orange/10 p-2 sm:p-3 rounded-full transition-all duration-300 group hover:scale-110",
                isBookmarked && "text-twitter-orange bg-twitter-orange/20"
              )}
            >
              <Bookmark className={cn("h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform", isBookmarked && "fill-current")} />
            </Button>
          </div>
          
          {showReplyForm && (
            <div className="mt-6 ml-4 pl-6 border-l-3 border-gradient-to-b from-twitter-accent to-twitter-purple rounded-lg bg-gradient-to-r from-twitter-gray-50 to-white p-4">
              <div className="flex space-x-4">
                {user && (
                  <div className="relative">
                    <img
                      src={user.avatar}
                      alt={user.displayName}
                      className="w-10 h-10 rounded-full border-2 border-twitter-accent object-cover"
                    />
                    {user.isVerified && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-twitter-accent to-twitter-purple rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex-1">
                  <Textarea
                    placeholder="Partagez vos pensées..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="min-h-[100px] border-2 border-twitter-gray-200 rounded-2xl focus:border-twitter-accent transition-colors resize-none"
                  />
                  <div className="flex justify-end space-x-3 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowReplyForm(false)}
                      className="border-2 border-twitter-gray-300 text-twitter-gray-600 hover:bg-twitter-gray-100 rounded-full px-6"
                    >
                      Annuler
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleReply}
                      disabled={!replyContent.trim()}
                      className="bg-gradient-to-r from-twitter-accent to-twitter-purple text-white hover:from-twitter-purple hover:to-twitter-accent disabled:opacity-50 rounded-full px-6 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Répondre
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {tweet.replies.length > 0 && (
            <div className="mt-6 space-y-4">
              {tweet.replies.map((reply) => (
                <div key={reply.id} className="ml-4 pl-6 border-l-3 border-twitter-gray-200 bg-gradient-to-r from-twitter-gray-50 to-white rounded-lg p-4 hover:shadow-md transition-all duration-300">
                  <div className="flex space-x-3">
                    <img
                      src={reply.avatar}
                      alt={reply.displayName}
                      className="w-10 h-10 rounded-full border-2 border-twitter-teal object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-twitter-gray-800">{reply.displayName}</span>
                        <span className="text-twitter-gray-500 text-sm font-medium">@{reply.username}</span>
                        <span className="text-twitter-gray-400 text-sm">•</span>
                        <span className="text-twitter-gray-500 text-sm">
                          {(() => {
                            try {
                              const date = new Date(reply.createdAt);
                              if (isNaN(date.getTime())) {
                                return 'maintenant';
                              }
                              return formatDistanceToNow(date, { addSuffix: true });
                            } catch {
                              return 'maintenant';
                            }
                          })()}
                        </span>
                      </div>
                      <p className="text-twitter-gray-800 text-sm mt-2 leading-relaxed">{reply.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default TweetCard;
