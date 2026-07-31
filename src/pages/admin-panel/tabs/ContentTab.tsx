import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TabsContent } from '@/components/ui/tabs';
import { BookOpen, MessageSquare, AlertTriangle } from 'lucide-react';
import type { DashboardStats } from '../adminTypes';

interface ContentTabProps {
  stats: DashboardStats;
}

const ContentTab = ({ stats }: ContentTabProps) => (
  <TabsContent value="content">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Content Statistics</CardTitle>
          <CardDescription>
            Engagement and activity overview
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span>Total Posts</span>
            <span className="font-bold">{stats.totalPosts}</span>
          </div>
          <div className="flex justify-between">
            <span>Emergency Alerts</span>
            <span className="font-bold">{stats.emergencyAlerts}</span>
          </div>
          <div className="flex justify-between">
            <span>Active Groups</span>
            <span className="font-bold">{stats.activeGroups}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Content Moderation</CardTitle>
          <CardDescription>
            Manage user-generated content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button className="w-full" variant="outline">
              <BookOpen className="h-4 w-4 mr-2" />
              Review Posts
            </Button>
            <Button className="w-full" variant="outline">
              <MessageSquare className="h-4 w-4 mr-2" />
              Manage Comments
            </Button>
            <Button className="w-full" variant="outline">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Emergency Alerts
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </TabsContent>
);

export default ContentTab;
