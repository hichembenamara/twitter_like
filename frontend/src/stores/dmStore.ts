
import { create } from 'zustand';

export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  image?: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: DirectMessage;
  updatedAt: string;
}

interface DMState {
  conversations: Conversation[];
  messages: DirectMessage[];
  activeConversationId: string | null;
  sendMessage: (receiverId: string, content: string, image?: string) => void;
  getConversation: (userId1: string, userId2: string) => Conversation | null;
  getConversationMessages: (conversationId: string) => DirectMessage[];
  markMessagesAsRead: (conversationId: string, userId: string) => void;
  setActiveConversation: (conversationId: string | null) => void;
}

export const useDMStore = create<DMState>((set, get) => ({
  conversations: [],
  messages: [],
  activeConversationId: null,

  sendMessage: (receiverId: string, content: string, image?: string) => {
    const userStr = localStorage.getItem('twitter-user');
    if (!userStr) return;

    const user = JSON.parse(userStr);
    const senderId = user.id;
    
    // Find or create conversation
    let conversation = get().conversations.find(conv => 
      conv.participants.includes(senderId) && conv.participants.includes(receiverId)
    );

    if (!conversation) {
      conversation = {
        id: Date.now().toString(),
        participants: [senderId, receiverId],
        updatedAt: new Date().toISOString()
      };
      
      set(state => ({
        conversations: [conversation!, ...state.conversations]
      }));
    }

    const newMessage: DirectMessage = {
      id: Date.now().toString(),
      conversationId: conversation.id,
      senderId,
      receiverId,
      content,
      image,
      createdAt: new Date().toISOString(),
      read: false
    };

    set(state => ({
      messages: [...state.messages, newMessage],
      conversations: state.conversations.map(conv =>
        conv.id === conversation!.id
          ? { ...conv, lastMessage: newMessage, updatedAt: new Date().toISOString() }
          : conv
      )
    }));
  },

  getConversation: (userId1: string, userId2: string) => {
    return get().conversations.find(conv => 
      conv.participants.includes(userId1) && conv.participants.includes(userId2)
    ) || null;
  },

  getConversationMessages: (conversationId: string) => {
    return get().messages
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  markMessagesAsRead: (conversationId: string, userId: string) => {
    set(state => ({
      messages: state.messages.map(msg =>
        msg.conversationId === conversationId && msg.receiverId === userId
          ? { ...msg, read: true }
          : msg
      )
    }));
  },

  setActiveConversation: (conversationId: string | null) => {
    set({ activeConversationId: conversationId });
  }
}));
