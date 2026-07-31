import React, { useState } from 'react';
import { Bell, Calendar, MessageSquare, Wrench, AlertTriangle, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useAdminNotifications, AdminNotification } from '@/hooks/useAdminNotifications';
import { formatDistanceToNow } from 'date-fns';

const categoryIcons = {
  booking: Calendar,
  message: MessageSquare,
  service: Wrench,
  emergency: AlertTriangle,
};

const categoryColors = {
  booking: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  message: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  service: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  emergency: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const AdminNotificationBell: React.FC = () => {
  const { notifications, counts, markAsRead, markCategoryAsRead } = useAdminNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const handleNotificationClick = (notification: AdminNotification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {counts.total > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 min-w-5 px-1.5 text-xs font-bold"
            >
              {counts.total > 99 ? '99+' : counts.total}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Category counts */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {Object.entries(counts).map(([category, count]) => {
              if (category === 'total' || count === 0) return null;
              const Icon = categoryIcons[category as keyof typeof categoryIcons];
              return (
                <Button
                  key={category}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-7 text-xs gap-1",
                    categoryColors[category as keyof typeof categoryColors]
                  )}
                  onClick={() => markCategoryAsRead(category as any)}
                >
                  <Icon className="h-3 w-3" />
                  {category}: {count}
                  <Check className="h-3 w-3 ml-1" />
                </Button>
              );
            })}
          </div>
        </div>
        
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.slice(0, 10).map((notification) => {
                const Icon = categoryIcons[notification.category];
                return (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      "w-full p-3 text-left hover:bg-muted/50 transition-colors",
                      !notification.is_read && "bg-primary/5"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "p-2 rounded-full shrink-0",
                        categoryColors[notification.category]
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={cn(
                            "text-sm truncate",
                            !notification.is_read && "font-semibold"
                          )}>
                            {notification.title}
                          </p>
                          {!notification.is_read && (
                            <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default AdminNotificationBell;
