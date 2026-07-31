import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from "@/lib/logger";

interface AutoJoinState {
  isProcessing: boolean;
  pendingGroupCode: string | null;
  pendingGroupPassword: string | null;
}

export const useGroupAutoJoin = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [state, setState] = useState<AutoJoinState>({
    isProcessing: false,
    pendingGroupCode: null,
    pendingGroupPassword: null,
  });

  // Extract group join parameters from URL
  const groupCode = searchParams.get('join');
  const groupPassword = searchParams.get('pwd');

  useEffect(() => {
    if (!groupCode) return;

    // If user is not logged in, store the join code and redirect to auth
    if (!user) {
      // Store pending join info in sessionStorage for after login
      sessionStorage.setItem('pendingGroupJoin', JSON.stringify({
        code: groupCode,
        password: groupPassword || null,
      }));
      navigate('/auth?redirect=/girivalam-map&mode=group');
      return;
    }

    // User is logged in, process auto-join
    handleAutoJoin(groupCode, groupPassword);
  }, [groupCode, user]);

  // Check for pending join after login
  useEffect(() => {
    if (!user) return;

    const pendingJoin = sessionStorage.getItem('pendingGroupJoin');
    if (pendingJoin) {
      try {
        const { code, password } = JSON.parse(pendingJoin);
        sessionStorage.removeItem('pendingGroupJoin');
        handleAutoJoin(code, password);
      } catch (e) {
        logger.error('Failed to parse pending join:', e);
        sessionStorage.removeItem('pendingGroupJoin');
      }
    }
  }, [user]);

  const handleAutoJoin = async (code: string, password: string | null) => {
    if (!user) return;

    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      // Find group by code - using groups_public view to avoid exposing password_hash
      const { data: group, error: groupError } = await supabase
        .from('groups_public')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .maybeSingle();

      if (groupError) throw groupError;

      if (!group) {
        toast({
          title: 'Group Not Found',
          description: 'The group link may be invalid or expired.',
          variant: 'destructive',
        });
        clearUrlParams();
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
        toast({
          title: 'Already a Member! 🎉',
          description: `You're already in "${group.name}"`,
        });
        clearUrlParams();
        return;
      }

      // Handle private group password verification
      if (group.group_type === 'private') {
        if (!password) {
          setState(prev => ({
            ...prev,
            pendingGroupCode: code,
            isProcessing: false,
          }));
          toast({
            title: 'Password Required',
            description: 'This is a private group. Please enter the password.',
          });
          return;
        }

        // Verify password securely via edge function (PBKDF2)
        const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-group-password', {
          body: { groupId: group.id, password }
        });

        if (verifyError || !verifyData?.valid) {
          toast({
            title: 'Incorrect Password',
            description: 'The password for this private group is incorrect.',
            variant: 'destructive',
          });
          clearUrlParams();
          return;
        }
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
        description: `Welcome to "${group.name}"! Your location sharing is now active.`,
      });

      clearUrlParams();
      
      // Return group id for parent component to set as current
      return group.id;
    } catch (error) {
      logger.error('Auto-join error:', error);
      toast({
        title: 'Join Failed',
        description: 'Could not join the group. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const clearUrlParams = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('join');
    newParams.delete('pwd');
    setSearchParams(newParams, { replace: true });
  };

  const generateShareableLink = (groupCode: string, groupPassword?: string): string => {
    const baseUrl = window.location.origin;
    let link = `${baseUrl}/girivalam-map?mode=group&join=${groupCode}`;
    if (groupPassword) {
      // For private groups, we encode the password in the URL (should be shared carefully)
      link += `&pwd=${encodeURIComponent(groupPassword)}`;
    }
    return link;
  };

  const shareGroupLink = async (group: { code: string; name: string; group_type: string }, password?: string) => {
    const link = generateShareableLink(group.code, password);
    const shareText = `🙏 Join my Girivalam group "${group.name}"!\n\nClick to join: ${link}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${group.name} - Girivalam`,
          text: shareText,
          url: link,
        });
      } catch (err) {
        // User cancelled sharing or error
        await navigator.clipboard.writeText(link);
        toast({
          title: 'Link Copied!',
          description: 'Share link copied to clipboard',
        });
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      toast({
        title: 'Link Copied!',
        description: 'Share text copied to clipboard',
      });
    }
  };

  return {
    isProcessing: state.isProcessing,
    pendingGroupCode: state.pendingGroupCode,
    generateShareableLink,
    shareGroupLink,
  };
};
