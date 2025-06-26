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

interface TweetState {
  tweets: Tweet[];
  fetchTweets: () => Promise<void>;
  addTweet: (content: string, image?: string) => void;
  likeTweet: (tweetId: string, userId: string) => void;
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

  fetchTweets: async () => {
    try {
      const response = await fetch('/api/posts'); // As defined in PostController
      if (!response.ok) {
        throw new Error('Failed to fetch tweets');
      }
      const backendPosts = await response.json();

      // Map backend Post structure to frontend Tweet structure
      const formattedTweets: Tweet[] = backendPosts.map((post: any) => {
        // Basic mapping, needs refinement based on actual backend response structure
        // And how User entity (user_created, likes) is serialized
        const author = post.user_created || { id: 'unknown', nom: 'Unknown', imageFile: '' };
        const likesUserIds = post.likes?.map((user: any) => user.id?.toString()) || [];
        const repliesFormatted = post.comment?.map((c: any) => ({
          id: c.id?.toString(),
          userId: c.user_created?.id?.toString() || 'unknown_reply_user',
          username: c.user_created?.nom || 'Unknown', // Assuming 'nom' is username/displayName for replies
          displayName: c.user_created?.nom || 'Unknown',
          avatar: c.user_created?.imageFile || '', // Or a default avatar
          content: c.Contenu,
          createdAt: c.Creation,
        })) || [];


        return {
          id: post.id?.toString(),
          userId: author.id?.toString(),
          username: author.nom || 'Unknown', // Assuming 'nom' is the username/displayName
          displayName: author.nom || 'Unknown',
          avatar: author.imageFile || '', // Need to ensure this path is correct or use a default
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
      const likesUserIds = createdPostFromBackend.likes?.map((user: any) => user.id?.toString()) || [];
      const repliesFormatted = createdPostFromBackend.comment?.map((c: any) => ({
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
        username: author.nom || 'Unknown',
        displayName: author.nom || 'Unknown',
        avatar: author.imageFile || '',
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
        tweets: [newTweet, ...state.tweets] // Add new tweet to the beginning of the list
      }));

    } catch (error) {
      console.error("Error adding tweet:", error);
      // Optionally, show a notification to the user
    }
  },

  likeTweet: (tweetId: string, userId: string) => {
    // This is a mock implementation, will be replaced by API call
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
    // TODO: API call to like/unlike
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
    return get().tweets.filter(tweet => tweet.userId === userId);
  },

  getTimelineTweets: (followingIds: string[]) => {
    // This should ideally be handled by a specific backend API endpoint for feeds
    return get().tweets.filter(tweet => 
      followingIds.includes(tweet.userId) || get().tweets.map(t => t.userId).includes(tweet.userId) // Fallback to all tweets if no following specified
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
}));
