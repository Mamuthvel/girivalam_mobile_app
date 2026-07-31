import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit2, Trash2, Clock, Bell, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { formatTime } from '@/hooks/useTempleStatus';
import { logger } from "@/lib/logger";

interface TempleStatus {
  id: string;
  temple_name: string;
  status: string;
  opening_time: string;
  closing_time: string;
  darshan_available: boolean;
  special_notes: string | null;
  source: string;
  valid_date: string;
}

interface PoojaTimings {
  id: string;
  pooja_name: string;
  start_time: string;
  end_time: string | null;
  description: string | null;
  is_daily: boolean;
  specific_date: string | null;
  source: string;
  is_active: boolean;
}

interface Announcement {
  id: string;
  title: string;
  message: string;
  announcement_type: string;
  priority: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
}

export default function TempleManagement() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [statuses, setStatuses] = useState<TempleStatus[]>([]);
  const [poojaTimings, setPoojaTimings] = useState<PoojaTimings[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  
  // Form states
  const [statusForm, setStatusForm] = useState({
    status: 'open',
    opening_time: '05:00',
    closing_time: '21:00',
    darshan_available: true,
    special_notes: '',
    valid_date: new Date().toISOString().split('T')[0],
  });

  const [poojaForm, setPoojaForm] = useState({
    pooja_name: '',
    start_time: '',
    end_time: '',
    description: '',
    is_daily: true,
    specific_date: '',
  });

  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    message: '',
    announcement_type: 'info',
    priority: 0,
    valid_until: '',
  });

  const [editingPooja, setEditingPooja] = useState<PoojaTimings | null>(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [poojaDialogOpen, setPoojaDialogOpen] = useState(false);
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [statusRes, poojaRes, announcementRes] = await Promise.all([
        supabase.from('temple_status').select('*').order('valid_date', { ascending: false }).limit(10),
        supabase.from('temple_pooja_timings').select('*').order('start_time', { ascending: true }),
        supabase.from('temple_announcements').select('*').order('priority', { ascending: false }),
      ]);

      if (statusRes.data) setStatuses(statusRes.data as TempleStatus[]);
      if (poojaRes.data) setPoojaTimings(poojaRes.data as PoojaTimings[]);
      if (announcementRes.data) setAnnouncements(announcementRes.data as Announcement[]);
    } catch (error) {
      logger.error('Error fetching temple data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const saveTempleStatus = async () => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { error } = await supabase.from('temple_status').upsert({
        temple_name: 'Arunachaleswarar Temple',
        status: statusForm.status,
        opening_time: statusForm.opening_time,
        closing_time: statusForm.closing_time,
        darshan_available: statusForm.darshan_available,
        special_notes: statusForm.special_notes || null,
        source: 'admin',
        valid_date: statusForm.valid_date,
        created_by: userData.user?.id,
      }, {
        onConflict: 'valid_date',
        ignoreDuplicates: false,
      });

      if (error) throw error;

      toast({ title: 'Success', description: 'Temple status updated successfully' });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const savePooja = async () => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const poojaData = {
        pooja_name: poojaForm.pooja_name,
        start_time: poojaForm.start_time,
        end_time: poojaForm.end_time || null,
        description: poojaForm.description || null,
        is_daily: poojaForm.is_daily,
        specific_date: poojaForm.is_daily ? null : poojaForm.specific_date || null,
        source: 'admin' as const,
        is_active: true,
        created_by: userData.user?.id,
      };

      if (editingPooja) {
        const { error } = await supabase
          .from('temple_pooja_timings')
          .update(poojaData)
          .eq('id', editingPooja.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('temple_pooja_timings').insert(poojaData);
        if (error) throw error;
      }

      toast({ title: 'Success', description: `Pooja ${editingPooja ? 'updated' : 'added'} successfully` });
      setPoojaDialogOpen(false);
      setEditingPooja(null);
      setPoojaForm({ pooja_name: '', start_time: '', end_time: '', description: '', is_daily: true, specific_date: '' });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const deletePooja = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pooja timing?')) return;
    try {
      const { error } = await supabase.from('temple_pooja_timings').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Deleted', description: 'Pooja timing removed' });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const saveAnnouncement = async () => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const announcementData = {
        title: announcementForm.title,
        message: announcementForm.message,
        announcement_type: announcementForm.announcement_type,
        priority: announcementForm.priority,
        valid_from: new Date().toISOString(),
        valid_until: announcementForm.valid_until || null,
        is_active: true,
        created_by: userData.user?.id,
      };

      if (editingAnnouncement) {
        const { error } = await supabase
          .from('temple_announcements')
          .update(announcementData)
          .eq('id', editingAnnouncement.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('temple_announcements').insert(announcementData);
        if (error) throw error;
      }

      toast({ title: 'Success', description: `Announcement ${editingAnnouncement ? 'updated' : 'created'} successfully` });
      setAnnouncementDialogOpen(false);
      setEditingAnnouncement(null);
      setAnnouncementForm({ title: '', message: '', announcement_type: 'info', priority: 0, valid_until: '' });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const toggleAnnouncement = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('temple_announcements')
        .update({ is_active: !isActive })
        .eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const deleteAnnouncement = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
      const { error } = await supabase.from('temple_announcements').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Deleted', description: 'Announcement removed' });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="status">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="status">Temple Status</TabsTrigger>
          <TabsTrigger value="pooja">Pooja Timings</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
        </TabsList>

        {/* Temple Status Tab */}
        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Update Temple Status
              </CardTitle>
              <CardDescription>
                Admin updates will override estimated data and be marked as "Verified"
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={statusForm.valid_date}
                    onChange={(e) => setStatusForm({ ...statusForm, valid_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={statusForm.status}
                    onValueChange={(v) => setStatusForm({ ...statusForm, status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="limited_darshan">Limited Darshan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Opening Time</Label>
                  <Input
                    type="time"
                    value={statusForm.opening_time}
                    onChange={(e) => setStatusForm({ ...statusForm, opening_time: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Closing Time</Label>
                  <Input
                    type="time"
                    value={statusForm.closing_time}
                    onChange={(e) => setStatusForm({ ...statusForm, closing_time: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={statusForm.darshan_available}
                  onCheckedChange={(c) => setStatusForm({ ...statusForm, darshan_available: c })}
                />
                <Label>Darshan Available</Label>
              </div>
              <div className="space-y-2">
                <Label>Special Notes (optional)</Label>
                <Textarea
                  placeholder="Festival, maintenance, or crowd information..."
                  value={statusForm.special_notes}
                  onChange={(e) => setStatusForm({ ...statusForm, special_notes: e.target.value })}
                />
              </div>
              <Button onClick={saveTempleStatus} disabled={loading} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Temple Status
              </Button>

              {/* Recent Status History */}
              {statuses.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Recent Status Updates</h4>
                  <div className="space-y-2">
                    {statuses.slice(0, 5).map((s) => (
                      <div key={s.id} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex items-center gap-2">
                          <Badge variant={s.source === 'admin' ? 'default' : 'secondary'}>
                            {s.source}
                          </Badge>
                          <span>{s.valid_date}</span>
                        </div>
                        <Badge variant={s.status === 'open' ? 'default' : 'destructive'}>
                          {s.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pooja Timings Tab */}
        <TabsContent value="pooja">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Pooja Timings
                </CardTitle>
                <CardDescription>Manage daily and special pooja schedules</CardDescription>
              </div>
              <Dialog open={poojaDialogOpen} onOpenChange={setPoojaDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setEditingPooja(null);
                    setPoojaForm({ pooja_name: '', start_time: '', end_time: '', description: '', is_daily: true, specific_date: '' });
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Pooja
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingPooja ? 'Edit Pooja' : 'Add New Pooja'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Pooja Name</Label>
                      <Input
                        value={poojaForm.pooja_name}
                        onChange={(e) => setPoojaForm({ ...poojaForm, pooja_name: e.target.value })}
                        placeholder="e.g., Abhishekam"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Time</Label>
                        <Input
                          type="time"
                          value={poojaForm.start_time}
                          onChange={(e) => setPoojaForm({ ...poojaForm, start_time: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End Time (optional)</Label>
                        <Input
                          type="time"
                          value={poojaForm.end_time}
                          onChange={(e) => setPoojaForm({ ...poojaForm, end_time: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Description (optional)</Label>
                      <Textarea
                        value={poojaForm.description}
                        onChange={(e) => setPoojaForm({ ...poojaForm, description: e.target.value })}
                        placeholder="Brief description of the pooja"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={poojaForm.is_daily}
                        onCheckedChange={(c) => setPoojaForm({ ...poojaForm, is_daily: c })}
                      />
                      <Label>Daily Pooja</Label>
                    </div>
                    {!poojaForm.is_daily && (
                      <div className="space-y-2">
                        <Label>Specific Date</Label>
                        <Input
                          type="date"
                          value={poojaForm.specific_date}
                          onChange={(e) => setPoojaForm({ ...poojaForm, specific_date: e.target.value })}
                        />
                      </div>
                    )}
                    <Button onClick={savePooja} disabled={loading} className="w-full">
                      {editingPooja ? 'Update Pooja' : 'Add Pooja'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pooja Name</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {poojaTimings.map((pooja) => (
                    <TableRow key={pooja.id}>
                      <TableCell className="font-medium">{pooja.pooja_name}</TableCell>
                      <TableCell>
                        {formatTime(pooja.start_time)}
                        {pooja.end_time && ` - ${formatTime(pooja.end_time)}`}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {pooja.is_daily ? 'Daily' : pooja.specific_date}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={pooja.source === 'admin' ? 'default' : 'secondary'}>
                          {pooja.source}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingPooja(pooja);
                              setPoojaForm({
                                pooja_name: pooja.pooja_name,
                                start_time: pooja.start_time,
                                end_time: pooja.end_time || '',
                                description: pooja.description || '',
                                is_daily: pooja.is_daily,
                                specific_date: pooja.specific_date || '',
                              });
                              setPoojaDialogOpen(true);
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deletePooja(pooja.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Announcements Tab */}
        <TabsContent value="announcements">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Temple Announcements
                </CardTitle>
                <CardDescription>Create announcements for festivals, maintenance, or emergencies</CardDescription>
              </div>
              <Dialog open={announcementDialogOpen} onOpenChange={setAnnouncementDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setEditingAnnouncement(null);
                    setAnnouncementForm({ title: '', message: '', announcement_type: 'info', priority: 0, valid_until: '' });
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Announcement
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={announcementForm.title}
                        onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                        placeholder="e.g., Temple Closed for Maintenance"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Message</Label>
                      <Textarea
                        value={announcementForm.message}
                        onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                        placeholder="Detailed message for devotees..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select
                          value={announcementForm.announcement_type}
                          onValueChange={(v) => setAnnouncementForm({ ...announcementForm, announcement_type: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="info">Info</SelectItem>
                            <SelectItem value="warning">Warning</SelectItem>
                            <SelectItem value="festival">Festival</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="emergency">Emergency</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Priority (0-10)</Label>
                        <Input
                          type="number"
                          min={0}
                          max={10}
                          value={announcementForm.priority}
                          onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Valid Until (optional)</Label>
                      <Input
                        type="datetime-local"
                        value={announcementForm.valid_until}
                        onChange={(e) => setAnnouncementForm({ ...announcementForm, valid_until: e.target.value })}
                      />
                    </div>
                    <Button onClick={saveAnnouncement} disabled={loading} className="w-full">
                      {editingAnnouncement ? 'Update Announcement' : 'Create Announcement'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {announcements.map((announcement) => (
                    <TableRow key={announcement.id}>
                      <TableCell className="font-medium">{announcement.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{announcement.announcement_type}</Badge>
                      </TableCell>
                      <TableCell>{announcement.priority}</TableCell>
                      <TableCell>
                        <Switch
                          checked={announcement.is_active}
                          onCheckedChange={() => toggleAnnouncement(announcement.id, announcement.is_active)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingAnnouncement(announcement);
                              setAnnouncementForm({
                                title: announcement.title,
                                message: announcement.message,
                                announcement_type: announcement.announcement_type,
                                priority: announcement.priority,
                                valid_until: announcement.valid_until || '',
                              });
                              setAnnouncementDialogOpen(true);
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteAnnouncement(announcement.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
