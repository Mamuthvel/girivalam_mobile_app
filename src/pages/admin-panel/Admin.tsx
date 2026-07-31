import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';

import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

import {
  Users,
  MapPin,
  AlertTriangle,
  TrendingUp,
  Activity,
  Settings,
  Shield,
  Calendar,
  DollarSign,
  Bell,
} from 'lucide-react';
import AdminNotificationBell from '@/components/admin/AdminNotificationBell';
import AdminNotificationSettings from '@/components/admin/AdminNotificationSettings';
import GroupHistoryTab from '@/components/admin/GroupHistoryTab';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminSupportTab from '@/components/AdminSupportTab';
import ServicesManagement from '@/components/admin/ServicesManagement';
import FoodGuideManagement from '@/components/admin/FoodGuideManagement';
import AnnadhanamManagement from '@/components/admin/AnnadhanamManagement';
import GuideManagement from '@/components/admin/GuideManagement';
import TempleManagement from '@/components/admin/TempleManagement';
import AudioManagement from '@/components/admin/AudioManagement';
import FeatureToggles from '@/components/admin/FeatureToggles';
import NotificationManagement from '@/components/admin/NotificationManagement';
import AnalyticsLogs from '@/components/admin/AnalyticsLogs';
import SecuritySettings from '@/components/admin/SecuritySettings';
import { LandmarkFormValues } from '@/schemas/landmark.schema';
// ---------- Supabase types ----------
import type { TablesUpdate } from '@/integrations/supabase/types'
import { seedLandmarks } from '@/scripts/seedLandmarks';
import { logger } from "@/lib/logger";

// Shared admin types (extracted from this file)
import type {
  DashboardStats,
  User,
  Booking,
  SystemMetrics,
  LandmarkRow,
} from './adminTypes';
export type { LandmarkRow, LandmarkInsert, LandmarkUpdate } from './adminTypes';

// Per-tab components (extracted from this file)
import OverviewTab from './tabs/OverviewTab';
import UsersTab from './tabs/UsersTab';
import LandmarksTab from './tabs/LandmarksTab';
import BookingsTab from './tabs/BookingsTab';
import ContentTab from './tabs/ContentTab';
import SystemTab from './tabs/SystemTab';

