
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/stores/authStore';

const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { user, updateProfile } = useAuthStore();

  const handlePrivacyToggle = (isPrivate: boolean) => {
    if (user) {
      updateProfile({ isPrivate });
    }
  };

  const handleVerificationToggle = (isVerified: boolean) => {
    if (user) {
      updateProfile({ isVerified });
    }
  };

  return (
    <div className="flex-1 max-w-2xl mx-auto">
      <div className="sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 p-4 z-10">
        <h1 className="text-xl font-bold dark:text-white">Settings</h1>
      </div>
      
      <div className="p-4 space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">Appearance</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode" className="dark:text-white">Dark Mode</Label>
              <Switch
                id="dark-mode"
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">Privacy & Safety</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="private-account" className="dark:text-white">Private Account</Label>
                <p className="text-sm text-gray-500 mt-1">
                  Only approved followers can see your tweets
                </p>
              </div>
              <Switch
                id="private-account"
                checked={user?.isPrivate || false}
                onCheckedChange={handlePrivacyToggle}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">Account Verification</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="verified-badge" className="dark:text-white">Verification Badge</Label>
                <p className="text-sm text-gray-500 mt-1">
                  Show blue checkmark on your profile (Demo feature)
                </p>
              </div>
              <Switch
                id="verified-badge"
                checked={user?.isVerified || false}
                onCheckedChange={handleVerificationToggle}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 dark:text-white">Account Management</h2>
          <div className="space-y-4">
            <Button variant="outline" className="w-full">
              Download your data
            </Button>
            <Button variant="outline" className="w-full">
              Deactivate account
            </Button>
            <Button variant="destructive" className="w-full">
              Delete account
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
