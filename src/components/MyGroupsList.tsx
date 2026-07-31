import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { SpiritualCard } from "@/components/SpiritualCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Users, Calendar, Crown, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import DeleteGroupDialog from "./DeleteGroupDialog";
import { logger } from "@/lib/logger";

interface Group {
  id: string;
  name: string;
  code: string;
  creator_id: string;
  created_at: string;
  group_type: string;
  is_active: boolean;
  member_count?: number;
}

const MyGroupsList = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteGroup, setDeleteGroup] = useState<Group | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUserGroups = async () => {
    if (!user) return;

    try {
      // Fetch groups where user is a member
      const { data: memberData, error: memberError } = await supabase
        .from('group_members')
        .select(`
          group_id,
          groups!inner (
            id,
            name,
            code,
            creator_id,
            created_at,
            group_type,
            is_active
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (memberError) throw memberError;

      // Get unique groups and filter active ones
      const uniqueGroups = new Map<string, Group>();
      
      memberData?.forEach((item: any) => {
        const group = item.groups;
        if (group && group.is_active && !uniqueGroups.has(group.id)) {
          uniqueGroups.set(group.id, group);
        }
      });

      // Fetch member counts for each group
      const groupsWithCounts = await Promise.all(
        Array.from(uniqueGroups.values()).map(async (group) => {
          const { count } = await supabase
            .from('group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id)
            .eq('is_active', true);

          return {
            ...group,
            member_count: count || 0
          };
        })
      );

      setGroups(groupsWithCounts);
    } catch (error) {
      logger.error('Error fetching groups:', error);
      toast({
        title: "Error",
        description: "Failed to load your groups",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserGroups();
  }, [user]);

  const handleDeleteGroup = async () => {
    if (!deleteGroup || !user) return;

    // Safety check: only creator can delete
    if (deleteGroup.creator_id !== user.id) {
      toast({
        title: "Not Authorized",
        description: "Only the group creator can delete this group",
        variant: "destructive"
      });
      setDeleteGroup(null);
      return;
    }

    setIsDeleting(true);

    try {
      // Step 1: Deactivate all group members
      const { error: membersError } = await supabase
        .from('group_members')
        .update({ is_active: false })
        .eq('group_id', deleteGroup.id);

      if (membersError) throw membersError;

      // Step 2: Deactivate the group (soft delete)
      const { error: groupError } = await supabase
        .from('groups')
        .update({ is_active: false })
        .eq('id', deleteGroup.id)
        .eq('creator_id', user.id); // Extra safety check

      if (groupError) throw groupError;

      // Update local state
      setGroups(groups.filter(g => g.id !== deleteGroup.id));

      toast({
        title: "Group Deleted",
        description: `"${deleteGroup.name}" has been successfully deleted`
      });
    } catch (error) {
      logger.error('Error deleting group:', error);
      toast({
        title: "Error",
        description: "Failed to delete the group. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setDeleteGroup(null);
    }
  };

  if (loading) {
    return (
      <SpiritualCard className="p-6">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading your groups...</span>
        </div>
      </SpiritualCard>
    );
  }

  if (groups.length === 0) {
    return (
      <SpiritualCard className="p-6 text-center">
        <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
        <h3 className="font-medium text-lg mb-1">No Groups Yet</h3>
        <p className="text-sm text-muted-foreground">
          Join or create a group to start your Girivalam journey together
        </p>
      </SpiritualCard>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {groups.map((group) => {
          const isCreator = group.creator_id === user?.id;
          
          return (
            <SpiritualCard key={group.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium truncate">{group.name}</h4>
                    {isCreator && (
                      <Badge variant="outline" className="text-xs bg-primary/10 border-primary/30 shrink-0">
                        <Crown className="h-3 w-3 mr-1" />
                        Owner
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {group.member_count} members
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(group.created_at), 'MMM d, yyyy')}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {group.group_type === 'private' ? '🔒 Private' : '🌐 Public'}
                    </Badge>
                  </div>
                </div>

                {isCreator && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteGroup(group)}
                    aria-label="Delete group"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </SpiritualCard>
          );
        })}
      </div>

      <DeleteGroupDialog
        open={!!deleteGroup}
        onOpenChange={(open) => !open && setDeleteGroup(null)}
        groupName={deleteGroup?.name || ""}
        onConfirm={handleDeleteGroup}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default MyGroupsList;
