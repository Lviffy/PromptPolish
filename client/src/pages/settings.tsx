import MainLayout from "@/layouts/MainLayout";
import { useAuth } from "@/lib/auth";
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

        {/* Account */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Manage your account settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={user?.username || ''} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email || ''} readOnly />
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button variant="destructive" onClick={logout}>Log out</Button>
          </CardFooter>
        </Card>

        {/* Password */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>Change your password.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add password change form here */}
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input id="current-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input id="confirm-password" type="password" />
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button>Change Password</Button>
          </CardFooter>
        </Card>

        {/* Notifications */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Configure notification settings.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <Switch id="email-notifications" defaultChecked />
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button>Save Preferences</Button>
          </CardFooter>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Advanced security settings.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="two-factor-auth">Two-Factor Authentication</Label>
              <Switch id="two-factor-auth" />
            </div>
          </CardContent>
           <CardFooter className="border-t px-6 py-4">
            <Button>Enable 2FA</Button>
          </CardFooter>
        </Card>

      </div>
    </MainLayout>
  );
}
