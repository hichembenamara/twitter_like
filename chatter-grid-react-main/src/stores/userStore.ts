import { create } from 'zustand';
import { User } from './authStore';

interface UserState {
  users: User[];
  followUser: (targetUserId: string, currentUserId: string) => void;
  unfollowUser: (targetUserId: string, currentUserId: string) => void;
  isFollowing: (targetUserId: string, currentUserId: string) => boolean;
  getUserById: (userId: string) => User | null;
  blockUser: (targetUserId: string, currentUserId: string) => void;
  reportTweet: (tweetId: string, userId: string) => void;
}

// Extended mock users data with more profiles for testing
const mockUsers: User[] = [
  {
    id: '1',
    username: 'john_doe',
    email: 'john@example.com',
    displayName: 'John Doe',
    bio: 'Software engineer passionate about React and TypeScript',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    banner: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=200&fit=crop',
    followers: ['2', '3'],
    following: ['2', '4'],
    createdAt: '2023-01-15T00:00:00Z',
    isVerified: true,
    isPrivate: false,
  },
  {
    id: '2',
    username: 'jane_smith',
    email: 'jane@example.com',
    displayName: 'Jane Smith',
    bio: 'Designer & UI/UX enthusiast. Love creating beautiful experiences ✨',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=400&h=400&fit=crop&crop=face',
    banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=200&fit=crop',
    followers: ['1', '4'],
    following: ['1', '3'],
    createdAt: '2023-02-10T00:00:00Z',
  },
  {
    id: '3',
    username: 'tech_guru',
    email: 'guru@example.com',
    displayName: 'Tech Guru',
    bio: 'Full-stack developer | Open source contributor | Coffee addict ☕',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    banner: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=200&fit=crop',
    followers: ['2'],
    following: ['1', '2', '4'],
    createdAt: '2023-03-05T00:00:00Z',
  },
  {
    id: '4',
    username: 'creative_mind',
    email: 'creative@example.com',
    displayName: 'Creative Mind',
    bio: 'Artist & Digital Creator | Making the world more beautiful one pixel at a time 🎨',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    banner: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=200&fit=crop',
    followers: ['1', '3'],
    following: ['2'],
    createdAt: '2023-04-12T00:00:00Z',
  },
];

export const useUserStore = create<UserState>((set, get) => ({
  users: mockUsers,

  getUserById: (userId: string) => {
    return get().users.find(user => user.id === userId) || null;
  },

  followUser: (targetUserId: string, currentUserId: string) => {
    set(state => ({
      users: state.users.map(user => {
        if (user.id === targetUserId) {
          // Add current user to target's followers
          return {
            ...user,
            followers: user.followers.includes(currentUserId) 
              ? user.followers 
              : [...user.followers, currentUserId]
          };
        }
        if (user.id === currentUserId) {
          // Add target to current user's following
          return {
            ...user,
            following: user.following.includes(targetUserId)
              ? user.following
              : [...user.following, targetUserId]
          };
        }
        return user;
      })
    }));
    
    console.log(`${currentUserId} followed ${targetUserId}`);
  },

  unfollowUser: (targetUserId: string, currentUserId: string) => {
    set(state => ({
      users: state.users.map(user => {
        if (user.id === targetUserId) {
          // Remove current user from target's followers
          return {
            ...user,
            followers: user.followers.filter(id => id !== currentUserId)
          };
        }
        if (user.id === currentUserId) {
          // Remove target from current user's following
          return {
            ...user,
            following: user.following.filter(id => id !== targetUserId)
          };
        }
        return user;
      })
    }));
    
    console.log(`${currentUserId} unfollowed ${targetUserId}`);
  },

  isFollowing: (targetUserId: string, currentUserId: string) => {
    const currentUser = get().users.find(user => user.id === currentUserId);
    return currentUser ? currentUser.following.includes(targetUserId) : false;
  },

  blockUser: (targetUserId: string, currentUserId: string) => {
    console.log(`${currentUserId} blocked ${targetUserId}`);
    // In a real app, this would update the user's blocked list
  },

  reportTweet: (tweetId: string, userId: string) => {
    console.log(`User ${userId} reported tweet ${tweetId}`);
    // In a real app, this would send a report to moderation
  },
}));
