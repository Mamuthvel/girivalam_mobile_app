import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Users, Plus, UserPlus, Copy, MapPin, Clock, Footprints, Share, AlertCircle, Loader2, CheckCircle, MessageCircle, Lock, Globe, Link2, Crown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GroupChat from "@/components/GroupChat";
import LiveGroupMap from "@/components/LiveGroupMap";
import { LocationSharingDialog } from "@/components/LocationSharingDialog";
import GroupStatusCard from "@/components/GroupStatusCard";
import SafetyAlertButton from "@/components/SafetyAlertButton";
import { useGroupAutoJoin } from "@/hooks/useGroupAutoJoin";
import { logger } from "@/lib/logger";

interface Group {
  id: string;
  name: string;
  code: string;
  creator_id: string;
  description?: string;
  created_at: string;
  member_count?: number;
  group_type: 'public' | 'private';
  password_hash?: string;
}

interface GroupMember {
  id: string;
  user_id: string;
  steps_count: number;
  distance_km: number;
  tracking_started_at: string | null;
  profiles?: {
    display_name: string | null;
    email: string;
  } | null;
}

interface GroupManagementProps {
  onGroupJoined?: (groupId: string) => void;
  currentGroup?: Group | null;
  userLocation?: { lat: number; lng: number };
  isTracking?: boolean;
}

