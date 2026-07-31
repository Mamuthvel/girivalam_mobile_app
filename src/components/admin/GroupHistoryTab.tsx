import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Users,
  Search,
  RefreshCw,
  Footprints,
  Route,
  ChevronRight,
  Lock,
  Globe,
  Trash2,
  Eye,
  Activity,
  TrendingUp,
  UserCheck,
  ToggleLeft,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface GroupRow {
  id: string;
  name: string;
  code: string;
  creator_id: string;
  description: string | null;
  group_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface MemberAggregate {
  groupId: string;
  totalMembers: number;
  activeMembers: number;    // is_active = true
  trackingMembers: number;  // tracking_started_at not null
  totalDistanceKm: number;
  totalSteps: number;
}

interface MemberDetail {
  id: string;
  user_id: string;
  role: string | null;
  is_active: boolean;
  distance_km: number;
  steps_count: number;
  tracking_started_at: string | null;
  joined_at: string;
  email?: string;
  display_name?: string;
}

interface EnrichedGroup extends GroupRow {
  agg: MemberAggregate;
  creatorEmail?: string;
  creatorName?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const fmtDist = (km: number) =>
  km >= 1 ? `${km.toFixed(1)} km` : `${Math.round(km * 1000)} m`;

const fmtSteps = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

// ─── Component ────────────────────────────────────────────────────────────────

const GroupHistoryTab = () => {
  const { toast } = useToast();

  const [groups, setGroups]       = useState<EnrichedGroup[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [typeFilter, setTypeFilter]   = useState<'all' | 'public' | 'private'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy]       = useState<'created' | 'members' | 'distance'>('created');

  // Members drawer
  const [drawerGroup, setDrawerGroup] = useState<EnrichedGroup | null>(null);
  const [members, setMembers]         = useState<MemberDetail[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      // 1. All groups (admin view — includes password_hash field, just ignore it)
      const { data: groupRows, error: gErr } = await supabase
        .from('groups')
        .select('id, name, code, creator_id, description, group_type, is_active, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (gErr) throw gErr;
      if (!groupRows?.length) { setGroups([]); return; }

      // 2. All group_members
      const { data: memberRows, error: mErr } = await supabase
        .from('group_members')
        .select('group_id, user_id, is_active, distance_km, steps_count, tracking_started_at');

      if (mErr) throw mErr;

      // 3. Creator profiles
      const creatorIds = [...new Set(groupRows.map(g => g.creator_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, email')
        .in('user_id', creatorIds);

      const profileMap = new Map(
        (profiles ?? []).map(p => [p.user_id, p])
      );

      // 4. Build member aggregates per group
      const aggMap = new Map<string, MemberAggregate>();
      for (const m of memberRows ?? []) {
        const existing = aggMap.get(m.group_id) ?? {
          groupId: m.group_id,
          totalMembers: 0,
          activeMembers: 0,
          trackingMembers: 0,
          totalDistanceKm: 0,
          totalSteps: 0,
        };
        existing.totalMembers++;
        if (m.is_active) existing.activeMembers++;
        if (m.tracking_started_at) existing.trackingMembers++;
        existing.totalDistanceKm += Number(m.distance_km) || 0;
        existing.totalSteps      += m.steps_count || 0;
        aggMap.set(m.group_id, existing);
      }

      // 5. Enrich groups
      const enriched: EnrichedGroup[] = groupRows.map(g => {
        const profile = profileMap.get(g.creator_id);
        return {
          ...g,
          agg: aggMap.get(g.id) ?? {
            groupId: g.id, totalMembers: 0, activeMembers: 0,
            trackingMembers: 0, totalDistanceKm: 0, totalSteps: 0,
          },
          creatorEmail: (profile as any)?.email ?? undefined,
          creatorName:  (profile as any)?.display_name ?? undefined,
        };
      });

      setGroups(enriched);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Failed to load groups', description: err.message });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  // ── Load members for drawer ────────────────────────────────────────────────

  const openMembersDrawer = async (group: EnrichedGroup) => {
    setDrawerGroup(group);
    setMembersLoading(true);
    try {
      const { data: mRows, error } = await supabase
        .from('group_members')
        .select('id, user_id, role, is_active, distance_km, steps_count, tracking_started_at, joined_at')
        .eq('group_id', group.id)
        .order('joined_at', { ascending: true });

      if (error) throw error;

      const userIds = (mRows ?? []).map(m => m.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, email')
        .in('user_id', userIds);

      const pMap = new Map((profiles ?? []).map(p => [p.user_id, p]));

      const enrichedMembers: MemberDetail[] = (mRows ?? []).map(m => ({
        ...m,
        email:        (pMap.get(m.user_id) as any)?.email ?? m.user_id.slice(0, 8) + '…',
        display_name: (pMap.get(m.user_id) as any)?.display_name ?? undefined,
      }));

      setMembers(enrichedMembers);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Failed to load members', description: err.message });
    } finally {
      setMembersLoading(false);
    }
  };

  // ── Delete group ──────────────────────────────────────────────────────────

  const deleteGroup = async (groupId: string, groupName: string) => {
    try {
      const { error } = await supabase.from('groups').delete().eq('id', groupId);
      if (error) throw error;
      toast({ title: `Group "${groupName}" deleted` });
      setGroups(prev => prev.filter(g => g.id !== groupId));
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Delete failed', description: err.message });
    }
  };

  // ── Toggle group active status ─────────────────────────────────────────────

  const toggleActive = async (group: EnrichedGroup) => {
    const newVal = !group.is_active;
    try {
      const { error } = await supabase
        .from('groups')
        .update({ is_active: newVal })
        .eq('id', group.id);
      if (error) throw error;
      setGroups(prev => prev.map(g => g.id === group.id ? { ...g, is_active: newVal } : g));
      toast({ title: `Group ${newVal ? 'activated' : 'deactivated'}` });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Update failed', description: err.message });
    }
  };

  // ── Derived stats ──────────────────────────────────────────────────────────

  const totalGroups    = groups.length;
  const activeGroups   = groups.filter(g => g.is_active).length;
  const totalMembers   = groups.reduce((s, g) => s + g.agg.totalMembers, 0);
  const totalDistanceKm = groups.reduce((s, g) => s + g.agg.totalDistanceKm, 0);
  const currentlyTracking = groups.reduce((s, g) => s + g.agg.trackingMembers, 0);

  // ── Filter + sort ──────────────────────────────────────────────────────────

  const displayed = groups
    .filter(g => {
      if (search && !g.name.toLowerCase().includes(search.toLowerCase()) &&
          !g.code.toLowerCase().includes(search.toLowerCase())) return false;
      if (typeFilter !== 'all' && g.group_type !== typeFilter) return false;
      if (statusFilter === 'active'   && !g.is_active) return false;
      if (statusFilter === 'inactive' &&  g.is_active) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'members')  return b.agg.totalMembers - a.agg.totalMembers;
      if (sortBy === 'distance') return b.agg.totalDistanceKm - a.agg.totalDistanceKm;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-5 text-center">
            <Users className="h-6 w-6 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold">{totalGroups}</p>
            <p className="text-xs text-muted-foreground">Total Groups</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 text-center">
            <Activity className="h-6 w-6 text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-green-600">{activeGroups}</p>
            <p className="text-xs text-muted-foreground">Active Groups</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 text-center">
            <UserCheck className="h-6 w-6 text-sky-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-sky-600">{totalMembers}</p>
            <p className="text-xs text-muted-foreground">Total Members</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 text-center">
            <Route className="h-6 w-6 text-orange-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-orange-600">{fmtDist(totalDistanceKm)}</p>
            <p className="text-xs text-muted-foreground">Distance Walked</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 text-center">
            <TrendingUp className="h-6 w-6 text-purple-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-purple-600">{currentlyTracking}</p>
            <p className="text-xs text-muted-foreground">Tracking Now</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search by name or code…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <Select value={typeFilter} onValueChange={v => setTypeFilter(v as any)}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="private">Private</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={v => setStatusFilter(v as any)}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={v => setSortBy(v as any)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created">Latest Created</SelectItem>
            <SelectItem value="members">Most Members</SelectItem>
            <SelectItem value="distance">Most Distance</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          onClick={fetchGroups}
          disabled={loading}
          title="Refresh"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>

        <span className="text-sm text-muted-foreground ml-auto">
          {displayed.length} of {groups.length} groups
        </span>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Group History
          </CardTitle>
          <CardDescription>All created groups with member activity and distance data</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Group</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead className="text-center">Members</TableHead>
                  <TableHead className="text-center">Active</TableHead>
                  <TableHead className="text-right">Distance</TableHead>
                  <TableHead className="text-right">Steps</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 10 }).map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-4 bg-muted rounded animate-pulse w-16" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : displayed.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                      {groups.length === 0
                        ? 'No groups created yet.'
                        : 'No groups match the current filters.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  displayed.map(group => (
                    <TableRow key={group.id} className="group/row">
                      <TableCell>
                        <div>
                          <p className="font-medium leading-tight">{group.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{group.code}</p>
                          {group.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[180px]">
                              {group.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {group.group_type === 'private' ? (
                          <Badge variant="outline" className="gap-1 text-xs border-amber-300 text-amber-700 bg-amber-50">
                            <Lock className="h-2.5 w-2.5" />
                            Private
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1 text-xs border-sky-300 text-sky-700 bg-sky-50">
                            <Globe className="h-2.5 w-2.5" />
                            Public
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <p className="font-medium truncate max-w-[120px]">
                            {group.creatorName ?? group.creatorEmail ?? group.creator_id.slice(0, 8) + '…'}
                          </p>
                          {group.creatorName && group.creatorEmail && (
                            <p className="text-muted-foreground truncate max-w-[120px]">{group.creatorEmail}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-semibold">{group.agg.totalMembers}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        {group.agg.activeMembers > 0 ? (
                          <span className="inline-flex items-center gap-1 text-green-600 font-medium text-sm">
                            <span className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                            {group.agg.activeMembers}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {group.agg.totalDistanceKm > 0
                          ? fmtDist(group.agg.totalDistanceKm)
                          : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {group.agg.totalSteps > 0
                          ? fmtSteps(group.agg.totalSteps)
                          : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {fmtDate(group.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            group.is_active
                              ? 'border-green-300 text-green-700 bg-green-50'
                              : 'border-gray-300 text-gray-500 bg-gray-50'
                          }
                        >
                          {group.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="View members"
                            onClick={() => openMembersDrawer(group)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title={group.is_active ? 'Deactivate' : 'Activate'}
                            onClick={() => toggleActive(group)}
                          >
                            <ToggleLeft className="h-3.5 w-3.5" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                title="Delete group"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete "{group.name}"?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This permanently removes the group and all its member records.
                                  This cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => deleteGroup(group.id, group.name)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Members drawer */}
      <Dialog open={!!drawerGroup} onOpenChange={open => { if (!open) setDrawerGroup(null); }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              {drawerGroup?.name} — Members
              <Badge variant="outline" className="ml-1 text-xs">
                {drawerGroup?.code}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          {membersLoading ? (
            <div className="space-y-2 py-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : members.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No members yet.</p>
          ) : (
            <div className="space-y-4">
              {/* Group-level stats */}
              {drawerGroup && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <p className="text-lg font-bold">{drawerGroup.agg.totalMembers}</p>
                    <p className="text-xs text-muted-foreground">Members</p>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <p className="text-lg font-bold text-orange-600">
                      {fmtDist(drawerGroup.agg.totalDistanceKm)}
                    </p>
                    <p className="text-xs text-muted-foreground">Total Distance</p>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <p className="text-lg font-bold text-sky-600">
                      {fmtSteps(drawerGroup.agg.totalSteps)}
                    </p>
                    <p className="text-xs text-muted-foreground">Total Steps</p>
                  </div>
                </div>
              )}

              {/* Members table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Distance</TableHead>
                    <TableHead className="text-right">Steps</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map(m => (
                    <TableRow key={m.id}>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{m.display_name ?? m.email}</p>
                          {m.display_name && (
                            <p className="text-xs text-muted-foreground">{m.email}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs capitalize">
                          {m.role ?? 'member'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm font-mono">
                        {m.distance_km > 0 ? fmtDist(m.distance_km) : '—'}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {m.steps_count > 0 ? fmtSteps(m.steps_count) : '—'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {fmtDate(m.joined_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            m.tracking_started_at ? 'bg-green-500 animate-pulse' :
                            m.is_active ? 'bg-sky-500' : 'bg-gray-300'
                          }`} />
                          <span className={
                            m.tracking_started_at ? 'text-green-600 font-medium' :
                            m.is_active ? 'text-sky-600' : 'text-muted-foreground'
                          }>
                            {m.tracking_started_at ? 'Tracking' : m.is_active ? 'Joined' : 'Inactive'}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GroupHistoryTab;
