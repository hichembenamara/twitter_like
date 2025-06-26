
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

interface FriendState {
  friends: Friend[];
  chatMessages: ChatMessage[];
  friendRequests: string[];
  addFriend: (friendId: string, currentUserId: string) => void;
  removeFriend: (friendId: string, currentUserId: string) => void;
  isFriend: (friendId: string, currentUserId: string) => boolean;
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
  friends: mockFriends,
  chatMessages: mockChatMessages,
  friendRequests: [],

  getFriendById: (friendId: string) => {
    return get().friends.find(friend => friend.id === friendId) || null;
  },

  addFriend: (friendId: string, currentUserId: string) => {
    // In a real app, this would send a friend request and update when accepted
    console.log(`${currentUserId} added ${friendId} as friend`);
  },

  removeFriend: (friendId: string, currentUserId: string) => {
    // Remove friend relationship
    console.log(`${currentUserId} removed ${friendId} as friend`);
  },

  isFriend: (friendId: string, currentUserId: string) => {
    // For demo purposes, consider all mock friends as friends
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
