
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Image, X } from 'lucide-react';
import { useTweetStore } from '@/stores/tweetStore';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

const ComposeTweet: React.FC = () => {
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addTweet = useTweetStore(state => state.addTweet);
  const user = useAuthStore(state => state.user);
  const { toast } = useToast();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    setIsPosting(true);
    
    try {
      addTweet(content.trim(), selectedImage || undefined);
      setContent('');
      setSelectedImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      toast({
        title: "Tweet posted!",
        description: "Your tweet has been published.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post tweet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPosting(false);
    }
  };

  const remainingChars = 280 - content.length;

  if (!user) return null;

  return (
    <Card className="p-4 mb-6">
      <form onSubmit={handleSubmit}>
        <div className="flex space-x-3">
          <div className="relative">
            <img
              src={user.avatar}
              alt={user.displayName}
              className="w-12 h-12 rounded-full"
            />
            {user.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <Textarea
              placeholder="What's happening?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] text-lg border-none resize-none focus:ring-0 p-0"
              maxLength={280}
            />
            
            {selectedImage && (
              <div className="relative mt-3">
                <img
                  src={selectedImage}
                  alt="Selected"
                  className="max-w-full h-auto rounded-2xl max-h-96 object-cover"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2 rounded-full p-1 h-8 w-8"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-500 hover:bg-blue-50"
                >
                  <Image className="h-5 w-5" />
                </Button>
                <span
                  className={`text-sm ${
                    remainingChars < 20 ? 'text-red-500' : 'text-gray-500'
                  }`}
                >
                  {remainingChars}
                </span>
              </div>
              <Button
                type="submit"
                disabled={!content.trim() || remainingChars < 0 || isPosting}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6"
              >
                {isPosting ? 'Posting...' : 'Tweet'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Card>
  );
};

export default ComposeTweet;
