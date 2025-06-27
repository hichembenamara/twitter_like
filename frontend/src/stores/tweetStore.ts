import { create } from 'zustand';
import { useNotificationStore } from './notificationStore';

export interface Tweet {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatar: string;
  content: string;
  image?: string;
  likes: string[]; // Store user IDs who liked
  retweets: string[]; // Store user IDs who retweeted
  replies: Reply[];
  bookmarks: string[]; // Store user IDs who bookmarked
  hashtags: string[];
  createdAt: string;
}

export interface Reply {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatar: string;
  content: string;
  createdAt: string;
}

interface BackendPost {
  id: number;
  Titre: string;
  Contenu: string;
  imageName?: string;
  user_created: {
    id: number;
    nom: string;
    username: string;
    imageName?: string;
  };
  likes?: Array<{ id: number }>;
  comment?: Array<{
    id: number;
    Contenu: string;
    user_created: {
      id: number;
      nom: string;
      username?: string;
      imageName?: string;
    };
  }>;
  createdAt: string;
}

interface TweetState {
  tweets: Tweet[];
  userTweets: Tweet[];
  fetchTweets: () => Promise<void>;
  fetchUserTweets: (userId?: string) => Promise<Tweet[] | void>;
  addTweet: (content: string, image?: string) => void;
  deleteTweet: (tweetId: string) => Promise<void>;
  likeTweet: (tweetId: string, userId: string) => Promise<void>;
  retweetTweet: (tweetId: string, userId: string) => void;
  replyToTweet: (tweetId: string, content: string) => void;
  bookmarkTweet: (tweetId: string, userId: string) => void;
  getUserTweets: (userId: string) => Tweet[];
  getUserBookmarks: (userId: string) => Tweet[];
  getTimelineTweets: (followingIds: string[]) => Tweet[];
  extractHashtags: (content: string) => string[];
}

/*
const mockTweets: Tweet[] = [
  {
    id: '1',
    userId: '1',
    username: 'john_doe',
    displayName: 'John Doe',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    content: 'Just shipped a new feature! React 18 concurrent features are amazing 🚀 #React #JavaScript #WebDev',
    likes: ['2', '3'],
    retweets: ['4'],
    replies: [],
    bookmarks: ['2'],
    hashtags: ['React', 'JavaScript', 'WebDev'],
    createdAt: '2024-06-25T10:30:00Z',
  },
  // ... other mock tweets were here
];
*/

