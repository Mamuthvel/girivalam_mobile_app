import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Send, MapPin, Users, MessageCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { logger } from "@/lib/logger";

interface GroupChatProps {
  groupId: string;
  groupName: string;
}

interface Message {
  id: string;
  user_id: string;
  content: string;
  message_type: 'text' | 'location' | 'system';
  metadata: any;
  created_at: string;
  user_email?: string;
}

interface GroupMember {
  id: string;
  user_id: string;
  group_id: string;
  user_email?: string;
  online_at?: string;
  location?: { lat: number; lng: number };
  step_count?: number;
  distance_km?: number;
}

const GroupChat: React.FC<GroupChatProps> = ({ groupId, groupName }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [onlineMembers, setOnlineMembers] = useState<GroupMember[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data: messagesData, error } = await supabase
          .from('group_messages')
          .select('*')
          .eq('group_id', groupId)
          .order('created_at', { ascending: true })
          .limit(50);

        if (error) throw error;

        // Fetch user profiles separately
        const userIds = [...new Set(messagesData?.map(msg => msg.user_id) || [])];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, email')
          .in('user_id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p.email]) || []);

        const formattedMessages = messagesData?.map(msg => ({
          ...msg,
          user_email: profileMap.get(msg.user_id),
          message_type: msg.message_type as 'text' | 'location' | 'system'
        })) || [];

        setMessages(formattedMessages);
      } catch (error) {
        logger.error('Error fetching messages:', error);
        toast({
          title: "Error",
          description: "Failed to load chat messages",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [groupId]);

  // Real-time message subscription
  useEffect(() => {
    const channel = supabase
      .channel(`group_chat_${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=eq.${groupId}`
        },
        async (payload) => {
          // Fetch user email for the new message
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('user_id', payload.new.user_id)
            .single();

          const newMessage: Message = {
            id: payload.new.id,
            user_id: payload.new.user_id,
            content: payload.new.content,
            metadata: payload.new.metadata,
            created_at: payload.new.created_at,
            user_email: profile?.email,
            message_type: payload.new.message_type as 'text' | 'location' | 'system'
          };

          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId]);

  // Real-time presence tracking
  useEffect(() => {
    if (!user) return;

    const presenceChannel = supabase
      .channel(`group_presence_${groupId}`)
      .on('presence', { event: 'sync' }, () => {
        const presenceState = presenceChannel.presenceState();
        const members = Object.values(presenceState).flat().map((member: any) => ({
          id: member.user_id,
          user_id: member.user_id,
          group_id: groupId,
          user_email: member.user_email,
          online_at: member.online_at
        })) as GroupMember[];
        setOnlineMembers(members);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        logger.log('Member joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        logger.log('Member left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user_id: user.id,
            user_email: user.email,
            online_at: new Date().toISOString(),
            group_id: groupId
          });
        }
      });

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [user, groupId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || sending) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('group_messages')
        .insert({
          group_id: groupId,
          user_id: user.id,
          content: newMessage.trim(),
          message_type: 'text'
        });

      if (error) throw error;

      setNewMessage('');
    } catch (error) {
      logger.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const sendLocationMessage = async (location: { lat: number; lng: number }) => {
    if (!user || sending) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('group_messages')
        .insert({
          group_id: groupId,
          user_id: user.id,
          content: `📍 Shared location`,
          message_type: 'location',
          metadata: { location }
        });

      if (error) throw error;

      toast({
        title: "Location shared! 📍",
        description: "Your location has been shared with the group",
      });
    } catch (error) {
      logger.error('Error sharing location:', error);
      toast({
        title: "Error",
        description: "Failed to share location",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          sendLocationMessage({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          toast({
            title: "Location Error",
            description: "Unable to get your location",
            variant: "destructive",
          });
        }
      );
    }
  };

  const renderMessage = (message: Message) => {
    const isOwn = message.user_id === user?.id;
    const displayName = message.user_email?.replace("@gmail.com", "") || 'Unknown';

    return (
      <div
        key={message.id}
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
          {!isOwn && (
            <p className="text-xs text-muted-foreground mb-1 px-1">
              {displayName}
            </p>
          )}
          <div
            className={`px-4 py-2 rounded-lg ${
              isOwn
                ? 'bg-primary text-primary-foreground ml-auto'
                : 'bg-muted'
            }`}
          >
            {message.message_type === 'location' ? (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{message.content}</span>
              </div>
            ) : (
              <p>{message.content}</p>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1 px-1">
            <Clock className="h-3 w-3 inline mr-1" />
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2">Loading chat...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[500px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            {groupName}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {onlineMembers.length} online
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-4 gap-4">
        {/* Messages */}
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-1">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map(renderMessage)
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message input */}
        <div className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            disabled={sending}
          />
          <Button
            onClick={handleShareLocation}
            variant="outline"
            size="sm"
            disabled={sending}
            title="Share location"
          >
            <MapPin className="h-4 w-4" />
          </Button>
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupChat;