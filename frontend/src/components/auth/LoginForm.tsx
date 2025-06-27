
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/hooks/use-toast';

interface LoginFormProps {
  onToggleMode: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onToggleMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore(state => state.login);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        toast({
          title: "Bon retour !",
          description: "Vous vous êtes connecté avec succès.",
        });
      } else {
        toast({
          title: "Échec de la connexion",
          description: "Email ou mot de passe invalide. Essayez email: test@example.com, mot de passe: password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Quelque chose s'est mal passé. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-0 shadow-none bg-transparent">
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-2xl font-bold text-center text-gray-800">Bon retour</CardTitle>
        <CardDescription className="text-center text-gray-600">
          Connectez-vous à votre compte pour continuer
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="test@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl" 
            disabled={isLoading}
          >
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Vous n'avez pas de compte ?{' '}
          <button
            type="button"
            onClick={onToggleMode}
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            S'inscrire
          </button>
        </div>
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 text-sm">
          <div className="flex items-center mb-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            <strong className="text-blue-800">Demo credentials:</strong>
          </div>
          <div className="ml-4 text-gray-700 space-y-1">
            <div>📧 Email: <code className="bg-white px-2 py-1 rounded text-blue-600">test@example.com</code></div>
            <div>🔑 Password: <code className="bg-white px-2 py-1 rounded text-blue-600">password</code></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
