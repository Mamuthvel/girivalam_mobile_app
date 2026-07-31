import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Users, User, Clock, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SpiritualCard } from "@/components/SpiritualCard";
import SiteHeader from "@/components/SiteHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

interface GroupDetails {
  id: string;
  name: string;
  code: string;
  creator_id: string;
  description?: string;
  group_type: 'public' | 'private';
  created_at: string;
  member_count?: number;
  creator_name?: string;
}

const JoinGroup = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const groupId = searchParams.get('groupId');
  const groupCode = searchParams.get('code');
  const password = searchParams.get('pwd');

  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch group details
  useEffect(() => {
    const fetchGroupDetails = async () => {
      if (!groupId && !groupCode) {
        setError("Invalid invite link");
        setLoading(false);
        return;
      }

      try {
        // Query the groups_public view
        let query = supabase
          .from('groups_public')
          .select('*')
          .eq('is_active', true);

        if (groupId) {
          query = query.eq('id', groupId);
        } else if (groupCode) {
          query = query.eq('code', groupCode.toUpperCase());
        }

        const { data: groupData, error: groupError } = await query.maybeSingle();

        if (groupError) throw groupError;

        if (!groupData) {
          setError("Group not found or no longer active");
          setLoading(false);
          return;
        }

        // Get member count
        const { count: memberCount } = await supabase
          .from('group_members')
          .select('*', { count: 'exact', head: true })
          .eq('group_id', groupData.id)
          .eq('is_active', true);

        // Get creator name
        const { data: creatorProfile } = await supabase
          .from('profiles')
          .select('display_name, email')
          .eq('user_id', groupData.creator_id)
          .maybeSingle();

        setGroup({
          ...groupData,
          member_count: memberCount || 0,
          creator_name: creatorProfile?.display_name || creatorProfile?.email?.split('@')[0] || 'Anonymous',
        } as GroupDetails);
      } catch (err) {
        logger.error('Error fetching group:', err);
        setError("Failed to load group details");
      } finally {
        setLoading(false);
      }
    };

    fetchGroupDetails();
  }, [groupId, groupCode]);

  // Handle join button click
  const handleJoin = async () => {
    if (!user) {
      // Store pending join info and redirect to auth
      const joinParams = new URLSearchParams();
      if (groupId) joinParams.set('groupId', groupId);
      if (groupCode) joinParams.set('code', groupCode);
      if (password) joinParams.set('pwd', password);

      sessionStorage.setItem('pendingGroupJoin', JSON.stringify({
        groupId: groupId || null,
        code: groupCode || null,
        password: password || null,
      }));

      navigate(`/auth?redirect=/join?${joinParams.toString()}`);
      return;
    }

    if (!group) return;

    setJoining(true);

    try {
      // Check if already a member
      const { data: existingMember } = await supabase
        .from('group_members')
        .select('id, is_active')
        .eq('group_id', group.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingMember?.is_active) {
        toast({
          title: "Already a Member! 🎉",
          description: `You're already in "${group.name}"`,
        });
        navigate(`/girivalam-map?mode=group&groupId=${group.id}`);
        return;
      }

      // Handle private group password verification
      if (group.group_type === 'private' && password) {
        const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-group-password', {
          body: { groupId: group.id, password }
        });

        if (verifyError || !verifyData?.valid) {
          toast({
            title: 'Incorrect Password',
            description: 'The password for this private group is incorrect.',
            variant: 'destructive',
          });
          setJoining(false);
          return;
        }
      } else if (group.group_type === 'private' && !password) {
        toast({
          title: 'Password Required',
          description: 'This is a private group. Please use a valid invite link.',
          variant: 'destructive',
        });
        setJoining(false);
        return;
      }

      // Join the group
      if (existingMember && !existingMember.is_active) {
        await supabase
          .from('group_members')
          .update({
            is_active: true,
            location_sharing_enabled: true,
            location_sharing_consented_at: new Date().toISOString()
          })
          .eq('id', existingMember.id);
      } else {
        await supabase
          .from('group_members')
          .insert({
            group_id: group.id,
            user_id: user.id,
            location_sharing_enabled: true,
            location_sharing_consented_at: new Date().toISOString()
          });
      }

      toast({
        title: 'Joined Successfully! 🎉',
        description: `Welcome to "${group.name}"!`,
      });

      // Navigate to group map
      navigate(`/girivalam-map?mode=group&groupId=${group.id}`);

    } catch (err) {
      logger.error('Join error:', err);
      toast({
        title: 'Join Failed',
        description: 'Could not join the group. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setJoining(false);
    }
  };

  // Check for pending join after login
  useEffect(() => {
    if (!user) return;

    const pendingJoin = sessionStorage.getItem('pendingGroupJoin');
    if (pendingJoin && group) {
      sessionStorage.removeItem('pendingGroupJoin');
      // Auto-join after login
      handleJoin();
    }
  }, [user, group]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
        <SiteHeader />
        <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading group details...</p>
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
        <SiteHeader />
        <div className="container mx-auto px-4 py-16 max-w-md">
          <SpiritualCard className="text-center p-8">
            <div className="text-6xl mb-4">🙏</div>
            <h1 className="font-playfair text-2xl font-bold mb-2">Oops!</h1>
            <p className="text-muted-foreground mb-6">{error || "Group not found"}</p>
            <Button onClick={() => navigate('/')} variant="outline">
              Go Home
            </Button>
          </SpiritualCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <SiteHeader />

      <div className="container mx-auto px-4 py-8 max-w-md">
        {/* Invite Card */}
        <SpiritualCard className="text-center p-8">
          {/* Sacred Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="h-10 w-10 text-primary" />
            </div>
          </div>

          {/* Invitation Message */}
          <p className="text-sm text-muted-foreground mb-2">You are invited to join</p>
          
          {/* Group Name */}
          <h1 className="font-playfair text-2xl md:text-3xl font-bold mb-6 text-primary">
            {group.name}
          </h1>

          {/* Group Details */}
          <div className="space-y-3 mb-8">
            {/* Creator */}
            <div className="flex items-center justify-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Created by</span>
              <span className="font-medium">{group.creator_name}</span>
            </div>

            {/* Member Count */}
            <div className="flex items-center justify-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{group.member_count}</span>
              <span className="text-muted-foreground">
                {group.member_count === 1 ? 'devotee' : 'devotees'} walking
              </span>
            </div>

            {/* Created Time */}
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                Started {new Date(group.created_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>

            {/* Description */}
            {group.description && (
              <p className="text-sm text-muted-foreground italic mt-4">
                "{group.description}"
              </p>
            )}
          </div>

          {/* Join Button */}
          <Button
            onClick={handleJoin}
            disabled={joining}
            className="w-full h-14 text-lg bg-primary hover:bg-primary/90 shadow-lg"
            size="lg"
          >
            {joining ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Joining...
              </>
            ) : (
              <>
                🙏 Join Group
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>

          {/* Login hint */}
          {!user && (
            <p className="text-xs text-muted-foreground mt-4">
              You'll be asked to sign in first
            </p>
          )}
        </SpiritualCard>

        {/* Sacred Quote */}
        <div className="text-center mt-6 p-4">
          <p className="text-sm text-muted-foreground italic">
            "Many feet, one sacred path"
          </p>
          <p className="text-xs text-primary mt-1">🕉️ Om Arunachaleswaraya Namaha</p>
        </div>
      </div>
    </div>
  );
};

export default JoinGroup;
