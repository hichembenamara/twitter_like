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
  }) => Promise<void>;
  logout: () => Promise<void>;
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
      // Use relative URL to leverage Vite proxy
      const response = await fetch('/api/login_check', {
        method: 'POST',
        credentials: 'include', // Include cookies for session auth
        headers: {
          'Content-Type': 'application/json',
        },
        // Symfony's json_login expects 'username' and 'password' by default,
        // but our User entity uses 'email' as the identifier.
        // The 'property' for the user provider is 'email', so we should send 'email'.
        // Let's verify if json_login can use 'email' or if it defaults to 'username'.
        // Typically, for `json_login`, the keys in the JSON body should be `username` and `password`.
        // We might need to adjust this if Symfony's json_login strictly expects 'username'.
        // For now, let's try with what the frontend User interface implies (email).
        // If this fails, we may need to send { username: email, password: password }
        // or configure json_login to use a different property for the username path.
        // Symfony's default is indeed 'username'. Let's send 'username' as the key.
        body: JSON.stringify({ username: email, password: password }),
      });
      if (!response.ok) {
        // Optionally, capture error message from backend if available
        // const errorData = await response.json().catch(() => null);
        // console.error('Login failed:', response.status, errorData);
        return false;
      }
      // Assuming successful login, Symfony's json_login by default might not return the full user object.
      // It primarily sets the session cookie. The frontend might need to make a separate call
      // to fetch user details if not returned by /api/login_check.
      // For now, let's assume it might return some user data or just a success message.
      // If it returns the user, that's great. Otherwise, the frontend will need a /api/me endpoint.
      const responseData = await response.json(); // Try to parse JSON response

      // Symfony's json_login sets a session cookie but doesn't typically return user data.
      // We need to make a separate call to fetch user details.
      // The /api/login_check response might be empty or just a success message.
      // We can try to parse it, but the main goal is to confirm it's ok (2xx status).

      // We don't need to parse responseData from login_check for user details.
      // const responseData = await response.json(); // This might fail if response is empty

      // After successful login (cookie is set), fetch user data from /api/me
      const meResponse = await fetch('/api/me', {
        credentials: 'include' // Include cookies for session auth
      });
      if (!meResponse.ok) {
        // Handle error if /api/me fails (e.g., user somehow not authenticated)
        set({ isAuthenticated: false, user: null }); // Ensure clean state
        localStorage.removeItem('twitter-user');
        console.error('Failed to fetch user data after login:', meResponse.status);
        return false;
      }

      const userData = await meResponse.json();
      console.log('User data from /api/me:', userData);
      if (userData && userData.id) {
        // The backend User entity has 'nom' for display name and 'imageFile' for avatar path.
        // The frontend User interface has 'displayName' and 'avatar'.
        // We need to map these fields.
        const mappedUser: User = {
          id: userData.id,
          username: userData.username, // Backend now provides this
          email: userData.email,
          displayName: userData.nom, // Map nom to displayName
          bio: userData.bio || '',
          // Use imageName from backend (which should be just the filename) and construct path
          avatar: userData.imageName ? `/images/user/${userData.imageName}` : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
          banner: userData.banner || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=200&fit=crop', // Provide default
          followers: userData.followers || [], // Assuming these fields might not be in user:read yet
          following: userData.following || [],
          createdAt: userData.createdAt || new Date().toISOString(),
          isVerified: userData.isVerified || false,
          isPrivate: userData.isPrivate || false,
        };
        console.log('Mapped user for frontend:', mappedUser);
        set({ user: mappedUser, isAuthenticated: true });
        localStorage.setItem('twitter-user', JSON.stringify(mappedUser));
        return true;
      } else {
        // Failed to get user data from /api/me
        set({ isAuthenticated: false, user: null });
        localStorage.removeItem('twitter-user');
        console.error('User data from /api/me is invalid or missing id');
        return false;
      }
    } catch (error) {
      console.error('Login or /api/me call error:', error);
      return false;
    }
  },

  signup: async (userData: {
    email: string;
    username: string; // Currently not explicitly sent to backend, displayName is used for 'nom'
    password: string;
    displayName: string;
  }) => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        credentials: 'include', // Include cookies for session auth
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          username: userData.username, // Send username to backend
          password: userData.password,
          displayName: userData.displayName, // This maps to 'nom' in the backend
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Signup failed:', response.status, errorData);
        
        if (errorData?.message) {
          throw new Error(errorData.message);
        }
        throw new Error('Signup failed');
      }

      const newUserData = await response.json(); // Backend should return the created user object

      if (newUserData && newUserData.id) {
        // Map backend fields (nom, imageFile) to frontend User interface (displayName, avatar)
        // Also handles username which will be added in a later step.
        const mappedUser: User = {
          id: newUserData.id,
          username: newUserData.username, // Backend now provides this
          email: newUserData.email,
          displayName: newUserData.nom, // Map nom to displayName
          bio: newUserData.bio || '',
          // Use imageName from backend (which should be just the filename) and construct path
          avatar: newUserData.imageName ? `/images/user/${newUserData.imageName}` : '/placeholder.svg',
          banner: newUserData.banner || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=200&fit=crop', // Provide default
          followers: newUserData.followers || [],
          following: newUserData.following || [],
          createdAt: newUserData.createdAt || new Date().toISOString(),
          isVerified: newUserData.isVerified || false,
          isPrivate: newUserData.isPrivate || false,
        };
        set({ user: mappedUser, isAuthenticated: true });
        localStorage.setItem('twitter-user', JSON.stringify(mappedUser));
      } else {
        // Should not happen if backend returns user on 201 Created
        console.error('Signup successful but no or invalid user data returned from /api/register');
        throw new Error('Invalid user data returned');
      }
    } catch (error) {
      console.error('Signup API call error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      // Call backend logout endpoint
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      // Clear local state regardless of API call result
      set({ user: null, isAuthenticated: false });
      localStorage.removeItem('twitter-user');
    }
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
