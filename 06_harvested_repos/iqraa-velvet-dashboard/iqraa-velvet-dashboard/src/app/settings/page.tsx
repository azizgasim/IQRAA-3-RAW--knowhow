
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { Settings } from 'lucide-react';

export function UserSettingsView() {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-semibold text-foreground">User Settings</h2>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Appearance</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="theme-toggle">Theme</Label>
            <ModeToggle />
          </div>
          {/* Add other settings here */}
        </CardContent>
      </Card>
    </div>
  );
}
