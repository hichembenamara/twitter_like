
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { X, Send } from 'lucide-react';
import { useFriendStore } from '@/stores/friendStore';
import { useAuthStore } from '@/stores/authStore';
import { formatDistanceToNow } from 'date-fns';

interface ChatModalProps {
  friendId: string;
  onClose: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ friendId, onClose }) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { getFriendById, getMessagesWithFriend, sendMessage, markMessagesAsRead } = useFriendStore();
  const user = useAuthStore(state => state.user);
  
  const friend = getFriendById(friendId);
  const messages = user ? getMessagesWithFriend(friendId, user.id) : [];

  useEffect(() => {
    if (user) {
      markMessagesAsRead(friendId, user.id);
    }
  }, [friendId, user, markMessagesAsRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim() && user) {
      sendMessage(friendId, message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!friend || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md h-96 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={friend.avatar}
                alt={friend.displayName}
                className="w-10 h-10 rounded-full"
              />
              {friend.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>
            <div>
              <h3 className="font-semibold">{friend.displayName}</h3>
              <p className="text-sm text-gray-500">
                {friend.isOnline ? 'Online' : `Last seen ${formatDistanceToNow(new Date(friend.lastSeen), { addSuffix: true })}`}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-3 py-2 rounded-lg ${
                  msg.senderId === user.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p className={`text-xs mt-1 ${
                  msg.senderId === user.id ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!message.trim()}
              size="sm"
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChatModal;
