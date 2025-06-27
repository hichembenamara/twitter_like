
import { create } from 'zustand';

export interface Friend {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  isOnline: boolean;
  lastSeen: string;
  mutualFriends: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

interface BackendUser {
  id: number;
  username?: string;
  nom: string;
  imageName?: string;
  bio?: string;
  lastSeen?: string;
}

interface FriendState {
  friends: Friend[];
  chatMessages: ChatMessage[];
  friendRequests: string[];
  allUsers: Friend[];
  fetchAllUsers: () => Promise<void>;
  fetchFriends: () => Promise<void>;
  addFriend: (friendId: string, currentUserId?: string) => Promise<void>;
  removeFriend: (friendId: string, currentUserId?: string) => Promise<void>;
  isFriend: (friendId: string, currentUserId?: string) => boolean;
  sendMessage: (receiverId: string, content: string) => void;
  getMessagesWithFriend: (friendId: string, currentUserId: string) => ChatMessage[];
  getFriendById: (friendId: string) => Friend | null;
  markMessagesAsRead: (friendId: string, currentUserId: string) => void;
}

const mockFriends: Friend[] = [
  {
    id: 'f1',
    username: 'sarah_dev',
    displayName: 'Sarah Williams',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
    bio: 'Frontend developer & coffee enthusiast ☕',
    isOnline: true,
    lastSeen: new Date().toISOString(),
    mutualFriends: 5,
  },
  {
    id: 'f2',
    username: 'mike_designer',
    displayName: 'Mike Johnson',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
    bio: 'UI/UX Designer creating beautiful experiences',
    isOnline: false,
    lastSeen: '2024-06-24T18:30:00Z',
    mutualFriends: 3,
  },
  {
    id: 'f3',
    username: 'emma_writer',
    displayName: 'Emma Davis',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    bio: 'Content writer & storyteller 📝',
    isOnline: true,
    lastSeen: new Date().toISOString(),
    mutualFriends: 8,
  },
  {
    id: 'f4',
    username: 'alex_tech',
    displayName: 'Alex Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    bio: 'Full-stack engineer & open source contributor',
    isOnline: false,
    lastSeen: '2024-06-25T09:15:00Z',
    mutualFriends: 12,
  },
];

const mockChatMessages: ChatMessage[] = [
  {
    id: 'msg1',
    senderId: 'f1',
    receiverId: '1',
    content: 'Hey! How are you doing?',
    timestamp: '2024-06-25T10:30:00Z',
    isRead: true,
  },
  {
    id: 'msg2',
    senderId: '1',
    receiverId: 'f1',
    content: 'Hi Sarah! Doing great, just working on some new features. How about you?',
    timestamp: '2024-06-25T10:32:00Z',
    isRead: true,
  },
  {
    id: 'msg3',
    senderId: 'f1',
    receiverId: '1',
    content: 'Same here! Just finished a new design system. Would love to show it to you sometime!',
    timestamp: '2024-06-25T10:35:00Z',
    isRead: false,
  },
  {
    id: 'msg4',
    senderId: 'f2',
    receiverId: '1',
    content: 'Thanks for the feedback on my latest design! Really appreciate it 🙏',
    timestamp: '2024-06-24T16:20:00Z',
    isRead: true,
  },
];

export const useFriendStore = create<FriendState>((set, get) => ({
  friends: [],
  chatMessages: mockChatMessages,
  friendRequests: [],
  allUsers: [],

  fetchAllUsers: async () => {
    try {
      const response = await fetch('/api/users', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const users = await response.json();
      
      const formattedUsers: Friend[] = users.map((user: BackendUser) => ({
        id: user.id?.toString(),
        username: user.username || user.nom || 'Unknown',
        displayName: user.nom || 'Unknown',
        avatar: user.imageName ? `/images/user/${user.imageName}` : '/placeholder.svg',
        bio: user.bio || '',
        isOnline: false, // Backend doesn't track this yet
        lastSeen: user.lastSeen || new Date().toISOString(),
        mutualFriends: 0 // Backend doesn't track this yet
      }));
      
      set({ allUsers: formattedUsers });
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  },

  fetchFriends: async () => {
    try {
      const response = await fetch('/api/friends', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch friends');
      }
      const friends = await response.json();
      
      const formattedFriends: Friend[] = friends.map((friend: BackendUser) => ({
        id: friend.id?.toString(),
        username: friend.username || friend.nom || 'Unknown',
        displayName: friend.nom || 'Unknown',
        avatar: friend.imageName ? `/images/user/${friend.imageName}` : '/placeholder.svg',
        bio: friend.bio || '',
        isOnline: false,
        lastSeen: friend.lastSeen || new Date().toISOString(),
        mutualFriends: 0
      }));
      
      set({ friends: formattedFriends });
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  },

  getFriendById: (friendId: string) => {
    return get().friends.find(friend => friend.id === friendId) || null;
  },

  addFriend: async (friendId: string, currentUserId?: string) => {
    try {
      const response = await fetch(`/api/users/${friendId}/follow`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to follow user');
      }

      // Add friend to local state optimistically
      const user = get().allUsers.find(u => u.id === friendId);
      if (user) {
        set(state => ({
          friends: [...state.friends, user]
        }));
      }

      // Refresh friends list from backend
      get().fetchFriends();
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  },

  removeFriend: async (friendId: string, currentUserId?: string) => {
    try {
      const response = await fetch(`/api/users/${friendId}/unfollow`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to unfollow user');
      }

      // Remove friend from local state
      set(state => ({
        friends: state.friends.filter(friend => friend.id !== friendId)
      }));

      // Refresh friends list from backend
      get().fetchFriends();
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
  },

  isFriend: (friendId: string, currentUserId?: string) => {
    return get().friends.some(friend => friend.id === friendId);
  },

  sendMessage: (receiverId: string, content: string) => {
    const userStr = localStorage.getItem('twitter-user');
    if (!userStr) return;

    const user = JSON.parse(userStr);
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: user.id,
      receiverId,
      content,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    set(state => ({
      chatMessages: [...state.chatMessages, newMessage]
    }));
  },

  getMessagesWithFriend: (friendId: string, currentUserId: string) => {
    return get().chatMessages
      .filter(msg => 
        (msg.senderId === friendId && msg.receiverId === currentUserId) ||
        (msg.senderId === currentUserId && msg.receiverId === friendId)
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  },

  markMessagesAsRead: (friendId: string, currentUserId: string) => {
    set(state => ({
      chatMessages: state.chatMessages.map(msg =>
        msg.senderId === friendId && msg.receiverId === currentUserId
          ? { ...msg, isRead: true }
          : msg
      )
    }));
  },
}));