export const useTweetStore = create<TweetState>((set, get) => ({
  tweets: [],
  userTweets: [],

  fetchTweets: async () => {
    try {
      const response = await fetch('/api/posts', {
        credentials: 'include' // Include cookies for session auth
      }); // As defined in PostController
      if (!response.ok) {
        throw new Error('Failed to fetch tweets');
      }
      const backendPosts = await response.json();

      // Map backend Post structure to frontend Tweet structure
      const formattedTweets: Tweet[] = backendPosts.map((post: BackendPost) => {
        // Basic mapping, needs refinement based on actual backend response structure
        // And how User entity (user_created, likes) is serialized
        const author = post.user_created || { id: 'unknown', nom: 'Unknown', imageFile: '' };
        const likesUserIds = post.likes?.map((user) => user.id?.toString()) || [];
        const repliesFormatted = post.comment?.map((c) => ({
          id: c.id?.toString(),
          userId: c.user_created?.id?.toString() || 'unknown_reply_user',
          username: c.user_created?.username || c.user_created?.nom || 'Unknown',
          displayName: c.user_created?.nom || 'Unknown',
          avatar: c.user_created?.imageName ? `/images/user/${c.user_created.imageName}` : '/placeholder.svg',
          content: c.Contenu,
          createdAt: c.Creation,
        })) || [];


        return {
          id: post.id?.toString(),
          userId: author.id?.toString(),
          username: author.username || author.nom || 'Unknown',
          displayName: author.nom || 'Unknown',
          avatar: author.imageName ? `/images/user/${author.imageName}` : '/placeholder.svg',
          content: post.Contenu || post.Titre || '', // Backend has Titre & Contenu
          image: post.Media, // Assuming Media is the image URL
          likes: likesUserIds,
          retweets: [], // Placeholder, backend Post entity doesn't have retweets
          replies: repliesFormatted,
          bookmarks: [], // Placeholder, backend Post entity doesn't have bookmarks
          hashtags: get().extractHashtags(post.Contenu || post.Titre || ''), // Basic hashtag extraction
          createdAt: post.Creation,
        };
      });
      set({ tweets: formattedTweets });
    } catch (error) {
      console.error("Error fetching tweets:", error);
      // Optionally set an error state or show a notification
    }
  },

  fetchUserTweets: async (userId?: string) => {
    try {
      const endpoint = userId ? `/api/users/${userId}/posts` : '/api/me/posts';
      const response = await fetch(endpoint, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user tweets');
      }
      
      const backendPosts = await response.json();
      
      // Map backend Post structure to frontend Tweet structure
      const formattedTweets: Tweet[] = backendPosts.map((post: BackendPost) => {
        const author = post.user_created || { id: 'unknown', nom: 'Unknown', imageFile: '' };
        const likesUserIds = post.likes?.map((user) => user.id?.toString()) || [];
        const repliesFormatted = post.comment?.map((c) => ({
          id: c.id?.toString(),
          userId: c.user_created?.id?.toString() || 'unknown_reply_user',
          username: c.user_created?.username || c.user_created?.nom || 'Unknown',
          displayName: c.user_created?.nom || 'Unknown',
          avatar: c.user_created?.imageName ? `/images/user/${c.user_created.imageName}` : '/placeholder.svg',
          content: c.Contenu,
          createdAt: new Date().toISOString(),
        })) || [];

        return {
          id: post.id?.toString(),
          userId: author.id?.toString(),
          username: author.username || author.nom || 'Unknown',
          displayName: author.nom || 'Unknown',
          avatar: author.imageName ? `/images/user/${author.imageName}` : '/placeholder.svg',
          content: post.Contenu,
          image: post.imageName ? `/images/post/${post.imageName}` : undefined,
          likes: likesUserIds,
          retweets: [],
          replies: repliesFormatted,
          bookmarks: [],
          hashtags: get().extractHashtags(post.Contenu || post.Titre || ''),
          createdAt: post.createdAt,
        };
      });
      
      if (userId) {
        // If fetching for specific user, just return the data without storing
        // This could be enhanced to store user-specific tweets separately
        return formattedTweets;
      } else {
        // Store current user's tweets
        set({ userTweets: formattedTweets });
      }
    } catch (error) {
      console.error("Error fetching user tweets:", error);
      throw error;
    }
  },

  extractHashtags: (content: string) => {
    const hashtags = content.match(/#[a-zA-Z0-9_]+/g) || [];
    return hashtags.map(tag => tag.slice(1)); // Remove # symbol
  },

  addTweet: async (content: string, image?: string) => {
    const userStr = localStorage.getItem('twitter-user');
    if (!userStr) {
      console.error("User not logged in. Cannot add tweet.");
      // Optionally, trigger a redirect to login or show a message
      return;
    }
    // const loggedInUser = JSON.parse(userStr); // We have user details, but backend uses authenticated user

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        credentials: 'include', // Include cookies for session auth
        headers: {
          'Content-Type': 'application/json',
          // Authorization header might be needed if not using session cookies,
          // but for session cookies, browser handles it.
        },
        body: JSON.stringify({ content, image }),
      });

      if (!response.ok) {
        // const errorData = await response.json().catch(() => null);
        // console.error('Failed to add tweet:', response.status, errorData);
        throw new Error(`Failed to add tweet: ${response.statusText}`);
      }

      const createdPostFromBackend = await response.json();

      // Map backend Post to frontend Tweet structure (similar to fetchTweets mapping)
      // This ensures consistency if backend returns slightly different structure than frontend expects
      // For simplicity, assuming createdPostFromBackend is already in a good format or
      // that the mapping in fetchTweets is robust enough.
      // A more robust solution would be a dedicated mapping function.

      // Example of re-using mapping logic (conceptual, adapt fields as needed)
      const author = createdPostFromBackend.user_created || { id: 'unknown', nom: 'Unknown', imageFile: '' };
      const likesUserIds = createdPostFromBackend.likes?.map((user: { id: number }) => user.id?.toString()) || [];
      const repliesFormatted = createdPostFromBackend.comment?.map((c: { id: number; Contenu: string; user_created: { id: number; nom: string; imageFile?: string }; Creation: string }) => ({
        id: c.id?.toString(),
        userId: c.user_created?.id?.toString() || 'unknown_reply_user',
        username: c.user_created?.nom || 'Unknown',
        displayName: c.user_created?.nom || 'Unknown',
        avatar: c.user_created?.imageFile || '',
        content: c.Contenu,
        createdAt: c.Creation,
      })) || [];

      const newTweet: Tweet = {
        id: createdPostFromBackend.id?.toString(),
        userId: author.id?.toString(),
        username: author.username || author.nom || 'Unknown',
        displayName: author.nom || 'Unknown',
        avatar: author.imageName ? `/images/user/${author.imageName}` : '/placeholder.svg',
        content: createdPostFromBackend.Contenu || createdPostFromBackend.Titre || '',
        image: createdPostFromBackend.Media,
        likes: likesUserIds,
        retweets: [], // Assuming not part of create response initially
        replies: repliesFormatted, // Assuming comments might be part of create response (usually not)
        bookmarks: [], // Assuming not part of create response
        hashtags: get().extractHashtags(createdPostFromBackend.Contenu || createdPostFromBackend.Titre || ''),
        createdAt: createdPostFromBackend.Creation,
      };

      set(state => ({
        tweets: [newTweet, ...state.tweets], // Add new tweet to the beginning of the list
        userTweets: [newTweet, ...state.userTweets] // Also add to user tweets
      }));

    } catch (error) {
      console.error("Error adding tweet:", error);
      // Optionally, show a notification to the user
    }
  },

  deleteTweet: async (tweetId: string) => {
    try {
      const response = await fetch(`/api/posts/${tweetId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete tweet');
      }

      // Remove tweet from both tweets and userTweets arrays
      set(state => ({
        tweets: state.tweets.filter(tweet => tweet.id !== tweetId),
        userTweets: state.userTweets.filter(tweet => tweet.id !== tweetId)
      }));

    } catch (error) {
      console.error('Error deleting tweet:', error);
      throw error;
    }
  },

  likeTweet: async (tweetId: string, userId: string) => {
    try {
      const response = await fetch(`/api/posts/${tweetId}/like`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to like/unlike post');
      }

      // Update local state optimistically
      const tweet = get().tweets.find(t => t.id === tweetId);
      const wasLiked = tweet?.likes.includes(userId);
      
      set(state => ({
        tweets: state.tweets.map(currentTweet => {
          if (currentTweet.id === tweetId) {
            const newLikes = currentTweet.likes.includes(userId)
              ? currentTweet.likes.filter(id => id !== userId)
              : [...currentTweet.likes, userId];
            
            if (!wasLiked && currentTweet.userId !== userId) {
              const currentUser = JSON.parse(localStorage.getItem('twitter-user') || '{}');
              useNotificationStore.getState().addNotification({
                type: 'like',
                fromUserId: userId,
                fromUsername: currentUser.username,
                fromDisplayName: currentUser.displayName,
                fromAvatar: currentUser.avatar,
                tweetId: currentTweet.id,
                tweetContent: currentTweet.content
              });
            }
            return { ...currentTweet, likes: newLikes };
          }
          return currentTweet;
        })
      }));
    } catch (error) {
      console.error('Error liking tweet:', error);
    }
  },

  retweetTweet: (tweetId: string, userId: string) => {
    // Mock implementation
    const tweet = get().tweets.find(t => t.id === tweetId);
    const wasRetweeted = tweet?.retweets.includes(userId);

    set(state => ({
      tweets: state.tweets.map(currentTweet => {
        if (currentTweet.id === tweetId) {
          const newRetweets = currentTweet.retweets.includes(userId)
            ? currentTweet.retweets.filter(id => id !== userId)
            : [...currentTweet.retweets, userId];

          if (!wasRetweeted && currentTweet.userId !== userId) {
            const currentUser = JSON.parse(localStorage.getItem('twitter-user') || '{}');
            useNotificationStore.getState().addNotification({
              type: 'retweet',
              fromUserId: userId,
              fromUsername: currentUser.username,
              fromDisplayName: currentUser.displayName,
              fromAvatar: currentUser.avatar,
              tweetId: currentTweet.id,
              tweetContent: currentTweet.content
            });
          }
          return { ...currentTweet, retweets: newRetweets };
        }
        return currentTweet;
      })
    }));
    // TODO: API call for retweets
  },

  replyToTweet: (tweetId: string, content: string) => {
    // Mock implementation
    const userStr = localStorage.getItem('twitter-user');
    if (!userStr) return;
    const user = JSON.parse(userStr);

    const newReply: Reply = {
      id: Date.now().toString(),
      userId: user.id,
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar,
      content,
      createdAt: new Date().toISOString(),
    };

    set(state => ({
      tweets: state.tweets.map(tweet => {
        if (tweet.id === tweetId) {
          if (tweet.userId !== user.id) {
            useNotificationStore.getState().addNotification({
              type: 'reply',
              fromUserId: user.id,
              fromUsername: user.username,
              fromDisplayName: user.displayName,
              fromAvatar: user.avatar,
              tweetId: tweet.id,
              tweetContent: tweet.content
            });
          }
          return { ...tweet, replies: [...tweet.replies, newReply] };
        }
        return tweet;
      })
    }));
    // TODO: API call for replies
  },

  bookmarkTweet: (tweetId: string, userId: string) => {
    // Mock implementation
    set(state => ({
      tweets: state.tweets.map(tweet => {
        if (tweet.id === tweetId) {
          const newBookmarks = tweet.bookmarks.includes(userId)
            ? tweet.bookmarks.filter(id => id !== userId)
            : [...tweet.bookmarks, userId];
          return { ...tweet, bookmarks: newBookmarks };
        }
        return tweet;
      })
    }));
    // TODO: API call for bookmarks
  },

  getUserBookmarks: (userId: string) => {
    return get().tweets.filter(tweet => tweet.bookmarks.includes(userId));
  },

  getUserTweets: (userId: string) => {
    // First check userTweets for the current user, then fallback to filtered tweets
    const currentUserTweets = get().userTweets;
    if (currentUserTweets.length > 0 && currentUserTweets[0]?.userId === userId) {
      return currentUserTweets;
    }
    return get().tweets.filter(tweet => tweet.userId === userId);
  },

  getTimelineTweets: (followingIds: string[]) => {
    // This should ideally be handled by a specific backend API endpoint for feeds
    return get().tweets.filter(tweet => 
      followingIds.includes(tweet.userId) || get().tweets.map(t => t.userId).includes(tweet.userId) // Fallback to all tweets if no following specified
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
}));
