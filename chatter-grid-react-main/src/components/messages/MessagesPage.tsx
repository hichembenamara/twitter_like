
import React, { useState } from 'react';
import { Send, Image, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useDMStore, Conversation } from '@/stores/dmStore';
import { useUserStore } from '@/stores/userStore';
import { useAuthStore } from '@/stores/authStore';
import { formatDistanceToNow } from 'date-fns';

const MessagesPage: React.FC = () => {
  const [newMessage, setNewMessage] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  
  const { 
    conversations, 
    sendMessage, 
    getConversationMessages, 
    markMessagesAsRead 
  } = useDMStore();
  const { getUserById } = useUserStore();
  const { user } = useAuthStore();

  const handleSendMessage = () => {
    if (!selectedConversation || !newMessage.trim() || !user) return;

    const otherParticipant = selectedConversation.participants.find(id => id !== user.id);
    if (otherParticipant) {
      sendMessage(otherParticipant, newMessage.trim());
      setNewMessage('');
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    if (user) {
      markMessagesAsRead(conversation.id, user.id);
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    if (!user) return null;
    const otherParticipantId = conversation.participants.find(id => id !== user.id);
    return otherParticipantId ? getUserById(otherParticipantId) : null;
  };

  if (selectedConversation) {
    const messages = getConversationMessages(selectedConversation.id);
    const otherParticipant = getOtherParticipant(selectedConversation);

    return (
      <div className="flex-1 max-w-2xl mx-auto flex flex-col h-screen">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedConversation(null)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            {otherParticipant && (
              <>
                <img
                  src={otherParticipant.avatar}
                  alt={otherParticipant.displayName}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h2 className="font-semibold">{otherParticipant.displayName}</h2>
                  <p className="text-sm text-gray-500">@{otherParticipant.username}</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    message.senderId === user?.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Message attachment"
                      className="mt-2 rounded-lg max-w-full"
                    />
                  )}
                  <p className={`text-xs mt-1 ${
                    message.senderId === user?.id ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Start a new message"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button size="sm" variant="ghost">
              <Image className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-2xl mx-auto">
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 p-4 z-10">
        <h1 className="text-xl font-bold">Messages</h1>
      </div>

      <div className="p-4">
        {conversations.length > 0 ? (
          <div className="space-y-0">
            {conversations
              .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
              .map((conversation) => {
                const otherParticipant = getOtherParticipant(conversation);
                if (!otherParticipant) return null;

                return (
                  <Card
                    key={conversation.id}
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleSelectConversation(conversation)}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={otherParticipant.avatar}
                        alt={otherParticipant.displayName}
                        className="w-12 h-12 rounded-full"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold truncate">{otherParticipant.displayName}</h3>
                          {conversation.lastMessage && (
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { addSuffix: true })}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">@{otherParticipant.username}</p>
                        {conversation.lastMessage && (
                          <p className="text-sm text-gray-700 truncate mt-1">
                            {conversation.lastMessage.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to your inbox!</h3>
            <p className="text-gray-500">Drop a line, share tweets and more with private conversations between you and others on Twitter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
