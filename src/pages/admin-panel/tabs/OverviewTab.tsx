import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TabsContent } from '@/components/ui/tabs';
import {
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Tooltip,
} from 'recharts';
import { Users, Calendar, AlertTriangle, MessageSquare } from 'lucide-react';

// Demo/mock chart data — kept alongside the only tab that renders it.
const chartData = [
  { name: 'Jan', users: 40, bookings: 24, revenue: 12000 },
  { name: 'Feb', users: 30, bookings: 13, revenue: 9000 },
  { name: 'Mar', users: 20, bookings: 98, revenue: 38000 },
  { name: 'Apr', users: 27, bookings: 39, revenue: 19000 },
  { name: 'May', users: 18, bookings: 48, revenue: 22000 },
  { name: 'Jun', users: 23, bookings: 38, revenue: 20000 },
];

const pieData = [
  { name: 'Active', value: 400, color: '#22c55e' },
  { name: 'Pending', value: 300, color: '#f59e0b' },
  { name: 'Cancelled', value: 100, color: '#ef4444' },
];

const OverviewTab = () => (
  <TabsContent value="overview" className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* PIE CHART - Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>User, Booking & Revenue Trends</CardTitle>
          <CardDescription>Combined monthly performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* PIE + AREA CHART */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Status & Revenue</CardTitle>
          <CardDescription>Distribution & revenue trend</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Second PieChart */}
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Area Chart */}
          <div className="h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1} />
                  </linearGradient>
                </defs>

                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#a855f7"
                  fill="url(#revenueGradient)"
                  name="Revenue"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>


    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common administrative tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="h-20 flex-col gap-2">
            <Users className="h-6 w-6" />
            <span className="text-sm">Manage Users</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2">
            <Calendar className="h-6 w-6" />
            <span className="text-sm">View Bookings</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2">
            <AlertTriangle className="h-6 w-6" />
            <span className="text-sm">Emergency Alerts</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2">
            <MessageSquare className="h-6 w-6" />
            <span className="text-sm">Content Moderation</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  </TabsContent>
);

export default OverviewTab;
