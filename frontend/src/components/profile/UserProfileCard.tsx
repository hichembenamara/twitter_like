
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Calendar, Users, MessageSquare, Heart, UserPlus, UserMinus } from 'lucide-react';
import { useFriendStore, Friend } from '@/stores/friendStore';
import { useAuthStore } from '@/stores/authStore';
import { useTweetStore } from '@/stores/tweetStore';
import TweetCard from '../tweets/TweetCard';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface UserProfileCardProps {
  user: Friend;
  onClose?: () => void;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({ user, onClose }) => {
  const { addFriend, removeFriend, isFriend } = useFriendStore();
  const currentUser = useAuthStore(state => state.user);
  const { fetchUserTweets, tweets } = useTweetStore();
  const [userTweets, setUserTweets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  if (!user || !currentUser) return null;

  const isCurrentUserFollowing = isFriend(user.id);
  const isOwnProfile = currentUser.id === user.id;

  // Fetch user's tweets when component mounts
  useEffect(() => {
    const loadUserTweets = async () => {
      setLoading(true);
      try {
        const userSpecificTweets = await fetchUserTweets(user.id);
        if (userSpecificTweets) {
          setUserTweets(userSpecificTweets);
        } else {
          // Fallback to filtering existing tweets
          const filteredTweets = tweets.filter(tweet => tweet.userId === user.id);
          setUserTweets(filteredTweets);
        }
      } catch (error) {
        console.error('Failed to load user tweets:', error);
        setUserTweets([]);
      } finally {
        setLoading(false);
      }
    };

    loadUserTweets();
  }, [user.id, fetchUserTweets, tweets]);

  const handleFollowToggle = async () => {
    setActionLoading(true);
    try {
      if (isCurrentUserFollowing) {
        await removeFriend(user.id);
      } else {
        await addFriend(user.id);
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    } finally {
      setActionLoading(false);
    }
  };

  // Get user's liked tweets (for demonstration, filtering from all tweets)
  const likedTweets = tweets.filter(tweet => 
    tweet.likes.includes(user.id)
  );

  // Get tweets where user has commented
  const commentedTweets = tweets.filter(tweet => 
    tweet.replies.some(reply => reply.userId === user.id)
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative">
          <img
            src={user.banner || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=200&fit=crop'}
            alt="Profile banner"
            className="w-full h-48 object-cover"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white rounded-full p-2"
          >
            <X className="h-5 w-5" />
          </Button>
          
          <div className="absolute -bottom-16 left-6">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.displayName}
                className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
              />
              {user.isOnline && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white" />
              )}
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="px-6 pt-20 pb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-black text-twitter-gray-800">{user.displayName}</h1>
              <p className="text-twitter-gray-500 text-lg font-medium">@{user.username}</p>
            </div>
            
            {!isOwnProfile && (
              <Button
                onClick={handleFollowToggle}
                disabled={actionLoading}
                className={
                  isCurrentUserFollowing
                    ? "bg-red-500 hover:bg-red-600 text-white border-0 rounded-full px-6 py-3 font-semibold"
                    : "bg-gradient-to-r from-twitter-accent to-twitter-purple text-white border-0 hover:from-twitter-purple hover:to-twitter-accent rounded-full px-6 py-3 font-semibold"
                }
              >
                {actionLoading ? (
                  '...'
                ) : isCurrentUserFollowing ? (
                  <>
                    <UserMinus className="h-4 w-4 mr-2" />
                    Ne plus suivre
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Suivre
                  </>
                )}
              </Button>
            )}
          </div>
          
          {user.bio && (
            <p className="text-twitter-gray-700 text-lg leading-relaxed mb-6">{user.bio}</p>
          )}
          
          <div className="flex space-x-6 mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-twitter-gray-800">{user.mutualFriends}</span>
              <span className="text-twitter-gray-500 font-medium">Amis communs</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`w-3 h-3 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-twitter-gray-500 font-medium">
                {user.isOnline ? 'En ligne' : 'Hors ligne'}
              </span>
            </div>
            {!user.isOnline && (
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-twitter-gray-400" />
                <span className="text-twitter-gray-500 text-sm">
                  Vu {formatDistanceToNow(new Date(user.lastSeen), { addSuffix: true, locale: fr })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-twitter-gray-200">
          <Tabs defaultValue="tweets" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-transparent border-b border-twitter-gray-200">
              <TabsTrigger 
                value="tweets" 
                className="flex items-center space-x-2 py-4 border-b-2 border-transparent data-[state=active]:border-twitter-accent data-[state=active]:bg-transparent"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Tweets ({userTweets.length})</span>
              </TabsTrigger>
              <TabsTrigger 
                value="likes" 
                className="flex items-center space-x-2 py-4 border-b-2 border-transparent data-[state=active]:border-red-500 data-[state=active]:bg-transparent"
              >
                <Heart className="h-4 w-4" />
                <span>Likes ({likedTweets.length})</span>
              </TabsTrigger>
              <TabsTrigger 
                value="comments" 
                className="flex items-center space-x-2 py-4 border-b-2 border-transparent data-[state=active]:border-twitter-teal data-[state=active]:bg-transparent"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Commentaires ({commentedTweets.length})</span>
              </TabsTrigger>
            </TabsList>
            
            <div className="max-h-96 overflow-y-auto">
              <TabsContent value="tweets" className="p-0">
                {loading ? (
                  <div className="p-6 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-twitter-accent mx-auto"></div>
                    <p className="mt-2 text-twitter-gray-500">Chargement des tweets...</p>
                  </div>
                ) : userTweets.length > 0 ? (
                  <div className="space-y-0">
                    {userTweets.map((tweet) => (
                      <TweetCard key={tweet.id} tweet={tweet} />
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <MessageSquare className="h-12 w-12 text-twitter-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-twitter-gray-800 mb-2">Aucun tweet</h3>
                    <p className="text-twitter-gray-500">Cet utilisateur n'a pas encore publié de tweets.</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="likes" className="p-0">
                {likedTweets.length > 0 ? (
                  <div className="space-y-0">
                    {likedTweets.map((tweet) => (
                      <TweetCard key={tweet.id} tweet={tweet} />
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <Heart className="h-12 w-12 text-twitter-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-twitter-gray-800 mb-2">Aucun like</h3>
                    <p className="text-twitter-gray-500">Cet utilisateur n'a aimé aucun tweet pour le moment.</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="comments" className="p-0">
                {commentedTweets.length > 0 ? (
                  <div className="space-y-0">
                    {commentedTweets.map((tweet) => (
                      <TweetCard key={tweet.id} tweet={tweet} />
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <MessageSquare className="h-12 w-12 text-twitter-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-twitter-gray-800 mb-2">Aucun commentaire</h3>
                    <p className="text-twitter-gray-500">Cet utilisateur n'a commenté aucun tweet pour le moment.</p>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default UserProfileCard;
