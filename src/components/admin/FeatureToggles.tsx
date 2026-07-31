import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Settings, Map, Users, Navigation, Filter, Eye, Save } from 'lucide-react';
import { logger } from "@/lib/logger";

interface FeatureToggle {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
}

const defaultToggles: FeatureToggle[] = [
  {
    key: 'solo_journey',
    label: 'Solo Journey Mode',
    description: 'Allow users to start solo girivalam journeys',
    icon: <Navigation className="h-4 w-4" />,
    enabled: true,
  },
  {
    key: 'group_journey',
    label: 'Group Journey Mode',
    description: 'Allow users to create and join group journeys',
    icon: <Users className="h-4 w-4" />,
    enabled: true,
  },
  {
    key: 'live_gps_tracking',
    label: 'Live GPS Tracking',
    description: 'Enable real-time location tracking during journeys',
    icon: <Map className="h-4 w-4" />,
    enabled: true,
  },
  {
    key: 'map_filters',
    label: 'Map Filters',
    description: 'Show filter options for landmarks on the map',
    icon: <Filter className="h-4 w-4" />,
    enabled: true,
  },
  {
    key: 'journey_preview',
    label: 'Journey Preview',
    description: 'Allow users to preview journey route without starting',
    icon: <Eye className="h-4 w-4" />,
    enabled: true,
  },
];

const FeatureToggles: React.FC = () => {
  const [toggles, setToggles] = useState<FeatureToggle[]>(defaultToggles);
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadToggles();
  }, []);

  const loadToggles = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('setting_key, setting_value')
        .like('setting_key', 'feature_%');

      if (error) throw error;

      if (data && data.length > 0) {
        setToggles(prev => prev.map(toggle => {
          const setting = data.find(d => d.setting_key === `feature_${toggle.key}`);
          return setting ? { ...toggle, enabled: setting.setting_value === 'true' } : toggle;
        }));
      }
    } catch (error) {
      logger.error('Error loading feature toggles:', error);
    }
  };

  const handleToggle = (key: string, enabled: boolean) => {
    setToggles(prev => prev.map(t => t.key === key ? { ...t, enabled } : t));
    setHasChanges(true);
  };

  const saveToggles = async () => {
    setLoading(true);
    try {
      for (const toggle of toggles) {
        await supabase
          .from('admin_settings')
          .upsert({
            setting_key: `feature_${toggle.key}`,
            setting_value: toggle.enabled.toString(),
            description: toggle.description,
          }, { onConflict: 'setting_key' });
      }

      toast({
        title: 'Settings Saved',
        description: 'Feature toggles have been updated successfully.',
      });
      setHasChanges(false);
    } catch (error) {
      logger.error('Error saving toggles:', error);
      toast({
        title: 'Error',
        description: 'Failed to save feature toggles.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Feature Toggles
            </CardTitle>
            <CardDescription>
              Enable or disable app features for users
            </CardDescription>
          </div>
          {hasChanges && (
            <Button onClick={saveToggles} disabled={loading} size="sm">
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {toggles.map((toggle) => (
            <div
              key={toggle.key}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-muted rounded-md">
                  {toggle.icon}
                </div>
                <div>
                  <Label htmlFor={toggle.key} className="font-medium">
                    {toggle.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {toggle.description}
                  </p>
                </div>
              </div>
              <Switch
                id={toggle.key}
                checked={toggle.enabled}
                onCheckedChange={(checked) => handleToggle(toggle.key, checked)}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FeatureToggles;
