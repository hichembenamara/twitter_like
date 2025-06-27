
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

    console.log('🐦 Posting tweet as user:', {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      content: content.trim()
    });

    setIsPosting(true);
    
    try {
      await addTweet(content.trim(), selectedImage || undefined);
      setContent('');
      setSelectedImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      toast({
        title: "Tweet publié !",
        description: "Votre tweet a été publié.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Échec de la publication du tweet. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsPosting(false);
    }
  };

  const remainingChars = 280 - content.length;

  if (!user) return null;

  return (
    <div className="p-6 border-b border-twitter-gray-200 bg-white/80 backdrop-blur-sm">
      <form onSubmit={handleSubmit}>
        <div className="flex space-x-4">
          <div className="relative flex-shrink-0">
            <img
              src={user.avatar}
              alt={user.displayName}
              className="w-14 h-14 rounded-full border-3 border-gradient-to-r from-twitter-teal to-twitter-accent object-cover shadow-lg"
            />
            {user.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-twitter-accent to-twitter-purple rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <Textarea
              placeholder="Que se passe-t-il ?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] text-xl border-2 border-twitter-gray-200 rounded-2xl resize-none focus:border-twitter-accent transition-colors p-4 placeholder:text-twitter-gray-400 text-twitter-gray-800 bg-gradient-to-r from-twitter-gray-50 to-white"
              maxLength={280}
            />
            
            {selectedImage && (
              <div className="relative mt-4">
                <img
                  src={selectedImage}
                  alt="Sélectionné"
                  className="max-w-full h-auto rounded-3xl max-h-96 object-cover shadow-xl border border-twitter-gray-200"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="absolute top-3 right-3 rounded-full p-2 h-10 w-10 bg-red-500 hover:bg-red-600 shadow-lg"
                  onClick={removeImage}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            )}
            
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center space-x-4">
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
                  className="text-twitter-accent hover:bg-twitter-accent/10 p-3 rounded-full transition-all duration-300 hover:scale-110"
                >
                  <Image className="h-6 w-6" />
                </Button>
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    remainingChars < 20 ? 'bg-red-100' : 'bg-twitter-gray-100'
                  }`}>
                    <span
                      className={`text-sm font-semibold ${
                        remainingChars < 20 ? 'text-red-600' : 'text-twitter-gray-600'
                      }`}
                    >
                      {remainingChars}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                type="submit"
                disabled={!content.trim() || remainingChars < 0 || isPosting}
                className="bg-gradient-to-r from-twitter-accent to-twitter-purple text-white hover:from-twitter-purple hover:to-twitter-accent disabled:opacity-50 disabled:bg-twitter-gray-400 font-bold px-8 py-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {isPosting ? 'Publication...' : 'Tweeter'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ComposeTweet;
