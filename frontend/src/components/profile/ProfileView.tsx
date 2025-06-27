
import React, { useState, useEffect } from 'react';
import { User, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TweetCard from '../tweets/TweetCard';
import EditProfileModal from './EditProfileModal';
import { useAuthStore } from '@/stores/authStore';
import { useTweetStore } from '@/stores/tweetStore';
import { useFriendStore } from '@/stores/friendStore';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const ProfileView: React.FC = () => {
  const [loadingTweets, setLoadingTweets] = useState(false);
  const user = useAuthStore(state => state.user);
  const { getUserTweets, fetchUserTweets } = useTweetStore();
  const userTweets = useTweetStore(state => state.userTweets);
  const getAllTweets = useTweetStore(state => state.tweets);
  const { friends } = useFriendStore();

  useEffect(() => {
    if (user) {
      setLoadingTweets(true);
      fetchUserTweets()
        .finally(() => setLoadingTweets(false));
    }
  }, [user, fetchUserTweets]);

  if (!user) return null;

  const currentUserTweets = userTweets.length > 0 ? userTweets : getUserTweets(user.id);
  
  // Get tweets from friends for the "Friends Activity" tab
  const friendIds = friends.map(friend => friend.id);
  const friendsTweets = getAllTweets.filter(tweet => friendIds.includes(tweet.userId));

  return (
    <div className="flex-1 max-w-4xl mx-auto">
      <div className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-twitter-gray-200 p-6 z-10 shadow-sm">
        <div className="bg-gradient-to-r from-twitter-accent to-twitter-purple rounded-2xl p-6">
          <div className="flex items-center space-x-4">
            <User className="h-8 w-8 text-white" />
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Votre Profil</h1>
              <p className="text-white/80 mt-1">Gérez votre présence sur Twitter-A</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-twitter-gray-200 overflow-hidden mb-6">
          <div className="relative">
            <img
              src={user.banner}
              alt="Profile banner"
              className="w-full h-48 object-cover"
            />
            <div className="absolute -bottom-16 left-6">
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={user.displayName}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
                />
                {user.isVerified && (
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-twitter-accent to-twitter-purple rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="pt-20 p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-3xl font-black text-twitter-gray-800">{user.displayName}</h2>
                <p className="text-twitter-gray-500 text-lg font-medium">@{user.username}</p>
              </div>
              <EditProfileModal>
                <Button 
                  variant="outline"
                  className="bg-gradient-to-r from-twitter-accent to-twitter-purple text-white border-0 hover:from-twitter-purple hover:to-twitter-accent rounded-full px-6 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Modifier le profil
                </Button>
              </EditProfileModal>
            </div>
            
            {user.bio && (
              <p className="text-twitter-gray-700 text-lg leading-relaxed mb-6">{user.bio}</p>
            )}
            
            <div className="flex flex-wrap gap-6 mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-twitter-gray-800">{user.following.length}</span>
                <span className="text-twitter-gray-500 font-medium">Abonnements</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-twitter-gray-800">{user.followers.length}</span>
                <span className="text-twitter-gray-500 font-medium">Abonnés</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-twitter-gray-800">{friends.length}</span>
                <span className="text-twitter-gray-500 font-medium">Amis</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-twitter-gray-500">
              <Calendar className="h-4 w-4" />
              <span>Inscrit {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true, locale: fr })}</span>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="tweets" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-twitter-gray-100 rounded-2xl p-2">
            <TabsTrigger 
              value="tweets" 
              className="rounded-xl font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-twitter-accent data-[state=active]:to-twitter-purple data-[state=active]:text-white"
            >
              Vos Tweets ({currentUserTweets.length})
            </TabsTrigger>
            <TabsTrigger 
              value="friends" 
              className="rounded-xl font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-twitter-teal data-[state=active]:to-twitter-green data-[state=active]:text-white"
            >
              Activité des amis ({friendsTweets.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tweets" className="mt-6">
            {loadingTweets ? (
              <div className="bg-gradient-to-br from-white to-twitter-gray-50 rounded-3xl p-12 text-center shadow-lg border border-twitter-gray-200">
                <div className="bg-gradient-to-r from-twitter-accent to-twitter-purple rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center animate-pulse">
                  <User className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-twitter-gray-800 mb-3">Chargement de vos tweets...</h3>
                <p className="text-twitter-gray-500 text-lg">Veuillez patienter</p>
              </div>
            ) : currentUserTweets.length > 0 ? (
              <div className="space-y-0">
                {currentUserTweets.map((tweet) => (
                  <TweetCard key={tweet.id} tweet={tweet} />
                ))}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-white to-twitter-gray-50 rounded-3xl p-12 text-center shadow-lg border border-twitter-gray-200">
                <div className="bg-gradient-to-r from-twitter-accent to-twitter-purple rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <User className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-twitter-gray-800 mb-3">Aucun tweet pour le moment</h3>
                <p className="text-twitter-gray-500 text-lg">Partagez votre première pensée avec le monde !</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="friends" className="mt-6">
            {friendsTweets.length > 0 ? (
              <div className="space-y-0">
                {friendsTweets.map((tweet) => (
                  <TweetCard key={tweet.id} tweet={tweet} />
                ))}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-white to-twitter-gray-50 rounded-3xl p-12 text-center shadow-lg border border-twitter-gray-200">
                <div className="bg-gradient-to-r from-twitter-teal to-twitter-green rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <Users className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-twitter-gray-800 mb-3">Aucune activité d'amis</h3>
                <p className="text-twitter-gray-500 text-lg">Connectez-vous avec des amis pour voir leurs derniers tweets ici !</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfileView;