export const GroupManagement: React.FC<GroupManagementProps> = ({ 
  onGroupJoined, 
  currentGroup, 
  userLocation = { lat: 12.2307, lng: 79.0628 }, 
  isTracking = false 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { shareGroupLink, isProcessing: autoJoinProcessing } = useGroupAutoJoin();
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingGroups, setFetchingGroups] = useState(true);
  const [fetchingMembers, setFetchingMembers] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [errors, setErrors] = useState<{create?: string; join?: string; fetch?: string}>({});

  // Form states
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [newGroupType, setNewGroupType] = useState<'public' | 'private'>('public');
  const [newGroupPassword, setNewGroupPassword] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [selectedGroupForJoin, setSelectedGroupForJoin] = useState<Group | null>(null);
  
  // Location sharing state
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [pendingGroupId, setPendingGroupId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserGroups();
    } else {
      setFetchingGroups(false);
    }
  }, [user]);

  useEffect(() => {
    if (currentGroup) {
      fetchGroupMembers(currentGroup.id);
    }
  }, [currentGroup]);

  const fetchUserGroups = async () => {
    if (!user) return;
    
    setFetchingGroups(true);
    setErrors(prev => ({ ...prev, fetch: undefined }));
    
    try {
      const { data: memberGroups, error } = await supabase
        .from('group_members')
        .select(`
          groups (
            id,
            name,
            code,
            creator_id,
            description,
            created_at,
            group_type,
            password_hash
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;

      const formattedGroups = memberGroups?.map(mg => mg.groups).filter(Boolean).map(group => ({
        ...group,
        group_type: group.group_type as 'public' | 'private'
      })) as Group[] || [];
      setGroups(formattedGroups);
    } catch (error) {
      logger.error('Error fetching groups:', error);
      setErrors(prev => ({ ...prev, fetch: 'Failed to load your groups. Please try again.' }));
      toast({
        title: "Error",
        description: "Failed to fetch your groups",
        variant: "destructive",
      });
    } finally {
      setFetchingGroups(false);
    }
  };

  const fetchGroupMembers = async (groupId: string) => {
    setFetchingMembers(true);
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          id,
          user_id,
          steps_count,
          distance_km,
          tracking_started_at
        `)
        .eq('group_id', groupId)
        .eq('is_active', true);

      if (error) throw error;

      // Fetch profiles separately
      const membersWithProfiles = await Promise.all(
        (data || []).map(async (member) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, email')
            .eq('user_id', member.user_id)
            .maybeSingle();

          return {
            ...member,
            profiles: profile
          };
        })
      );

      setGroupMembers(membersWithProfiles);
    } catch (error) {
      logger.error('Error fetching group members:', error);
      toast({
        title: "Warning",
        description: "Could not load all group member details",
        variant: "destructive",
      });
    } finally {
      setFetchingMembers(false);
    }
  };

  const createGroup = async () => {
    if (!user || !newGroupName.trim()) {
      setErrors(prev => ({ ...prev, create: 'Group name is required' }));
      return;
    }

    if (newGroupName.trim().length < 3) {
      setErrors(prev => ({ ...prev, create: 'Group name must be at least 3 characters' }));
      return;
    }

    if (newGroupType === 'private' && !newGroupPassword.trim()) {
      setErrors(prev => ({ ...prev, create: 'Password is required for private groups' }));
      return;
    }

    if (newGroupType === 'private' && newGroupPassword.length < 4) {
      setErrors(prev => ({ ...prev, create: 'Password must be at least 4 characters' }));
      return;
    }

    setLoading(true);
    setErrors(prev => ({ ...prev, create: undefined }));
    
    try {
      // Generate group code
      const { data: codeData, error: codeError } = await supabase
        .rpc('generate_group_code');

      if (codeError) throw new Error(`Failed to generate group code: ${codeError.message}`);

      // Hash password securely via edge function if private group
      let passwordHash = null;
      if (newGroupType === 'private') {
        // Use server-side PBKDF2 hashing for security
        const { data: hashData, error: hashError } = await supabase.functions.invoke('hash-group-password', {
          body: { password: newGroupPassword }
        });
        
        if (hashError || !hashData?.passwordHash) {
          throw new Error('Failed to securely hash password');
        }
        passwordHash = hashData.passwordHash;
      }

      // Create group
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: newGroupName.trim(),
          code: codeData,
          creator_id: user.id,
          description: newGroupDescription.trim() || null,
          group_type: newGroupType,
          password_hash: passwordHash
        })
        .select()
        .single();

      if (groupError) throw new Error(`Failed to create group: ${groupError.message}`);

      // Join the creator to the group
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          user_id: user.id
        });

      if (memberError) throw new Error(`Failed to join group: ${memberError.message}`);

      // Reset form and close dialog
      setNewGroupName('');
      setNewGroupDescription('');
      setNewGroupType('public');
      setNewGroupPassword('');
      setCreateDialogOpen(false);
      
      // Refresh data
      await fetchUserGroups();
      onGroupJoined?.(group.id);

      const groupTypeText = newGroupType === 'private' ? 'Private' : 'Public';
      toast({
        title: "Group Created! 🎉",
        description: `${groupTypeText} group "${group.name}" created with code: ${group.code}`,
      });
    } catch (error) {
      logger.error('Error creating group:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setErrors(prev => ({ ...prev, create: errorMessage }));
      toast({
        title: "Error",
        description: "Failed to create group. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const joinGroupStep1 = async () => {
    if (!user || !joinCode.trim()) {
      setErrors(prev => ({ ...prev, join: 'Group code is required' }));
      return;
    }

    if (joinCode.trim().length !== 6) {
      setErrors(prev => ({ ...prev, join: 'Group code must be 6 characters' }));
      return;
    }

    setLoading(true);
    setErrors(prev => ({ ...prev, join: undefined }));
    
    try {
      // Find group by code - using groups_public view to avoid exposing password_hash
      const { data: group, error: groupError } = await supabase
        .from('groups_public')
        .select('*')
        .eq('code', joinCode.trim().toUpperCase())
        .eq('is_active', true)
        .maybeSingle();

      if (groupError) throw new Error(`Database error: ${groupError.message}`);
      
      if (!group) {
        setErrors(prev => ({ ...prev, join: 'Invalid group code. Please check and try again.' }));
        return;
      }

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('group_members')
        .select('id, is_active')
        .eq('group_id', group.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingMember?.is_active) {
        setErrors(prev => ({ ...prev, join: 'You are already a member of this group' }));
        return;
      }

      // If public group, join directly
      if (group.group_type === 'public') {
        await joinGroupStep2({ ...group, group_type: group.group_type as 'public' | 'private' });
        return;
      }

      // If private group, show password field
      setSelectedGroupForJoin({ ...group, group_type: group.group_type as 'public' | 'private' });
    } catch (error) {
      logger.error('Error finding group:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setErrors(prev => ({ ...prev, join: errorMessage }));
    } finally {
      setLoading(false);
    }
  };

  const joinGroupStep2 = async (group: Group) => {
    if (!user) return;

    setLoading(true);
    setErrors(prev => ({ ...prev, join: undefined }));

    try {
      // For private groups, verify password
      if (group.group_type === 'private') {
        if (!joinPassword.trim()) {
          setErrors(prev => ({ ...prev, join: 'Password is required for private groups' }));
          return;
        }

        // Send password directly to edge function for secure verification (PBKDF2)
        const { data: verifyData, error } = await supabase.functions.invoke('verify-group-password', {
          body: {
            groupId: group.id,
            password: joinPassword
          }
        });

        if (error) throw new Error(`Password verification failed: ${error.message}`);
        
        if (!verifyData.valid) {
          setErrors(prev => ({ ...prev, join: 'Incorrect password for this private group' }));
          return;
        }
      }

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('group_members')
        .select('id, is_active')
        .eq('group_id', group.id)
        .eq('user_id', user.id)
        .maybeSingle();

      // Join group or reactivate membership
      if (existingMember && !existingMember.is_active) {
        // Reactivate existing membership
        const { error: updateError } = await supabase
          .from('group_members')
          .update({ is_active: true })
          .eq('id', existingMember.id);

        if (updateError) throw new Error(`Failed to rejoin group: ${updateError.message}`);
      } else if (!existingMember) {
        // Create new membership
        const { error: joinError } = await supabase
          .from('group_members')
          .insert({
            group_id: group.id,
            user_id: user.id
          });

        if (joinError) throw new Error(`Failed to join group: ${joinError.message}`);
      }

      // Reset form and close dialog
      setJoinCode('');
      setJoinPassword('');
      setSelectedGroupForJoin(null);
      setJoinDialogOpen(false);
      
      // Refresh data
      await fetchUserGroups();
      onGroupJoined?.(group.id);

      const groupTypeText = group.group_type === 'private' ? 'private' : 'public';
      toast({
        title: "Joined Group! 🎉",
        description: `Welcome to ${groupTypeText} group "${group.name}"`,
      });
      
      // Show location sharing dialog
      setPendingGroupId(group.id);
      setShowLocationDialog(true);
    } catch (error) {
      logger.error('Error joining group:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setErrors(prev => ({ ...prev, join: errorMessage }));
      toast({
        title: "Error",
        description: "Failed to join group. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyGroupCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: t('group.linkCopied'),
      description: "Group code copied to clipboard",
    });
  };

  const handleShareGroup = (group: Group) => {
    shareGroupLink({ 
      code: group.code, 
      name: group.name, 
      group_type: group.group_type 
    });
  };

  const isGuide = (group: Group) => group.creator_id === user?.id;

  const handleLocationSharingAccept = async () => {
    if (!user || !pendingGroupId) return;
    
    try {
      const { error } = await supabase
        .from('group_members')
        .update({
          location_sharing_enabled: true,
          location_sharing_consented_at: new Date().toISOString()
        } as any)
        .eq('group_id', pendingGroupId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Location Sharing Enabled",
        description: "Your location will be visible to group members when tracking",
      });
    } catch (error) {
      logger.error('Error enabling location sharing:', error);
      toast({
        title: "Error",
        description: "Failed to enable location sharing",
        variant: "destructive",
      });
    } finally {
      setShowLocationDialog(false);
      setPendingGroupId(null);
    }
  };

  const handleLocationSharingDecline = () => {
    setShowLocationDialog(false);
    setPendingGroupId(null);
    toast({
      title: "Location Sharing Disabled",
      description: "You can enable it later from group settings",
    });
  };

  // Show loading state while initializing
  if (fetchingGroups && groups.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading groups...</span>
      </div>
    );
  }

  // Show auth required message if no user
  if (!user) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please sign in to create or join groups.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Error Alert */}
      {errors.fetch && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">{errors.fetch}</AlertDescription>
        </Alert>
      )}

      {/* Group Actions - Responsive */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex-1 min-h-[44px] text-sm sm:text-base">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Create New Group</span>
              <span className="sm:hidden">Create Group</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Create Girivalam Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              {errors.create && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.create}</AlertDescription>
                </Alert>
              )}
              
              <div>
                <Label htmlFor="groupName">Group Name *</Label>
                <Input
                  id="groupName"
                  value={newGroupName}
                  onChange={(e) => {
                    setNewGroupName(e.target.value);
                    if (errors.create) setErrors(prev => ({ ...prev, create: undefined }));
                  }}
                  placeholder="e.g., Morning Devotees"
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {newGroupName.length}/50 characters
                </p>
              </div>
              
              <div>
                <Label htmlFor="groupDescription">Description (Optional)</Label>
                <Textarea
                  id="groupDescription"
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  placeholder="Describe your group's purpose or schedule..."
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {newGroupDescription.length}/200 characters
                </p>
              </div>

              <div>
                <Label>Group Type</Label>
                <RadioGroup value={newGroupType} onValueChange={(value: 'public' | 'private') => setNewGroupType(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="public" id="public" />
                    <Label htmlFor="public" className="flex items-center gap-2 cursor-pointer">
                      <Globe className="h-4 w-4" />
                      Public - Anyone can join with the code
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="private" id="private" />
                    <Label htmlFor="private" className="flex items-center gap-2 cursor-pointer">
                      <Lock className="h-4 w-4" />
                      Private - Requires password to join
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {newGroupType === 'private' && (
                <div>
                  <Label htmlFor="groupPassword">Group Password *</Label>
                  <Input
                    id="groupPassword"
                    type="password"
                    value={newGroupPassword}
                    onChange={(e) => setNewGroupPassword(e.target.value)}
                    placeholder="Enter password for your private group"
                    maxLength={50}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Password must be at least 4 characters
                  </p>
                </div>
              )}
              
              <Button 
                onClick={createGroup} 
                disabled={loading || !newGroupName.trim() || newGroupName.trim().length < 3 || (newGroupType === 'private' && (!newGroupPassword.trim() || newGroupPassword.length < 4))}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Create Group
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex-1 min-h-[44px] text-sm sm:text-base">
              <UserPlus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Join Group</span>
              <span className="sm:hidden">Join</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Join Existing Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              {errors.join && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.join}</AlertDescription>
                </Alert>
              )}
              
              {!selectedGroupForJoin ? (
                <>
                  <div>
                    <Label htmlFor="joinCode">Group Code *</Label>
                    <Input
                      id="joinCode"
                      value={joinCode}
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                        setJoinCode(value);
                        if (errors.join) setErrors(prev => ({ ...prev, join: undefined }));
                      }}
                      placeholder="Enter 6-digit group code"
                      maxLength={6}
                      className="text-center text-lg font-mono tracking-widest"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Ask your group creator for the 6-character code
                    </p>
                  </div>
                  
                  <Button 
                    onClick={joinGroupStep1} 
                    disabled={loading || !joinCode.trim() || joinCode.length !== 6}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Finding Group...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Find Group
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {selectedGroupForJoin.group_type === 'private' ? (
                        <Lock className="h-4 w-4 text-orange-500" />
                      ) : (
                        <Globe className="h-4 w-4 text-green-500" />
                      )}
                      <span className="font-medium">{selectedGroupForJoin.name}</span>
                      <Badge variant={selectedGroupForJoin.group_type === 'private' ? 'destructive' : 'default'}>
                        {selectedGroupForJoin.group_type}
                      </Badge>
                    </div>
                    {selectedGroupForJoin.description && (
                      <p className="text-sm text-muted-foreground">{selectedGroupForJoin.description}</p>
                    )}
                  </div>

                  {selectedGroupForJoin.group_type === 'private' && (
                    <div>
                      <Label htmlFor="joinPassword">Group Password *</Label>
                      <Input
                        id="joinPassword"
                        type="password"
                        value={joinPassword}
                        onChange={(e) => {
                          setJoinPassword(e.target.value);
                          if (errors.join) setErrors(prev => ({ ...prev, join: undefined }));
                        }}
                        placeholder="Enter group password"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        This is a private group. Ask the creator for the password.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setSelectedGroupForJoin(null);
                        setJoinPassword('');
                        setErrors(prev => ({ ...prev, join: undefined }));
                      }}
                      className="w-full"
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={() => joinGroupStep2(selectedGroupForJoin)} 
                      disabled={loading || (selectedGroupForJoin.group_type === 'private' && !joinPassword.trim())}
                      className="w-full"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Joining...
                        </>
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Join Group
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Current Group Details with Live Features */}
      {currentGroup && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 sm:justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 flex-shrink-0" />
                <span className="truncate font-semibold text-base sm:text-lg">{currentGroup.name}</span>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyGroupCode(currentGroup.code)}
                  className="text-xs px-2 py-1 h-8"
                >
                  <Copy className="mr-1 h-3 w-3" />
                  <span className="font-mono">{currentGroup.code}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShareGroup(currentGroup)}
                  className="px-2 py-1 h-8 gap-1"
                >
                  <Link2 className="h-3 w-3" />
                  <span className="hidden sm:inline text-xs">{t('group.shareLink')}</span>
                </Button>
                {isGuide(currentGroup) && (
                  <Badge variant="secondary" className="gap-1">
                    <Crown className="h-3 w-3" />
                    <span className="hidden sm:inline">{t('group.mandiray')}</span>
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentGroup.description && (
              <p className="text-sm text-muted-foreground mb-4">{currentGroup.description}</p>
            )}
            
            {/* Group Activity Tabs */}
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-10 sm:h-12">
                <TabsTrigger value="info" className="text-xs sm:text-sm px-1 sm:px-3">
                  <span className="hidden sm:inline">📊 Info</span>
                  <span className="sm:hidden">📊</span>
                </TabsTrigger>
                <TabsTrigger value="map" className="text-xs sm:text-sm px-1 sm:px-3">
                  <span className="hidden sm:inline">🗺️ Live Map</span>
                  <span className="sm:hidden">🗺️</span>
                </TabsTrigger>
                <TabsTrigger value="chat" className="text-xs sm:text-sm px-1 sm:px-3">
                  <span className="hidden sm:inline">💬 Chat</span>
                  <span className="sm:hidden">💬</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
                  <div className="text-center p-3 sm:p-4 bg-primary/5 rounded-lg">
                    <p className="text-xl sm:text-2xl font-bold text-primary">{groupMembers.length}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Active Members</p>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-accent/5 rounded-lg">
                    <p className="text-xl sm:text-2xl font-bold text-accent">
                      {groupMembers.reduce((sum, member) => sum + (member.steps_count || 0), 0).toLocaleString()}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Total Steps</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm sm:text-base">Group Members:</h4>
                  {fetchingMembers ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-14 sm:h-12 w-full" />
                      ))}
                    </div>
                  ) : groupMembers.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {groupMembers.map((member) => (
                        <div key={member.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-muted/30 rounded-lg gap-2 sm:gap-0">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0"></div>
                            <span className="font-medium text-sm truncate max-w-32 sm:max-w-none">
                              {member.profiles?.display_name || member.profiles?.email?.split('@')[0] || 'Anonymous'}
                            </span>
                            {member.user_id === currentGroup.creator_id && (
                              <Badge variant="outline" className="text-xs flex-shrink-0">Creator</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground ml-4 sm:ml-0">
                            <div className="flex items-center gap-1">
                              <Footprints className="h-3 w-3" />
                              <span>{(member.steps_count || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{(member.distance_km || 0).toFixed(1)}km</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No members found</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="map" className="space-y-4 mt-4">
                <div className="h-[250px] sm:h-[300px] md:h-[400px] w-full rounded-lg overflow-hidden bg-muted/20">
                  <LiveGroupMap 
                    groupId={currentGroup.id}
                    userLocation={userLocation}
                    isTracking={isTracking}
                    className="h-full w-full"
                  />
                </div>
                <div className="text-center text-xs sm:text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3 inline mr-1" />
                  Live locations of group members during tracking
                </div>
              </TabsContent>
              
              <TabsContent value="chat" className="space-y-4 mt-4">
                <div className="h-[300px] sm:h-[400px] md:h-[450px] overflow-hidden rounded-lg border">
                  <GroupChat 
                    groupId={currentGroup.id}
                    groupName={currentGroup.name}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* My Groups List */}
      {fetchingGroups ? (
        <Card>
          <CardHeader>
            <CardTitle>My Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : groups.length > 0 ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg sm:text-xl">My Groups ({groups.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {groups.map((group) => (
                <div key={group.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg hover:bg-muted/30 transition-colors gap-3 sm:gap-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 sm:mb-1">
                      <h4 className="font-medium text-sm sm:text-base truncate">{group.name}</h4>
                      <Badge variant={group.group_type === 'private' ? 'destructive' : 'default'} className="text-xs flex-shrink-0">
                        {group.group_type === 'private' ? (
                          <>
                            <Lock className="h-3 w-3 mr-1" />
                            <span className="hidden sm:inline">Private</span>
                            <span className="sm:hidden">Private</span>
                          </>
                        ) : (
                          <>
                            <Globe className="h-3 w-3 mr-1" />
                            <span className="hidden sm:inline">Public</span>
                            <span className="sm:hidden">Private</span>
                          </>
                        )}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Code: <span className="font-mono">{group.code}</span>
                    </p>
                    {group.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 sm:truncate sm:max-w-md">
                        {group.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onGroupJoined?.(group.id)}
                      className="text-xs px-3 py-1 h-8"
                    >
                      {currentGroup?.id === group.id ? (
                        <>
                          <CheckCircle className="mr-1 h-3 w-3" />
                          <span className="hidden sm:inline">Current</span>
                          <span className="sm:hidden">Active</span>
                        </>
                      ) : (
                        <span className="text-xs">Switch</span>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShareGroup(group)}
                      className="px-2 py-1 h-8 gap-1"
                    >
                      <Link2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : !fetchingGroups && (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="font-medium mb-2">No Groups Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first group or join an existing one to get started
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => setCreateDialogOpen(true)} size="sm">
                <Plus className="mr-1 h-3 w-3" />
                Create
              </Button>
              <Button onClick={() => setJoinDialogOpen(true)} variant="outline" size="sm">
                <UserPlus className="mr-1 h-3 w-3" />
                Join
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Location Sharing Dialog */}
      <LocationSharingDialog
        open={showLocationDialog}
        onOpenChange={setShowLocationDialog}
        onAccept={handleLocationSharingAccept}
        onDecline={handleLocationSharingDecline}
        groupName={groups.find(g => g.id === pendingGroupId)?.name || 'this group'}
      />
    </div>
  );
};

export default GroupManagement;