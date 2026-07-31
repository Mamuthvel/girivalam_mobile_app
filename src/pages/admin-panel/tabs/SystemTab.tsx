import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { TabsContent } from '@/components/ui/tabs';
import {
  AlertTriangle,
  Cpu,
  HardDrive,
  Server,
  Zap,
  Database,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import type { SystemMetrics } from '../adminTypes';

interface SystemTabProps {
  systemMetrics: SystemMetrics | null;
  systemMetricsError: string | null;
  fetchSystemMetrics: () => void;
  handleMaintenanceAction: (action: 'backup' | 'cache' | 'security') => void;
}

const SystemTab = ({
  systemMetrics,
  systemMetricsError,
  fetchSystemMetrics,
  handleMaintenanceAction,
}: SystemTabProps) => (
  <TabsContent value="system">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>Database, API & storage status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {systemMetricsError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Metrics unavailable</AlertTitle>
              <AlertDescription>
                {systemMetricsError}
              </AlertDescription>
            </Alert>
          )}
          {systemMetrics && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  <span>Database</span>
                </div>
                <Badge
                  variant={
                    systemMetrics.dbHealthy ? 'default' : 'destructive'
                  }
                >
                  {systemMetrics.dbHealthy ? 'Healthy' : 'Issue'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  <span>API</span>
                </div>
                <Badge
                  variant={
                    systemMetrics.apiHealthy ? 'default' : 'destructive'
                  }
                >
                  {systemMetrics.apiHealthy ? 'Healthy' : 'Issue'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4" />
                  <span>Storage</span>
                </div>
                <Badge
                  variant={
                    systemMetrics.storageHealthy
                      ? 'default'
                      : 'destructive'
                  }
                >
                  {systemMetrics.storageHealthy ? 'Healthy' : 'Issue'}
                </Badge>
              </div>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            className="mt-2 flex items-center gap-2"
            onClick={fetchSystemMetrics}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Metrics
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Real-time resource usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {systemMetrics ? (
            <>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="flex items-center gap-1">
                    <Cpu className="h-3 w-3" />
                    CPU
                  </span>
                  <span>{systemMetrics.cpu}%</span>
                </div>
                <Progress value={systemMetrics.cpu} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    Memory
                  </span>
                  <span>{systemMetrics.memory}%</span>
                </div>
                <Progress value={systemMetrics.memory} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="flex items-center gap-1">
                    <HardDrive className="h-3 w-3" />
                    Disk
                  </span>
                  <span>{systemMetrics.disk}%</span>
                </div>
                <Progress value={systemMetrics.disk} />
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    Response time
                  </span>
                  <span>{systemMetrics.responseTime} ms</span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No system metrics available yet.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent System Events</CardTitle>
          <CardDescription>High-level system activity log</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Backup completed</span>
            <span className="text-xs text-muted-foreground">
              Today, 02:15 AM
            </span>
          </div>
          <div className="flex justify-between">
            <span>New emergency alert created</span>
            <span className="text-xs text-muted-foreground">
              Today, 01:42 AM
            </span>
          </div>
          <div className="flex justify-between">
            <span>API latency spike detected</span>
            <span className="text-xs text-muted-foreground">
              Yesterday, 11:18 PM
            </span>
          </div>
          <div className="flex justify-between">
            <span>Security scan completed</span>
            <span className="text-xs text-muted-foreground">
              Yesterday, 06:21 PM
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance Tools</CardTitle>
          <CardDescription>
            Run backups, clear cache, and perform security checks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full flex items-center justify-between"
            onClick={() => handleMaintenanceAction('backup')}
          >
            <span className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Run Backup
            </span>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="w-full flex items-center justify-between"
            onClick={() => handleMaintenanceAction('cache')}
          >
            <span className="flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Clear Cache
            </span>
            <Zap className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="w-full flex items-center justify-between"
            onClick={() => handleMaintenanceAction('security')}
          >
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Security Scan
            </span>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  </TabsContent>
);

export default SystemTab;
