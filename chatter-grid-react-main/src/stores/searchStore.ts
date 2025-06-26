
import { create } from 'zustand';
import { Tweet } from './tweetStore';
import { User } from './authStore';

interface SearchState {
  searchQuery: string;
  searchResults: {
    tweets: Tweet[];
    users: User[];
  };
  isSearching: boolean;
  setSearchQuery: (query: string) => void;
  searchTweets: (query: string) => void;
  searchUsers: (query: string) => void;
  clearSearch: () => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  searchQuery: '',
  searchResults: {
    tweets: [],
    users: []
  },
  isSearching: false,

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  searchTweets: (query: string) => {
    set({ isSearching: true });
    // Import tweets from tweetStore
    const { useTweetStore } = require('./tweetStore');
    const allTweets = useTweetStore.getState().tweets;
    
    const filteredTweets = allTweets.filter(tweet => 
      tweet.content.toLowerCase().includes(query.toLowerCase()) ||
      tweet.username.toLowerCase().includes(query.toLowerCase()) ||
      tweet.displayName.toLowerCase().includes(query.toLowerCase())
    );

    set(state => ({
      searchResults: {
        ...state.searchResults,
        tweets: filteredTweets
      },
      isSearching: false
    }));
  },

  searchUsers: (query: string) => {
    set({ isSearching: true });
    // Import users from userStore
    const { useUserStore } = require('./userStore');
    const allUsers = useUserStore.getState().users;
    
    const filteredUsers = allUsers.filter(user => 
      user.username.toLowerCase().includes(query.toLowerCase()) ||
      user.displayName.toLowerCase().includes(query.toLowerCase())
    );

    set(state => ({
      searchResults: {
        ...state.searchResults,
        users: filteredUsers
      },
      isSearching: false
    }));
  },

  clearSearch: () => {
    set({
      searchQuery: '',
      searchResults: { tweets: [], users: [] },
      isSearching: false
    });
  }
}));
