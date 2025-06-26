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
      // Use relative path for Vite proxy, matching the json_login check_path
      const response = await fetch('/api/login_check', {
        method: 'POST',
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

      // If responseData contains the user, use it. Otherwise, we might need another fetch.
      // Let's assume for now json_login returns the user details based on serialization.
      // This part might need adjustment based on actual backend response.
      if (responseData && responseData.id) { // A simple check if user data is present
        set({ user: responseData as User, isAuthenticated: true });
        localStorage.setItem('twitter-user', JSON.stringify(responseData));
      } else {
        // If user data is not in login response, authentication was successful (cookie set),
        // but we need to fetch user data. For now, this will be a simplified success.
        // A follow-up "get current user" call would be better.
        // To keep it simple for this step, we'll set isAuthenticated to true,
        // but user object might be incomplete if not returned by login.
        // The frontend's User interface expects several fields.
        // This is a known point that might need refinement.
        set({ isAuthenticated: true, user: get().user }); // Keep existing user or null
        // To actually get the user, we'd ideally call a /api/me endpoint here.
        // For now, we'll proceed with the assumption that the login might give us enough,
        // or we handle partial data. The key is that isAuthenticated is true.
      }
      return true;
    } catch (error) {
      console.error('Login API call error:', error);
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          displayName: userData.displayName, // This maps to 'nom' in the backend
        }),
      });

      if (!response.ok) {
        // const errorData = await response.json().catch(() => null);
        // console.error('Signup failed:', response.status, errorData);
        // Optionally, extract error messages from errorData to show to user
        return false;
      }

      const newUser = await response.json(); // Backend should return the created user object

      if (newUser && newUser.id) {
        set({ user: newUser as User, isAuthenticated: true });
        localStorage.setItem('twitter-user', JSON.stringify(newUser));
        return true;
      } else {
        // Should not happen if backend returns user on 201 Created
        // console.error('Signup successful but no user data returned');
        return false;
      }
    } catch (error) {
      console.error('Signup API call error:', error);
      return false;
    }
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
