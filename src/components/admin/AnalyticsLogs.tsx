import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Activity, Clock, MapPin, AlertTriangle, RefreshCw, TrendingUp } from 'lucide-react';
import { logger } from "@/lib/logger";

interface JourneyAnalytics {
  hour: number;
  count: number;
}

interface ErrorLog {
  id: string;
  event_type: string;
  event_data: Record<string, unknown>;
  created_at: string;
}

const AnalyticsLogs: React.FC = () => {
  const [journeyData, setJourneyData] = useState<JourneyAnalytics[]>([]);
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [popularTimings, setPopularTimings] = useState<{ time: string; visitors: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Load user analytics
      const { data: analyticsData } = await supabase
        .from('user_analytics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (analyticsData) {
        // Process hourly distribution
        const hourlyDistribution = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));
        analyticsData.forEach(event => {
          const hour = new Date(event.created_at).getHours();
          hourlyDistribution[hour].count++;
        });
        setJourneyData(hourlyDistribution);

        // Filter error events
        const errors = analyticsData.filter(e => e.event_type.includes('error'));
        setErrorLogs(errors as ErrorLog[]);
      }

      // Generate popular timings (mock data for demonstration)
      setPopularTimings([
        { time: '5:00 AM', visitors: 45 },
        { time: '6:00 AM', visitors: 120 },
        { time: '7:00 AM', visitors: 85 },
        { time: '5:00 PM', visitors: 95 },
        { time: '6:00 PM', visitors: 150 },
        { time: '7:00 PM', visitors: 110 },
        { time: 'Full Moon', visitors: 500 },
      ]);

    } catch (error) {
      logger.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics & Logs</h2>
          <p className="text-muted-foreground">Journey insights and system monitoring</p>
        </div>
        <Button variant="outline" onClick={loadAnalytics} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="journeys">
        <TabsList>
          <TabsTrigger value="journeys">
            <Activity className="h-4 w-4 mr-2" />
            Journey Analytics
          </TabsTrigger>
          <TabsTrigger value="timings">
            <Clock className="h-4 w-4 mr-2" />
            Popular Timings
          </TabsTrigger>
          <TabsTrigger value="errors">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Error Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="journeys" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hourly Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Hourly Journey Distribution
                </CardTitle>
                <CardDescription>Number of journey events by hour of day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={journeyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="hour" 
                        tickFormatter={(value) => `${value}:00`}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(value) => `${value}:00 - ${Number(value) + 1}:00`}
                      />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Journey Heatmap Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Journey Heatmap
                </CardTitle>
                <CardDescription>Popular locations along the girivalam path</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-[300px]">
                <div className="text-center text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Heatmap visualization</p>
                  <p className="text-sm">Coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Most Popular Girivalam Timings
              </CardTitle>
              <CardDescription>Peak visitor hours and special events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={popularTimings}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="visitors" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Error Logs
              </CardTitle>
              <CardDescription>Recent system errors and issues</CardDescription>
            </CardHeader>
            <CardContent>
              {errorLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No errors logged recently</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event Type</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {errorLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Badge variant="destructive">{log.event_type}</Badge>
                        </TableCell>
                        <TableCell className="max-w-md truncate text-sm">
                          {JSON.stringify(log.event_data)}
                        </TableCell>
                        <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
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

export default AnalyticsLogs;
