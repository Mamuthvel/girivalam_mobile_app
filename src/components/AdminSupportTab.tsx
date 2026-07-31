import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, User, Phone, Clock, CheckCircle, Send } from "lucide-react";
import {
    getAllConversations,
    loadConversationMessages,
    sendAdminReply,
    markMessagesAsRead,
    updateConversationStatus,
    subscribeToAllMessages,
    getConversationUnreadCount,
    type Conversation,
    type SupportMessage
} from "@/utils/chatHelpers";

interface ConversationWithUnread extends Conversation {
    unreadCount: number;
}

const AdminSupportTab = () => {
    const [conversations, setConversations] = useState<ConversationWithUnread[]>([]);
    const [messages, setMessages] = useState<SupportMessage[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState("");
    const [userProfiles, setUserProfiles] = useState<Map<string, any>>(new Map());

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load conversations on mount
    useEffect(() => {
        loadConversations();
        loadUserProfiles();
    }, []);

    // Load messages when conversation selected
    useEffect(() => {
        if (selectedConversation) {
            loadMessages(selectedConversation);
        }
    }, [selectedConversation]);

    // Subscribe to new messages
    useEffect(() => {
        const channel = subscribeToAllMessages((newMsg) => {
            // Update message list if viewing this conversation
            if (selectedConversation === newMsg.conversation_id) {
                setMessages((prev) => [...prev, newMsg]);
            }

            // Refresh conversation list to update last_message_at and unread counts
            loadConversations();
        });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [selectedConversation]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Load all conversations with unread counts
    const loadConversations = async () => {
        const convos = await getAllConversations();
        
        // Get unread counts for each conversation
        const convosWithUnread: ConversationWithUnread[] = await Promise.all(
            convos.map(async (convo) => {
                const unreadCount = await getConversationUnreadCount(convo.id);
                return { ...convo, unreadCount };
            })
        );
        
        // Sort: open conversations with unread first, then by last_message_at
        convosWithUnread.sort((a, b) => {
            // Closed/resolved at bottom
            if ((a.status === 'closed' || a.status === 'resolved') && 
                (b.status !== 'closed' && b.status !== 'resolved')) return 1;
            if ((b.status === 'closed' || b.status === 'resolved') && 
                (a.status !== 'closed' && a.status !== 'resolved')) return -1;
            
            // Unread first
            if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
            if (b.unreadCount > 0 && a.unreadCount === 0) return 1;
            
            // Then by last message
            return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime();
        });
        
        setConversations(convosWithUnread);
    };

    // Load user profiles for display
    const loadUserProfiles = async () => {
        const { data } = await supabase
            .from("profiles")
            .select("user_id, email, display_name, mobile_number");

        if (data) {
            const profileMap = new Map();
            data.forEach(profile => {
                profileMap.set(profile.user_id, profile);
            });
            setUserProfiles(profileMap);
        }
    };

    // Load messages for selected conversation
    const loadMessages = async (conversationId: string) => {
        const msgs = await loadConversationMessages(conversationId);
        setMessages(msgs);

        // Mark user messages as read when admin views
        await markMessagesAsRead(conversationId, 'admin');
        
        // Refresh to update unread counts
        loadConversations();
    };

    // Send admin reply
    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation) return;

        const sent = await sendAdminReply(selectedConversation, newMessage.trim());

        if (sent) {
            setNewMessage("");
            loadConversations(); // Refresh to update status
        }
    };

    // Handle conversation selection
    const handleSelectConversation = (conversationId: string) => {
        setSelectedConversation(conversationId);
    };

    // Close conversation
    const handleCloseConversation = async (conversationId: string) => {
        await updateConversationStatus(conversationId, 'closed');
        loadConversations();
    };

    // Reopen conversation
    const handleReopenConversation = async (conversationId: string) => {
        await updateConversationStatus(conversationId, 'open');
        loadConversations();
    };

    // Get user display name
    const getUserDisplay = (userId: string) => {
        const profile = userProfiles.get(userId);
        return profile?.display_name || profile?.email?.split('@')[0] || `Guest_${userId.slice(-4)}`;
    };

    // Get user mobile
    const getUserMobile = (userId: string) => {
        const profile = userProfiles.get(userId);
        return profile?.mobile_number || 'Not shared';
    };

    // Get last message preview
    const getLastMessagePreview = (conversationId: string): string => {
        // Find from loaded messages if this is selected, otherwise show subject
        const convo = conversations.find(c => c.id === conversationId);
        return convo?.subject || 'New conversation';
    };

    // Format status badge
    const getStatusBadge = (status: Conversation['status']) => {
        const config = {
            open: { color: 'bg-green-500', icon: '🟢', label: 'Open' },
            replied: { color: 'bg-yellow-500', icon: '🟡', label: 'Replied' },
            in_progress: { color: 'bg-yellow-500', icon: '🟡', label: 'In Progress' },
            resolved: { color: 'bg-blue-500', icon: '🔵', label: 'Resolved' },
            closed: { color: 'bg-gray-500', icon: '🔴', label: 'Closed' }
        };
        return config[status] || config.open;
    };

    // Get time ago
    const getTimeAgo = (dateString: string): string => {
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    };

    const selectedConvo = conversations.find(c => c.id === selectedConversation);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">
            {/* CONVERSATION INBOX */}
            <Card className="lg:col-span-1">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-lg">
                        <div className="flex items-center gap-2">
                            <MessageCircle className="h-5 w-5" />
                            <span>Support Inbox</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                            {conversations.filter(c => c.status !== 'closed' && c.status !== 'resolved').length} active
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <ScrollArea className="h-[500px]">
                        <div className="px-3 pb-3 space-y-2">
                            {conversations.map((convo) => {
                                const statusConfig = getStatusBadge(convo.status);
                                const isSelected = selectedConversation === convo.id;
                                const isClosed = convo.status === 'closed' || convo.status === 'resolved';
                                
                                return (
                                    <button
                                        key={convo.id}
                                        onClick={() => handleSelectConversation(convo.id)}
                                        className={`w-full text-left p-3 rounded-lg transition-all ${
                                            isSelected 
                                                ? "bg-primary/10 border-2 border-primary" 
                                                : isClosed
                                                    ? "bg-muted/50 hover:bg-muted"
                                                    : "bg-card hover:bg-muted border border-border"
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="text-sm">{statusConfig.icon}</span>
                                                <span className={`font-medium text-sm truncate ${isClosed ? 'text-muted-foreground' : ''}`}>
                                                    {getUserDisplay(convo.user_id)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                {convo.unreadCount > 0 && (
                                                    <Badge className="bg-red-500 text-white text-[10px] h-5 min-w-[20px] flex items-center justify-center">
                                                        {convo.unreadCount}
                                                    </Badge>
                                                )}
                                                <span className="text-[10px] text-muted-foreground">
                                                    {getTimeAgo(convo.last_message_at)}
                                                </span>
                                            </div>
                                        </div>
                                        <p className={`text-xs mt-1 truncate ${isClosed ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                                            {convo.subject}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Badge 
                                                variant="outline" 
                                                className={`text-[10px] ${statusConfig.color} text-white border-0`}
                                            >
                                                {statusConfig.label}
                                            </Badge>
                                        </div>
                                    </button>
                                );
                            })}
                            {conversations.length === 0 && (
                                <div className="text-center text-muted-foreground text-sm py-12">
                                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    No conversations yet
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* CHAT WINDOW */}
            <Card className="lg:col-span-2 flex flex-col">
                {selectedConvo ? (
                    <>
                        {/* Chat Header - Clear User Identification */}
                        <CardHeader className="pb-3 border-b bg-primary/5">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <MessageCircle className="h-5 w-5 text-primary" />
                                        <span className="text-lg font-bold text-primary">
                                            Talking to: {getUserDisplay(selectedConvo.user_id)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Phone className="h-3 w-3" />
                                            {getUserMobile(selectedConvo.user_id)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            Started {getTimeAgo(selectedConvo.created_at)}
                                        </span>
                                        <Badge 
                                            variant="outline" 
                                            className={`${getStatusBadge(selectedConvo.status).color} text-white border-0`}
                                        >
                                            {getStatusBadge(selectedConvo.status).label}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {selectedConvo.status === 'closed' || selectedConvo.status === 'resolved' ? (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleReopenConversation(selectedConversation!)}
                                        >
                                            Reopen
                                        </Button>
                                    ) : (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleCloseConversation(selectedConversation!)}
                                            className="text-green-600 border-green-600 hover:bg-green-50"
                                        >
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            Close Chat
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardHeader>

                        {/* Messages */}
                        <CardContent className="flex-1 p-0 overflow-hidden">
                            <ScrollArea className="h-[380px] p-4">
                                <div className="space-y-3">
                                    {messages.map((msg) => {
                                        const isAdmin = msg.role === 'admin';
                                        return (
                                            <div
                                                key={msg.id}
                                                className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                                            >
                                                <div
                                                    className={`px-4 py-2 rounded-2xl max-w-[80%] ${
                                                        isAdmin
                                                            ? "bg-primary text-primary-foreground rounded-br-sm"
                                                            : "bg-muted rounded-bl-sm"
                                                    }`}
                                                >
                                                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                                    <div className={`text-[10px] mt-1 flex items-center gap-2 ${
                                                        isAdmin ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                                    }`}>
                                                        <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        {msg.status === 'read' && isAdmin && (
                                                            <span>✓✓</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>
                            </ScrollArea>
                        </CardContent>

                        {/* Reply Input */}
                        {selectedConvo.status !== 'closed' && selectedConvo.status !== 'resolved' && (
                            <div className="p-4 border-t bg-muted/30">
                                <div className="flex gap-2">
                                    <Textarea
                                        placeholder={`Reply to ${getUserDisplay(selectedConvo.user_id)}...`}
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                sendMessage();
                                            }
                                        }}
                                        className="min-h-[60px] resize-none"
                                    />
                                    <Button 
                                        onClick={sendMessage}
                                        className="self-end"
                                        disabled={!newMessage.trim()}
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-2">
                                    Press Enter to send, Shift+Enter for new line
                                </p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                            <User className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p className="text-lg font-medium">Select a conversation</p>
                            <p className="text-sm">Choose a user from the inbox to start replying</p>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default AdminSupportTab;
