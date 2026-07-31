import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  Wrench, 
  TrendingUp, 
  Activity,
  AlertTriangle,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';
import { cn } from '@/lib/utils';

interface DashboardStats {
  totalUsers: number;
  totalBookings: number;
  activeGroups: number;
  totalPosts: number;
  emergencyAlerts: number;
  revenue: number;
}

interface MobileAdminDashboardProps {
  stats: DashboardStats;
  onNavigateToTab?: (tab: string) => void;
}

const MobileAdminDashboard: React.FC<MobileAdminDashboardProps> = ({ 
  stats, 
  onNavigateToTab 
}) => {
  const { counts } = useAdminNotifications();

  const quickStats = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
      trend: '+12%',
      trendUp: true,
    },
    {
      title: 'Bookings',
      value: stats.totalBookings,
      icon: Calendar,
      color: 'text-green-600 bg-green-100 dark:bg-green-900/30',
      unreadCount: counts.booking,
      onClick: () => onNavigateToTab?.('bookings'),
    },
    {
      title: 'Messages',
      value: stats.totalPosts,
      icon: MessageSquare,
      color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
      unreadCount: counts.message,
      onClick: () => onNavigateToTab?.('support'),
    },
    {
      title: 'Revenue',
      value: `₹${stats.revenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30',
      trend: '+8%',
      trendUp: true,
    },
  ];

  const actionCards = [
    {
      title: 'Pending Bookings',
      description: 'Review new booking requests',
      icon: Calendar,
      count: counts.booking,
      color: 'border-l-4 border-l-blue-500',
      onClick: () => onNavigateToTab?.('bookings'),
    },
    {
      title: 'New Messages',
      description: 'Respond to user inquiries',
      icon: MessageSquare,
      count: counts.message,
      color: 'border-l-4 border-l-green-500',
      onClick: () => onNavigateToTab?.('support'),
    },
    {
      title: 'Service Requests',
      description: 'Manage service inquiries',
      icon: Wrench,
      count: counts.service,
      color: 'border-l-4 border-l-purple-500',
      onClick: () => onNavigateToTab?.('services'),
    },
    {
      title: 'Emergency Alerts',
      description: 'Critical issues requiring attention',
      icon: AlertTriangle,
      count: counts.emergency,
      color: 'border-l-4 border-l-red-500',
      priority: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground text-sm">Welcome back, Admin</p>
      </div>

      {/* Quick Stats Grid - Mobile optimized 2x2 */}
      <div className="grid grid-cols-2 gap-3">
        {quickStats.map((stat, index) => (
          <Card 
            key={index} 
            className={cn(
              "relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow",
              stat.onClick && "active:scale-[0.98]"
            )}
            onClick={stat.onClick}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={cn("p-2 rounded-lg", stat.color)}>
                  <stat.icon className="h-4 w-4" />
                </div>
                {stat.unreadCount !== undefined && stat.unreadCount > 0 && (
                  <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-xs">
                    {stat.unreadCount}
                  </Badge>
                )}
                {stat.trend && (
                  <div className={cn(
                    "flex items-center text-xs font-medium",
                    stat.trendUp ? "text-green-600" : "text-red-600"
                  )}>
                    {stat.trendUp ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {stat.trend}
                  </div>
                )}
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Cards - Single column for mobile */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
          Needs Attention
        </h3>
        {actionCards.filter(card => card.count > 0 || card.priority).map((card, index) => (
          <Card 
            key={index}
            className={cn(
              "cursor-pointer hover:shadow-md transition-all active:scale-[0.99]",
              card.color,
              card.priority && card.count > 0 && "animate-pulse"
            )}
            onClick={card.onClick}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-muted">
                  <card.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{card.title}</h4>
                    {card.count > 0 && (
                      <Badge 
                        variant={card.priority ? "destructive" : "secondary"}
                        className="ml-2"
                      >
                        {card.count} new
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{card.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {actionCards.every(card => card.count === 0 && !card.priority) && (
          <Card className="border-dashed">
            <CardContent className="p-6 text-center">
              <Activity className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">All caught up! No pending items.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
          Quick Actions
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Landmarks', icon: '🕉️', tab: 'landmarks' },
            { label: 'Services', icon: '🛎️', tab: 'services' },
            { label: 'Audio', icon: '🔊', tab: 'audio' },
          ].map((action) => (
            <Card 
              key={action.tab}
              className="cursor-pointer hover:bg-muted/50 transition-colors active:scale-[0.98]"
              onClick={() => onNavigateToTab?.(action.tab)}
            >
              <CardContent className="p-4 text-center">
                <span className="text-2xl mb-1 block">{action.icon}</span>
                <span className="text-xs font-medium">{action.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileAdminDashboard;
