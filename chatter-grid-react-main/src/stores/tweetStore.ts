
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
  likes: string[];
  retweets: string[];
  replies: Reply[];
  bookmarks: string[];
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

// Extended mock tweets data for testing
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
  {
    id: '2',
    userId: '2',
    username: 'jane_smith',
    displayName: 'Jane Smith',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=400&h=400&fit=crop&crop=face',
    content: 'Working on some exciting UI designs today. The power of good typography cannot be overstated! ✨ #Design #Typography #UX',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop',
    likes: ['1', '3', '4'],
    retweets: ['1'],
    replies: [
      {
        id: 'r1',
        userId: '1',
        username: 'john_doe',
        displayName: 'John Doe',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
        content: 'Totally agree! Typography is the foundation of great design.',
        createdAt: '2024-06-25T11:15:00Z',
      },
    ],
    bookmarks: ['1', '3'],
    hashtags: ['Design', 'Typography', 'UX'],
    createdAt: '2024-06-25T09:15:00Z',
  },
  {
    id: '3',
    userId: '3',
    username: 'tech_guru',
    displayName: 'Tech Guru',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    content: 'Just released my latest open-source project on GitHub! 🎉 It\'s a TypeScript library for state management. Check it out! #OpenSource #TypeScript #JavaScript',
    likes: ['1', '2', '4'],
    retweets: ['2'],
    replies: [],
    bookmarks: ['1'],
    hashtags: ['OpenSource', 'TypeScript', 'JavaScript'],
    createdAt: '2024-06-25T08:45:00Z',
  },
  {
    id: '4',
    userId: '4',
    username: 'creative_mind',
    displayName: 'Creative Mind',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    content: 'Creating digital art is like meditation for me 🧘‍♀️ Today\'s piece is inspired by the beauty of nature 🌿 #DigitalArt #Nature #Creativity',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
    likes: ['1', '2'],
    retweets: [],
    replies: [],
    bookmarks: ['2', '3'],
    hashtags: ['DigitalArt', 'Nature', 'Creativity'],
    createdAt: '2024-06-25T07:20:00Z',
  },
  {
    id: '5',
    userId: '1',
    username: 'john_doe',
    displayName: 'John Doe',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    content: 'Hot take: Vanilla JavaScript is making a comeback! Sometimes we don\'t need heavy frameworks for simple tasks 🤔 #JavaScript #WebDev #VanillaJS',
    likes: ['3'],
    retweets: [],
    replies: [],
    bookmarks: [],
    hashtags: ['JavaScript', 'WebDev', 'VanillaJS'],
    createdAt: '2024-06-24T16:30:00Z',
  },
  {
    id: '6',
    userId: '2',
    username: 'jane_smith',
    displayName: 'Jane Smith',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=400&h=400&fit=crop&crop=face',
    content: 'CSS Grid and Flexbox together are unstoppable! 💪 Just built the most responsive layout ever #CSS #WebDesign #Frontend',
    likes: ['1', '4'],
    retweets: ['3'],
    replies: [],
    bookmarks: ['1'],
    hashtags: ['CSS', 'WebDesign', 'Frontend'],
    createdAt: '2024-06-24T14:10:00Z',
  },
];

export const useTweetStore = create<TweetState>((set, get) => ({
  tweets: mockTweets,

  extractHashtags: (content: string) => {
    const hashtags = content.match(/#[a-zA-Z0-9_]+/g) || [];
    return hashtags.map(tag => tag.slice(1)); // Remove # symbol
  },

  addTweet: (content: string, image?: string) => {
    const userStr = localStorage.getItem('twitter-user');
    if (!userStr) return;

    const user = JSON.parse(userStr);
    const hashtags = get().extractHashtags(content);
    
    const newTweet: Tweet = {
      id: Date.now().toString(),
      userId: user.id,
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar,
      content,
      image,
      likes: [],
      retweets: [],
      replies: [],
      bookmarks: [],
      hashtags,
      createdAt: new Date().toISOString(),
    };

    set(state => ({
      tweets: [newTweet, ...state.tweets]
    }));
  },

  likeTweet: (tweetId: string, userId: string) => {
    const tweet = get().tweets.find(t => t.id === tweetId);
    const wasLiked = tweet?.likes.includes(userId);
    
    set(state => ({
      tweets: state.tweets.map(tweet => {
        if (tweet.id === tweetId) {
          const likes = tweet.likes.includes(userId)
            ? tweet.likes.filter(id => id !== userId)
            : [...tweet.likes, userId];
          
          // Add notification if tweet is being liked by someone else
          if (!wasLiked && tweet.userId !== userId) {
            const currentUser = JSON.parse(localStorage.getItem('twitter-user') || '{}');
            useNotificationStore.getState().addNotification({
              type: 'like',
              fromUserId: userId,
              fromUsername: currentUser.username,
              fromDisplayName: currentUser.displayName,
              fromAvatar: currentUser.avatar,
              tweetId: tweet.id,
              tweetContent: tweet.content
            });
          }
          
          return { ...tweet, likes };
        }
        return tweet;
      })
    }));
  },

  retweetTweet: (tweetId: string, userId: string) => {
    const tweet = get().tweets.find(t => t.id === tweetId);
    const wasRetweeted = tweet?.retweets.includes(userId);
    
    set(state => ({
      tweets: state.tweets.map(tweet => {
        if (tweet.id === tweetId) {
          const retweets = tweet.retweets.includes(userId)
            ? tweet.retweets.filter(id => id !== userId)
            : [...tweet.retweets, userId];
          
          // Add notification if tweet is being retweeted by someone else
          if (!wasRetweeted && tweet.userId !== userId) {
            const currentUser = JSON.parse(localStorage.getItem('twitter-user') || '{}');
            useNotificationStore.getState().addNotification({
              type: 'retweet',
              fromUserId: userId,
              fromUsername: currentUser.username,
              fromDisplayName: currentUser.displayName,
              fromAvatar: currentUser.avatar,
              tweetId: tweet.id,
              tweetContent: tweet.content
            });
          }
          
          return { ...tweet, retweets };
        }
        return tweet;
      })
    }));
  },

  replyToTweet: (tweetId: string, content: string) => {
    const userStr = localStorage.getItem('twitter-user');
    if (!userStr) return;

    const user = JSON.parse(userStr);
    const tweet = get().tweets.find(t => t.id === tweetId);
    
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
          // Add notification if replying to someone else's tweet
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
  },

  bookmarkTweet: (tweetId: string, userId: string) => {
    set(state => ({
      tweets: state.tweets.map(tweet => {
        if (tweet.id === tweetId) {
          const bookmarks = tweet.bookmarks.includes(userId)
            ? tweet.bookmarks.filter(id => id !== userId)
            : [...tweet.bookmarks, userId];
          return { ...tweet, bookmarks };
        }
        return tweet;
      })
    }));
  },

  getUserBookmarks: (userId: string) => {
    return get().tweets.filter(tweet => tweet.bookmarks.includes(userId));
  },

  getUserTweets: (userId: string) => {
    return get().tweets.filter(tweet => tweet.userId === userId);
  },

  getTimelineTweets: (followingIds: string[]) => {
    return get().tweets.filter(tweet => 
      followingIds.includes(tweet.userId)
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
}));
