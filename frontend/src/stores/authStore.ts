import { create } from 'zustand';

export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  bio: string;
  avatar: string;
  banner: string;
  followers: string[];
  following: string[];
  createdAt: string;
  isVerified?: boolean;
  isPrivate?: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: {
    email: string;
    username: string;
    password: string;
    displayName: string;
  }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

// Mock users database
const mockUsers: User[] = [
  {
    id: '1',
    username: 'john_doe',
    email: 'john@example.com',
    displayName: 'John Doe',
    bio: 'Software engineer passionate about React and TypeScript',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    banner: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=200&fit=crop',
    followers: ['2'],
    following: ['2'],
    createdAt: '2023-01-15T00:00:00Z',
    isVerified: true,
    isPrivate: false,
  },
  {
    id: '2',
    username: 'jane_smith',
    email: 'jane@example.com',
    displayName: 'Jane Smith',
    bio: 'Designer & UI/UX enthusiast. Love creating beautiful experiences',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=400&h=400&fit=crop&crop=face',
    banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=200&fit=crop',
    followers: ['1'],
    following: ['1'],
    createdAt: '2023-02-10T00:00:00Z',
    isVerified: false,
    isPrivate: false,
  },
];

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        return false;
      }
      const user = await response.json();
      set({ user, isAuthenticated: true });
      localStorage.setItem('twitter-user', JSON.stringify(user));
      return true;
    } catch (error) {
      return false;
    }
  },

  signup: async (userData) => {
    // Mock signup
    const newUser: User = {
      id: Date.now().toString(),
      username: userData.username,
      email: userData.email,
      displayName: userData.displayName,
      bio: '',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      banner: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=200&fit=crop',
      followers: [],
      following: [],
      createdAt: new Date().toISOString(),
      isVerified: false,
      isPrivate: false,
    };

    mockUsers.push(newUser);
    set({ user: newUser, isAuthenticated: true });
    localStorage.setItem('twitter-user', JSON.stringify(newUser));
    return true;
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
    localStorage.removeItem('twitter-user');
  },

  updateProfile: (updates) => {
    const { user } = get();
    if (user) {
      const updatedUser = { ...user, ...updates };
      set({ user: updatedUser });
      localStorage.setItem('twitter-user', JSON.stringify(updatedUser));
    }
  },
}));