const Admin: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { counts, markCategoryAsRead } = useAdminNotifications();
  const [activeTab, setActiveTab] = useState('overview');

  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalBookings: 0,
    activeGroups: 0,
    totalPosts: 0,
    emergencyAlerts: 0,
    revenue: 0,
  });

  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const [roleCheckLoading, setRoleCheckLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [currentRole, setCurrentRole] = useState<string | null>(null);

  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [systemMetricsError, setSystemMetricsError] = useState<string | null>(null);

  const [userSearch, setUserSearch] = useState('');
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState<
    'all' | 'confirmed' | 'pending' | 'cancelled'
  >('all');

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editRole, setEditRole] = useState<string>('user');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [landmarks, setLandmarks] = useState<LandmarkRow[]>([])
  const [editingLandmark, setEditingLandmark] = useState<LandmarkRow | null>(null)
  const [isAddLandmarkOpen, setIsAddLandmarkOpen] = useState(false)
  const [landmarkLoading, setLandmarkLoading] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [landmarkSearch, setLandmarkSearch] = useState('');
  const [landmarkTypeFilter, setLandmarkTypeFilter] = useState<'all' | string>('all');
  const [landmarkStatusFilter, setLandmarkStatusFilter] = useState<'all' | 'active' | 'disabled'>('all');
  const [landmarkSort, setLandmarkSort] = useState<'recent' | 'oldest'>('recent');
  const filteredLandmarks = landmarks
    .filter(l => {
      // Name search
      if (landmarkSearch.trim()) {
        const q = landmarkSearch.toLowerCase();
        if (!l.name.toLowerCase().includes(q)) return false;
      }

      // Type filter
      if (landmarkTypeFilter !== 'all' && l.type !== landmarkTypeFilter) {
        return false;
      }

      // Status filter
      if (landmarkStatusFilter === 'active' && !l.is_active) return false;
      if (landmarkStatusFilter === 'disabled' && l.is_active) return false;

      return true;
    })
    .sort((a, b) => {
      if (landmarkSort === 'recent') {
        return new Date(b.updated_at ?? b.created_at).getTime()
          - new Date(a.updated_at ?? a.created_at).getTime();
      }
      return new Date(a.updated_at ?? a.created_at).getTime()
        - new Date(b.updated_at ?? b.created_at).getTime();
    });

  // ------------------------------
  // Data & Role Initialization
  // ------------------------------
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    logger.log("Auth user ID:", user.id)

    let bookingChannel: any;
    let userChannel: any;
    let metricsInterval: number | undefined;

    const init = async () => {
      try {
        setRoleCheckLoading(true);

        // 1) Check admin status using secure SECURITY DEFINER function
        const { data: isAdminUser, error: adminError } = await supabase.rpc('is_admin', { _user_id: user.id });

        if (adminError) {
          logger.error('Admin check error:', adminError);
          setUnauthorized(true);
          return;
        }

        if (!isAdminUser) {
          setUnauthorized(true);
          return;
        }

        // Get the specific role for display purposes
        const { data: roleData } = await supabase.rpc('get_user_role', { _user_id: user.id });
        setCurrentRole(roleData || 'admin');

        // 2) Initial load: dashboard & metrics
        await Promise.all([fetchDashboardData(), fetchSystemMetrics(), fetchLandmarks()]);

        // 3) Realtime subscriptions
        bookingChannel = supabase
          .channel('bookings-changes')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'bookings' },
            () => {
              fetchDashboardData();
            }
          )
          .subscribe();

        userChannel = supabase
          .channel('profiles-changes')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'profiles' },
            () => {
              fetchDashboardData();
            }
          )
          .subscribe();

        // 4) Poll system metrics periodically
        metricsInterval = window.setInterval(fetchSystemMetrics, 15000);
      } catch (err) {
        logger.error('Error initializing admin dashboard:', err);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load admin dashboard.',
        });
      } finally {
        setRoleCheckLoading(false);
      }
    };

    init();

    return () => {
      if (bookingChannel) supabase.removeChannel(bookingChannel);
      if (userChannel) supabase.removeChannel(userChannel);
      if (metricsInterval) window.clearInterval(metricsInterval);
    };
  }, [user, navigate, toast]);
  // ------------------------------
  // Map landmark handlers
  // ------------------------------
  const fetchLandmarks = async () => {
    const { data, error } = await supabase
      .from('landmarks')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      toast({ variant: 'destructive', title: error.message })
      return
    }

    setLandmarks(data ?? [])
  }


  const toggleLandmarkStatus = async (l: LandmarkRow) => {
    const update: TablesUpdate<'landmarks'> = {
      is_active: !l.is_active,
    }

    await supabase
      .from('landmarks')
      .update(update)
      .eq('id', l.id)

    fetchLandmarks()
  }

  const deleteLandmark = async (id: number) => {
    const { error } = await supabase
      .from('landmarks')
      .delete()
      .eq('id', id)

    if (error) {
      toast({ variant: 'destructive', title: error.message })
      return
    }

    fetchLandmarks()
  }

  const updateLandmark = async (formData: LandmarkFormValues) => {
    if (!editingLandmark) return
    setLandmarkLoading(true)

    const updateData = {
      ...formData,
      image_url: formData.image_url || null,
    }

    const { error } = await supabase
      .from('landmarks')
      .update(updateData as any)
      .eq('id', editingLandmark.id)

    setLandmarkLoading(false)

    if (error) {
      toast({ variant: 'destructive', title: error.message })
      return
    }

    toast({ title: 'Landmark updated' })
    setEditingLandmark(null)
    fetchLandmarks()
  }

  const createLandmark = async (formData: LandmarkFormValues) => {
    setLandmarkLoading(true)

    const insertData = {
      name: formData.name,
      lat: formData.lat,
      lng: formData.lng,
      type: formData.type,
      animation_type: formData.animation_type,
      direction: formData.direction,
      description: formData.description,
      timings: formData.timings,
      facilities: formData.facilities,
      is_active: formData.is_active,
      // Aṣṭa Lingam fields
      is_ashta_lingam: formData.is_ashta_lingam,
      enable_glow: formData.enable_glow,
      enable_aura_pulse: formData.enable_aura_pulse,
      enable_snake_animation: formData.enable_snake_animation,
      premium_glow: formData.premium_glow,
      glow_color: formData.glow_color,
      aura_color: formData.aura_color,
      icon_size: formData.icon_size,
      image_url: formData.image_url || null,
    }

    const { error } = await supabase
      .from('landmarks')
      .insert(insertData as any)

    setLandmarkLoading(false)

    if (error) {
      toast({ variant: 'destructive', title: error.message })
      return
    }

    toast({ title: 'Landmark created' })
    setIsAddLandmarkOpen(false)
    fetchLandmarks()
  }

  const handleSeedLandmarks = async () => {
    if (!window.confirm('Seed all default landmarks (41 locations)?\n\nExisting entries will be skipped — this is safe to run multiple times.')) return;
    setSeeding(true);
    try {
      const result = await seedLandmarks();
      toast({
        title: `Seeding complete`,
        description: `${result.inserted} inserted, ${result.skipped} already existed.`,
      });
      if (result.inserted > 0) fetchLandmarks();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Seed failed', description: e.message });
    } finally {
      setSeeding(false);
    }
  };

  // ------------------------------
  // Fetch dashboard data
  // ------------------------------
  const fetchDashboardData = async () => {
    try {
      const [usersRes, bookingsRes, groupsRes, postsRes, alertsRes] =
        await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('bookings').select('id,total_amount', { count: 'exact' }),
          // Use groups_public view to avoid exposing password_hash
          supabase.from('groups_public').select('id', { count: 'exact', head: true }),
          supabase
            .from('community_posts')
            .select('id', { count: 'exact', head: true }),
          supabase
            .from('emergency_alerts')
            .select('id', { count: 'exact', head: true }),
        ]);

      const bookingsData = (bookingsRes.data ?? []) as Booking[];
      const totalRevenue = bookingsData.reduce(
        (sum, booking) => sum + Number(booking.total_amount || 0),
        0
      );

      setStats({
        totalUsers: usersRes.count || 0,
        totalBookings: bookingsRes.count || 0,
        activeGroups: groupsRes.count || 0,
        totalPosts: postsRes.count || 0,
        emergencyAlerts: alertsRes.count || 0,
        revenue: totalRevenue,
      });

      // Recent users
      const { data: recentUsers } = await supabase
        .from('profiles')
        .select('id,email,display_name,created_at,role')
        .order('created_at', { ascending: false })
        .limit(20);

      setUsers((recentUsers as User[]) ?? []);

      // Recent bookings
      const { data: recentBookings } = await supabase
        .from('bookings')
        .select('id,customer_name,customer_email,customer_phone,booking_date,status,payment_status,total_amount,special_requests,guests_count')
        .order('created_at', { ascending: false })
        .limit(20);


      setBookings((recentBookings as Booking[]) ?? []);
    } catch (error) {
      logger.error('Error fetching dashboard data:', error);
      toast({
        variant: 'destructive',
        title: 'Error loading data',
        description: 'There was a problem loading dashboard data.',
      });
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------
  // System metrics
  // ------------------------------
  const fetchSystemMetrics = async () => {
    try {
      // Mock system metrics since no backend API exists
      const mockData: SystemMetrics = {
        cpu: Math.floor(Math.random() * 30) + 20, // 20-50%
        memory: Math.floor(Math.random() * 40) + 30, // 30-70%
        disk: Math.floor(Math.random() * 20) + 10, // 10-30%
        responseTime: Math.floor(Math.random() * 200) + 50, // 50-250ms
        dbHealthy: Math.random() > 0.1, // 90% healthy
        apiHealthy: Math.random() > 0.05, // 95% healthy
        storageHealthy: Math.random() > 0.15, // 85% healthy
      };

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      setSystemMetrics(mockData);
      setSystemMetricsError(null);
    } catch (error) {
      logger.error('Error fetching system metrics:', error);
      setSystemMetricsError('Unable to load system metrics');
    }
  };

  const pendingBookings = bookings.filter((b) => b.status === 'pending').length;

  const isSystemDegraded =
    !!systemMetrics &&
    (systemMetrics.cpu > 85 ||
      systemMetrics.memory > 85 ||
      systemMetrics.disk > 90 ||
      systemMetrics.responseTime > 1500 ||
      !systemMetrics.apiHealthy ||
      !systemMetrics.dbHealthy ||
      !systemMetrics.storageHealthy);

  const filteredUsers = users.filter((u) => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return (
      (u.display_name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q)
    );
  });

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch = !bookingSearch.trim()
      ? true
      : (b.customer_name || '')
        .toLowerCase()
        .includes(bookingSearch.toLowerCase()) ||
      (b.customer_email || '')
        .toLowerCase()
        .includes(bookingSearch.toLowerCase());

    const matchesStatus =
      bookingStatusFilter === 'all' ? true : b.status === bookingStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // ------------------------------
  // CSV Export helpers
  // ------------------------------
  const downloadCsv = (rows: Record<string, any>[], filename: string) => {
    if (!rows.length) {
      toast({
        title: 'No data to export',
        description: 'There is no data available for export.',
      });
      return;
    }

    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(','),
      ...rows.map((row) =>
        headers
          .map((h) => `"${String(row[h] ?? '').replace(/"/g, '""')}"`)
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportUsersToCsv = () => {
    const rows = users.map((u) => ({
      id: u.id,
      email: u.email,
      display_name: u.display_name || '',
      role: u.role || '',
      created_at: u.created_at,
    }));
    downloadCsv(rows, 'users.csv');
  };

  const exportBookingsToCsv = () => {
    const rows = bookings.map((b) => ({
      id: b.id,
      customer_name: b.customer_name,
      customer_email: b.customer_email,
      booking_date: b.booking_date,
      status: b.status || '',
      total_amount: b.total_amount ?? 0,
      service_details: b.service_details || '',
    }));
    downloadCsv(rows, 'bookings.csv');
  };

  // ------------------------------
  // User edit
  // ------------------------------
  const handleOpenEditUser = (u: User) => {
    setSelectedUser(u);
    setEditRole(u.role || 'user');
    setIsEditDialogOpen(true);
  };

  const handleSaveUserRole = async () => {
    if (!selectedUser) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: editRole })
        .eq('id', selectedUser.id);

      if (error) throw error;

      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id ? { ...u, role: editRole } : u
        )
      );

      toast({
        title: 'User updated',
        description: 'User role updated successfully.',
      });

      setIsEditDialogOpen(false);
    } catch (error) {
      logger.error('Error updating user role:', error);
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: 'Failed to update user role.',
      });
    }
  };

  // ------------------------------
  // Booking edit
  // ------------------------------
  const updateBookingStatus = async (bookingId: string, field: 'status' | 'payment_status', value: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ [field]: value } as never)
        .eq('id', bookingId);

      if (error) throw error;

      // Update local state
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId ? { ...booking, [field]: value } : booking
        )
      );

      toast({
        title: 'Booking updated',
        description: `${field === 'status' ? 'Booking status' : 'Payment status'} updated successfully.`,
      });
    } catch (error) {
      logger.error('Error updating booking:', error);
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: 'Failed to update booking status.',
      });
    }
  };

  const handleMaintenanceAction = (action: 'backup' | 'cache' | 'security') => {
    const label =
      action === 'backup'
        ? 'Backup'
        : action === 'cache'
          ? 'Cache clearing'
          : 'Security scan';

    toast({
      title: `${label} started`,
      description: 'This may take a few minutes.',
    });
  };

  if (roleCheckLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          <p className="text-sm text-muted-foreground">
            Loading admin dashboard…
          </p>
        </div>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access denied</CardTitle>
            <CardDescription>
              You do not have permission to access this dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-end">
            <Button onClick={() => navigate('/')}>Go to home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pendingBookingsCount = pendingBookings;

  const isDegraded = isSystemDegraded;

  return (
    <div className="min-h-screen bg-background">
      {/* <Button
        variant="outline"
        onClick={async () => {
          try {
            await seedLandmarks()
            toast({ title: 'Landmarks inserted' })
            fetchLandmarks()
          } catch (e: any) {
            toast({ variant: 'destructive', title: e.message })
          }
        }}
      >
        Seed Landmarks
      </Button> */}

      {/* Header - Mobile Optimized */}
      <div className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent truncate">
                Admin Dashboard
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
                Manage your Girivalam Vibe application
              </p>
            </div>
            <div className="flex items-center gap-1 md:gap-2 shrink-0">
              <AdminNotificationBell />
              <Badge variant="outline" className="hidden md:flex items-center gap-1">
                <Shield className="h-3 w-3" />
                {currentRole || 'Admin'}
              </Badge>
              <Button variant="outline" size="icon" className="md:hidden" onClick={() => setActiveTab('notification-settings')}>
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="hidden md:flex">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* {(pendingBookingsCount > 0 || isDegraded) && (
          <Alert variant={isDegraded ? 'destructive' : 'default'}>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>
              {isDegraded ? 'System health warning' : 'Attention required'}
            </AlertTitle>
            <AlertDescription>
              {isDegraded && systemMetrics
                ? 'System resources are under high load. Monitor CPU, memory, disk usage and response time.'
                : null}
              {pendingBookingsCount > 0 && (
                <span className="block">
                  There are <strong>{pendingBookingsCount}</strong> pending
                  bookings that require attention.
                </span>
              )}
            </AlertDescription>
          </Alert>
        )} */}

        {/* Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Activity className="h-3 w-3" />
                +8% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{Number(stats.revenue || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +15% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Groups</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeGroups}</div>
              <p className="text-xs text-muted-foreground">
                Groups currently active
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={(val) => {
          setActiveTab(val);
          // Mark notifications as read when navigating to category-specific tabs
          if (val === 'bookings' && counts.booking > 0) markCategoryAsRead('booking');
          if (val === 'support' && counts.message > 0) markCategoryAsRead('message');
          if (val === 'services' && counts.service > 0) markCategoryAsRead('service');
        }} className="space-y-6">
          <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
            <TabsList className="inline-flex w-max min-w-full md:w-auto md:min-w-0 flex-nowrap gap-1">
              <TabsTrigger value="overview" className="whitespace-nowrap">Overview</TabsTrigger>
              <TabsTrigger value="users" className="whitespace-nowrap">Users</TabsTrigger>
              <TabsTrigger value="groups" className="whitespace-nowrap">Groups</TabsTrigger>
              <TabsTrigger value="bookings" className="whitespace-nowrap relative">
                Bookings
                {counts.booking > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] bg-destructive text-destructive-foreground rounded-full flex items-center justify-center">
                    {counts.booking}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="landmarks" className="whitespace-nowrap">Landmarks</TabsTrigger>
              <TabsTrigger value="temple" className="whitespace-nowrap">Temple</TabsTrigger>
              <TabsTrigger value="services" className="whitespace-nowrap relative">
                Services
                {counts.service > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] bg-destructive text-destructive-foreground rounded-full flex items-center justify-center">
                    {counts.service}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="food-guide" className="whitespace-nowrap">Food Guide</TabsTrigger>
              <TabsTrigger value="annadhanam" className="whitespace-nowrap">Annadhanam</TabsTrigger>
              <TabsTrigger value="audio" className="whitespace-nowrap">Audio</TabsTrigger>
              <TabsTrigger value="guide" className="whitespace-nowrap">Spiritual Guide</TabsTrigger>
              <TabsTrigger value="support" className="whitespace-nowrap relative">
                Support
                {counts.message > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] bg-destructive text-destructive-foreground rounded-full flex items-center justify-center">
                    {counts.message}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="content" className="whitespace-nowrap">Content</TabsTrigger>
              <TabsTrigger value="toggles" className="whitespace-nowrap">Toggles</TabsTrigger>
              <TabsTrigger value="notification-settings" className="whitespace-nowrap">
                <Bell className="h-4 w-4 mr-1" />
                Alerts
              </TabsTrigger>
              <TabsTrigger value="notifications" className="whitespace-nowrap">Notifications</TabsTrigger>
              <TabsTrigger value="analytics" className="whitespace-nowrap">Analytics</TabsTrigger>
              <TabsTrigger value="security" className="whitespace-nowrap">Security</TabsTrigger>
              <TabsTrigger value="system" className="whitespace-nowrap">System</TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <OverviewTab />

          {/* Users Tab */}
          <UsersTab
            userSearch={userSearch}
            setUserSearch={setUserSearch}
            exportUsersToCsv={exportUsersToCsv}
            filteredUsers={filteredUsers}
            handleOpenEditUser={handleOpenEditUser}
            isEditDialogOpen={isEditDialogOpen}
            setIsEditDialogOpen={setIsEditDialogOpen}
            selectedUser={selectedUser}
            editRole={editRole}
            setEditRole={setEditRole}
            handleSaveUserRole={handleSaveUserRole}
          />
          <LandmarksTab
            seeding={seeding}
            onSeed={handleSeedLandmarks}
            landmarkSearch={landmarkSearch}
            setLandmarkSearch={setLandmarkSearch}
            landmarkTypeFilter={landmarkTypeFilter}
            setLandmarkTypeFilter={setLandmarkTypeFilter}
            landmarkStatusFilter={landmarkStatusFilter}
            setLandmarkStatusFilter={setLandmarkStatusFilter}
            landmarkSort={landmarkSort}
            setLandmarkSort={setLandmarkSort}
            filteredLandmarks={filteredLandmarks}
            setEditingLandmark={setEditingLandmark}
            toggleLandmarkStatus={toggleLandmarkStatus}
            deleteLandmark={deleteLandmark}
            isAddLandmarkOpen={isAddLandmarkOpen}
            setIsAddLandmarkOpen={setIsAddLandmarkOpen}
            createLandmark={createLandmark}
            landmarkLoading={landmarkLoading}
            editingLandmark={editingLandmark}
            updateLandmark={updateLandmark}
          />


          {/* Bookings Tab */}
          <BookingsTab
            bookingSearch={bookingSearch}
            setBookingSearch={setBookingSearch}
            bookingStatusFilter={bookingStatusFilter}
            setBookingStatusFilter={setBookingStatusFilter}
            exportBookingsToCsv={exportBookingsToCsv}
            filteredBookings={filteredBookings}
            updateBookingStatus={updateBookingStatus}
          />

          {/* Temple Management Tab */}
          <TabsContent value="temple">
            <TempleManagement />
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services">
            <ServicesManagement />
          </TabsContent>

          {/* Food Guide Tab */}
          <TabsContent value="food-guide">
            <FoodGuideManagement />
          </TabsContent>

          <TabsContent value="annadhanam">
            <AnnadhanamManagement />
          </TabsContent>


          {/* Sacred Audio Tab */}
          <TabsContent value="audio">
            <AudioManagement />
          </TabsContent>

          <TabsContent value="guide">
            <GuideManagement />
          </TabsContent>



          <TabsContent value="support">
            <AdminSupportTab />
          </TabsContent>

          {/* Content Tab */}
          <ContentTab stats={stats} />

          {/* System Tab */}
          <SystemTab
            systemMetrics={systemMetrics}
            systemMetricsError={systemMetricsError}
            fetchSystemMetrics={fetchSystemMetrics}
            handleMaintenanceAction={handleMaintenanceAction}
          />

          {/* Feature Toggles Tab */}
          <TabsContent value="toggles">
            <FeatureToggles />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <NotificationManagement />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <AnalyticsLogs />
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <SecuritySettings />
          </TabsContent>

          {/* Notification Settings Tab */}
          <TabsContent value="notification-settings">
            <AdminNotificationSettings />
          </TabsContent>

          {/* Groups History Tab */}
          <TabsContent value="groups">
            <GroupHistoryTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
