import MainLayout from "@/layouts/MainLayout";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon, User, Key, Bell, Shield } from "lucide-react";

export default function Settings() {
  const { user, logout } = useAuth();

  return (
    <MainLayout>
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center">
            <SettingsIcon className="h-6 w-6 mr-2 text-gray-700" />
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          </div>
          <p className="text-gray-600 mt-2">Manage your account preferences</p>
        </div>

        <div className="space-y-6">
          {/* Account Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle>Account Information</CardTitle>
              </div>
              <CardDescription>
                Manage your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" value={user?.username} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={user?.email} disabled />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" disabled>Update Information</Button>
            </CardFooter>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle>Security</CardTitle>
              </div>
              <CardDescription>
                Manage your password and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" disabled placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" disabled placeholder="••••••••" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" disabled>Change Password</Button>
            </CardFooter>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle>Notifications</CardTitle>
              </div>
              <CardDescription>
                Configure your notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-gray-500">Receive email notifications about your prompts</p>
                </div>
                <Switch disabled checked={false} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New Features</p>
                  <p className="text-sm text-gray-500">Get notified about new features and updates</p>
                </div>
                <Switch disabled checked={true} />
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" disabled>Save Preferences</Button>
            </CardFooter>
          </Card>

          {/* Logout */}
          <div className="flex justify-center mt-8">
            <Button 
              variant="destructive" 
              onClick={logout} 
              className="px-8"
            >
              Log Out
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
