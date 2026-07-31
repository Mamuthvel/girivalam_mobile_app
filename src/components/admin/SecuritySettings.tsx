import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shield, Key, Eye, EyeOff, Save, Lock, CheckCircle2 } from 'lucide-react';
import { logger } from "@/lib/logger";

interface SecretConfig {
  key: string;
  label: string;
  description: string;
  isSet: boolean;
}

const SecuritySettings: React.FC = () => {
  const [secrets, setSecrets] = useState<SecretConfig[]>([
    { key: 'TWILIO_ACCOUNT_SID', label: 'Twilio Account SID', description: 'For SMS/WhatsApp notifications', isSet: false },
    { key: 'TWILIO_AUTH_TOKEN', label: 'Twilio Auth Token', description: 'Twilio authentication', isSet: false },
    { key: 'TWILIO_PHONE_NUMBER', label: 'Twilio Phone Number', description: 'Sender phone number', isSet: false },
    { key: 'ADMIN_EMAIL', label: 'Admin Email', description: 'Email for notifications', isSet: false },
    { key: 'SMTP_USER', label: 'SMTP Username', description: 'Email sending credentials', isSet: false },
    { key: 'SMTP_PASSWORD', label: 'SMTP Password', description: 'Email sending password', isSet: false },
  ]);
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    checkSecretStatus();
  }, []);

  const checkSecretStatus = async () => {
    try {
      // Check admin_settings for stored config indicators
      const { data } = await supabase
        .from('admin_settings')
        .select('setting_key')
        .like('setting_key', 'secret_configured_%');

      if (data) {
        const configuredKeys = data.map(d => d.setting_key.replace('secret_configured_', ''));
        setSecrets(prev => prev.map(s => ({
          ...s,
          isSet: configuredKeys.includes(s.key),
        })));
      }
    } catch (error) {
      logger.error('Error checking secrets:', error);
    }
  };

  const markSecretConfigured = async (key: string) => {
    try {
      await supabase.from('admin_settings').upsert({
        setting_key: `secret_configured_${key}`,
        setting_value: 'true',
        description: `Indicates ${key} has been configured in Supabase secrets`,
      }, { onConflict: 'setting_key' });

      setSecrets(prev => prev.map(s => s.key === key ? { ...s, isSet: true } : s));
      toast({
        title: 'Configuration Noted',
        description: `${key} marked as configured. Ensure it's set in Supabase Edge Function secrets.`,
      });
    } catch (error) {
      logger.error('Error updating config:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Security & Settings
        </h2>
        <p className="text-muted-foreground">
          Manage API keys and sensitive configurations securely
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Keys & Secrets
          </CardTitle>
          <CardDescription>
            Secrets are stored securely in Supabase Edge Function secrets. This panel tracks configuration status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {secrets.map((secret) => (
              <div
                key={secret.key}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-md ${secret.isSet ? 'bg-green-500/10' : 'bg-muted'}`}>
                    {secret.isSet ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{secret.label}</p>
                    <p className="text-sm text-muted-foreground">{secret.description}</p>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded mt-1 inline-block">
                      {secret.key}
                    </code>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={secret.isSet ? 'default' : 'secondary'}>
                    {secret.isSet ? 'Configured' : 'Not Set'}
                  </Badge>
                  {!secret.isSet && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markSecretConfigured(secret.key)}
                    >
                      Mark as Set
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4" />
              Security Best Practices
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Secrets are stored in Supabase Edge Function secrets, not in the database</li>
              <li>• Never expose API keys in client-side code or responses</li>
              <li>• Rotate credentials periodically and after any suspected breach</li>
              <li>• Use the Supabase Dashboard to manage actual secret values</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuration Links</CardTitle>
          <CardDescription>Quick access to external configuration panels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" asChild className="justify-start">
              <a
                href="https://supabase.com/dashboard/project/czcbusmgirrbezojrxss/settings/functions"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Key className="h-4 w-4 mr-2" />
                Supabase Edge Function Secrets
              </a>
            </Button>
            <Button variant="outline" asChild className="justify-start">
              <a
                href="https://supabase.com/dashboard/project/czcbusmgirrbezojrxss/auth/providers"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Shield className="h-4 w-4 mr-2" />
                Auth Providers
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettings;
