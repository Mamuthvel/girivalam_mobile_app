import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Phone, Send, History, Plus, Trash2 } from 'lucide-react';
import { logger } from "@/lib/logger";

interface NotificationTemplate {
  id: string;
  name: string;
  type: 'whatsapp' | 'sms';
  template: string;
  created_at: string;
}

interface NotificationLog {
  id: string;
  recipient_phone: string;
  channel: string;
  status: string;
  created_at: string;
  error_message?: string;
}

const NotificationManagement: React.FC = () => {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [newTemplate, setNewTemplate] = useState({ name: '', type: 'whatsapp' as 'whatsapp' | 'sms', template: '' });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load notification logs
      const { data: logData } = await supabase
        .from('booking_notification_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (logData) setLogs(logData);

      // Load templates from admin_settings
      const { data: templateData } = await supabase
        .from('admin_settings')
        .select('*')
        .like('setting_key', 'notification_template_%');

      if (templateData) {
        const parsed = templateData.map(t => ({
          id: t.id,
          name: t.setting_key.replace('notification_template_', ''),
          type: t.description?.includes('sms') ? 'sms' as const : 'whatsapp' as const,
          template: t.setting_value,
          created_at: t.created_at,
        }));
        setTemplates(parsed);
      }
    } catch (error) {
      logger.error('Error loading notification data:', error);
    }
  };

  const saveTemplate = async () => {
    if (!newTemplate.name.trim() || !newTemplate.template.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all fields.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await supabase.from('admin_settings').insert({
        setting_key: `notification_template_${newTemplate.name.toLowerCase().replace(/\s+/g, '_')}`,
        setting_value: newTemplate.template,
        description: `${newTemplate.type} notification template`,
      });

      toast({ title: 'Template Saved', description: 'Notification template created successfully.' });
      setNewTemplate({ name: '', type: 'whatsapp', template: '' });
      loadData();
    } catch (error) {
      logger.error('Error saving template:', error);
      toast({ title: 'Error', description: 'Failed to save template.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      await supabase.from('admin_settings').delete().eq('id', id);
      toast({ title: 'Deleted', description: 'Template removed successfully.' });
      loadData();
    } catch (error) {
      logger.error('Error deleting template:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="templates">
        <TabsList>
          <TabsTrigger value="templates">
            <MessageSquare className="h-4 w-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          {/* Create New Template */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create Notification Template
              </CardTitle>
              <CardDescription>
                Define reusable message templates for WhatsApp and SMS notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input
                    id="template-name"
                    placeholder="e.g., Booking Confirmation"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template-type">Channel</Label>
                  <select
                    id="template-type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={newTemplate.type}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, type: e.target.value as 'whatsapp' | 'sms' }))}
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="sms">SMS</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-content">Message Template</Label>
                <Textarea
                  id="template-content"
                  placeholder="Use {{name}}, {{booking_date}}, {{service}} as placeholders..."
                  rows={4}
                  value={newTemplate.template}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, template: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  Available placeholders: {'{{name}}'}, {'{{booking_date}}'}, {'{{service}}'}, {'{{phone}}'}
                </p>
              </div>
              <Button onClick={saveTemplate} disabled={loading}>
                <Send className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save Template'}
              </Button>
            </CardContent>
          </Card>

          {/* Existing Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Saved Templates</CardTitle>
            </CardHeader>
            <CardContent>
              {templates.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No templates created yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Channel</TableHead>
                      <TableHead>Template</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">{template.name}</TableCell>
                        <TableCell>
                          <Badge variant={template.type === 'whatsapp' ? 'default' : 'secondary'}>
                            {template.type === 'whatsapp' ? <MessageSquare className="h-3 w-3 mr-1" /> : <Phone className="h-3 w-3 mr-1" />}
                            {template.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{template.template}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => deleteTemplate(template.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Notification History
              </CardTitle>
              <CardDescription>Recent WhatsApp and SMS notifications sent</CardDescription>
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No notifications sent yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Channel</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent At</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{log.recipient_phone}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.channel}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={log.status === 'sent' ? 'default' : log.status === 'failed' ? 'destructive' : 'secondary'}>
                            {log.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                          {log.error_message || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationManagement;
