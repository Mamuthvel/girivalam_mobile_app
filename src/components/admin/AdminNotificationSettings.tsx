import React from 'react';
import { Bell, Mail, AlertTriangle, Calendar, MessageSquare, Wrench, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';

const AdminNotificationSettings: React.FC = () => {
  const { settings, updateSettings, loading } = useAdminNotifications();
  const { toast } = useToast();
  const [saving, setSaving] = React.useState<string | null>(null);

  const handleToggle = async (key: keyof typeof settings) => {
    setSaving(key);
    const success = await updateSettings({ [key]: !settings[key] });
    setSaving(null);
    
    if (success) {
      toast({
        title: 'Settings updated',
        description: `${key.replace(/_/g, ' ')} has been ${!settings[key] ? 'enabled' : 'disabled'}.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update settings. Please try again.',
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const settingsConfig = [
    {
      key: 'email_alerts_enabled' as const,
      icon: Mail,
      title: 'Email Alerts',
      description: 'Receive email notifications for important events',
      color: 'text-blue-600',
    },
    {
      key: 'in_app_notifications_enabled' as const,
      icon: Bell,
      title: 'In-App Notifications',
      description: 'Show notifications in the admin dashboard',
      color: 'text-green-600',
    },
    {
      key: 'emergency_alerts_enabled' as const,
      icon: AlertTriangle,
      title: 'Emergency Alerts',
      description: 'High-priority emergency notifications',
      color: 'text-red-600',
    },
    {
      key: 'booking_alerts_enabled' as const,
      icon: Calendar,
      title: 'Booking Alerts',
      description: 'Notifications for new bookings',
      color: 'text-purple-600',
    },
    {
      key: 'message_alerts_enabled' as const,
      icon: MessageSquare,
      title: 'Message Alerts',
      description: 'Notifications for new user messages',
      color: 'text-teal-600',
    },
    {
      key: 'service_alerts_enabled' as const,
      icon: Wrench,
      title: 'Service Alerts',
      description: 'Notifications for service requests',
      color: 'text-orange-600',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Control how you receive admin notifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {settingsConfig.map(({ key, icon: Icon, title, description, color }) => (
            <div 
              key={key}
              className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full bg-muted ${color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <Label htmlFor={key} className="font-medium cursor-pointer">
                    {title}
                  </Label>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {saving === key && <Loader2 className="h-4 w-4 animate-spin" />}
                <Switch
                  id={key}
                  checked={settings[key]}
                  onCheckedChange={() => handleToggle(key)}
                  disabled={saving !== null}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminNotificationSettings;
