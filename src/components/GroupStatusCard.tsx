import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Play, 
  Pause, 
  CheckCircle, 
  MapPin, 
  Crown,
  Navigation,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

interface GroupMember {
  user_id: string;
  display_name?: string;
  distance_km: number;
  steps_count: number;
  is_guide?: boolean;
  latitude?: number;
  longitude?: number;
}

interface GroupStatusCardProps {
  groupName: string;
  groupStatus: 'waiting' | 'active' | 'paused' | 'completed';
  memberCount: number;
  guideInfo?: {
    name: string;
    distance_from_user?: number; // in meters
    user_id: string;
  };
  currentLinga?: string;
  progress: number; // 0-100
  distanceCovered: number; // in km
  onToggleStatus?: () => void;
  isGuide?: boolean;
  isOffPath?: boolean;
  isLeftBehind?: boolean;
}

const GroupStatusCard: React.FC<GroupStatusCardProps> = ({
  groupName,
  groupStatus,
  memberCount,
  guideInfo,
  currentLinga,
  progress,
  distanceCovered,
  onToggleStatus,
  isGuide = false,
  isOffPath = false,
  isLeftBehind = false,
}) => {
  const { t } = useLanguage();

  const getStatusConfig = () => {
    switch (groupStatus) {
      case 'waiting':
        return { 
          color: 'bg-amber-500', 
          text: t('group.statusWaiting'), 
          icon: Users,
          textColor: 'text-amber-600'
        };
      case 'active':
        return { 
          color: 'bg-green-500', 
          text: t('group.statusActive'), 
          icon: Play,
          textColor: 'text-green-600'
        };
      case 'paused':
        return { 
          color: 'bg-orange-500', 
          text: t('group.statusPaused'), 
          icon: Pause,
          textColor: 'text-orange-600'
        };
      case 'completed':
        return { 
          color: 'bg-primary', 
          text: t('group.statusCompleted'), 
          icon: CheckCircle,
          textColor: 'text-primary'
        };
      default:
        return { 
          color: 'bg-muted', 
          text: t('group.statusUnknown'), 
          icon: Users,
          textColor: 'text-muted-foreground'
        };
    }
  };

  const status = getStatusConfig();
  const StatusIcon = status.icon;

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background overflow-hidden">
        <CardContent className="p-4 space-y-4">
          {/* Header with Group Name and Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg truncate max-w-[180px]">{groupName}</h3>
            </div>
            <Badge className={`${status.color} text-white flex items-center gap-1`}>
              <StatusIcon className="h-3 w-3" />
              {status.text}
            </Badge>
          </div>

          {/* Warning Alerts */}
          {(isOffPath || isLeftBehind) && (
            <div className="space-y-2">
              {isOffPath && (
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg"
                >
                  <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                  <span className="text-sm text-amber-700 dark:text-amber-400">
                    {t('group.offPathWarning')}
                  </span>
                </motion.div>
              )}
              {isLeftBehind && guideInfo && (
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/30 rounded-lg"
                >
                  <Navigation className="h-4 w-4 text-red-500 flex-shrink-0" />
                  <span className="text-sm text-red-700 dark:text-red-400">
                    {t('group.leftBehindWarning')}
                  </span>
                </motion.div>
              )}
            </div>
          )}

          {/* Guide Info (for non-guides) */}
          {guideInfo && !isGuide && (
            <div className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-secondary rounded-full">
                  <Crown className="h-4 w-4 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('group.mandiray')}</p>
                  <p className="font-medium text-sm">{guideInfo.name}</p>
                </div>
              </div>
              {guideInfo.distance_from_user !== undefined && (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{t('group.distanceFromGuide')}</p>
                  <p className="font-semibold text-primary">
                    {formatDistance(guideInfo.distance_from_user)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Guide Badge (for guides) */}
          {isGuide && (
            <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-secondary/20 to-secondary/5 rounded-lg border border-secondary/30">
              <Crown className="h-5 w-5 text-secondary" />
              <span className="font-medium text-secondary">{t('group.youAreMandiray')}</span>
            </div>
          )}

          {/* Progress Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t('group.girivalamProgress')}</span>
              <span className="font-semibold">{progress.toFixed(1)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{distanceCovered.toFixed(1)} km</span>
              <span>14 km</span>
            </div>
          </div>

          {/* Current Linga */}
          {currentLinga && (
            <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-sm">
                <span className="text-muted-foreground">{t('group.currentLinga')}:</span>{' '}
                <span className="font-medium">{currentLinga}</span>
              </span>
            </div>
          )}

          {/* Member Count */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{memberCount} {t('group.members')}</span>
            </div>
            
            {/* Guide Controls */}
            {isGuide && groupStatus !== 'completed' && onToggleStatus && (
              <Button
                size="sm"
                variant={groupStatus === 'active' ? 'outline' : 'default'}
                onClick={onToggleStatus}
                className="text-xs"
              >
                {groupStatus === 'active' ? (
                  <>
                    <Pause className="h-3 w-3 mr-1" />
                    {t('group.pauseJourney')}
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3 mr-1" />
                    {t('group.startJourney')}
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default GroupStatusCard;
