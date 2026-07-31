import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import {
    sendUserMessage,
    loadConversationMessages,
    markMessagesAsRead,
    getUnreadCount,
    getUserConversation,
    subscribeToConversationMessages,
    type SupportMessage,
} from '@/utils/chatHelpers';
import { logger } from "@/lib/logger";

const ChatEmergencyWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<SupportMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);

    const [hasMobile, setHasMobile] = useState(false);
    const [checkingMobile, setCheckingMobile] = useState(true);

    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const { user } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    // --------------------------
    // Check if user has mobile number
    // --------------------------
    useEffect(() => {
        const checkMobileNumber = async () => {
            if (!user) {
                setCheckingMobile(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('mobile_number')
                    .eq('user_id', user.id)
                    .single();

                if (!error && data?.mobile_number) {
                    setHasMobile(true);
                } else {
                    setHasMobile(false);
                }
            } catch (error) {
                logger.error('Error checking mobile:', error);
                setHasMobile(false);
            } finally {
                setCheckingMobile(false);
            }
        };

        checkMobileNumber();
    }, [user]);

    // --------------------------
    // Load conversation and messages when chat opens
    // --------------------------
    useEffect(() => {
        if (isOpen && user && hasMobile) {
            loadConversation();
        }
    }, [isOpen, user, hasMobile]);

    const loadConversation = async () => {
        if (!user) return;

        try {
            // Get user's active conversation
            const conversation = await getUserConversation(user.id);

            if (conversation) {
                setConversationId(conversation.id);

                // Load messages for this conversation
                const msgs = await loadConversationMessages(conversation.id);
                setMessages(msgs);

                // Mark admin messages as read
                await markMessagesAsRead(conversation.id, 'user');
            }

            // Update unread count
            const count = await getUnreadCount(user.id);
            setUnreadCount(count);
        } catch (error) {
            logger.error('Error loading conversation:', error);
        }
    };

    // --------------------------
    // Subscribe to new messages in this conversation
    // --------------------------
    useEffect(() => {
        if (!conversationId || !isOpen) return;

        const channel = subscribeToConversationMessages(conversationId, (incomingMessage) => {
            setMessages((prev) => {
                // Avoid duplicates
                if (prev.some((m) => m.id === incomingMessage.id)) return prev;
                return [...prev, incomingMessage];
            });

            // Update unread count if it's an admin message
            if (incomingMessage.role === 'admin' && user) {
                getUnreadCount(user.id).then(setUnreadCount);
            }
        });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [conversationId, isOpen, user]);

    // --------------------------
    // Scroll to bottom when messages change
    // --------------------------
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // --------------------------
    // Send message (requires mobile number)
    // --------------------------
    const sendMessage = async () => {
        if (!checkingMobile && !hasMobile) {
            // Redirect to profile and show toast when signed in but no mobile number
            navigate('/profile');
            toast({
                title: "Mobile Number Required",
                description: "Please add your mobile number to access chat support.",
                variant: "default"
            });
            return;
        }

        if (!newMessage.trim() || isLoading || !user) return;

        const messageText = newMessage.trim();
        setNewMessage("");
        setIsLoading(true);

        try {
            // Send message using helper function
            const sentMessage = await sendUserMessage(user.id, messageText);

            if (sentMessage) {
                // Add message instantly for immediate feedback
                setMessages((prev) => {
                    // Avoid duplicates from realtime subscription
                    if (prev.some((m) => m.id === sentMessage.id)) return prev;
                    return [...prev, sentMessage];
                });

                // If first message, set conversation ID for realtime subscription
                if (!conversationId) {
                    setConversationId(sentMessage.conversation_id);
                }

                toast({
                    title: "Message Sent",
                    description: "Our support team will respond shortly.",
                });
            } else {
                throw new Error('Failed to send message');
            }
        } catch (error) {
            logger.error("Message send failed:", error);
            toast({
                title: "Failed to send",
                description: "Please try again.",
                variant: "destructive"
            });

            // Restore message text on failure
            setNewMessage(messageText);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // --------------------------
    // UI - Clean Support Chat Only
    // --------------------------
    return (
        <>
            {/* Floating Button */}
            <motion.div
                className="fixed bottom-6 right-6 z-50"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
                <Button
                    onClick={() => setIsOpen(!isOpen)}
                    className="bg-primary text-primary-foreground p-2.5 sm:p-3 rounded-xl shadow-lg active:scale-95 transition-transform relative"
                    size="icon"
                >
                    <AnimatePresence mode="wait">
                        {isOpen ? (
                            <motion.div
                                key="close"
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 90, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <X className="h-6 w-6" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="chat"
                                initial={{ rotate: 90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: -90, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <MessageCircle className="h-6 w-6" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Unread badge */}
                    {unreadCount > 0 && !isOpen && (
                        <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </motion.div>

            {/* Chat Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed bottom-24 right-6 z-40 w-80 max-w-[calc(100vw-3rem)] max-h-[calc(100vh-8rem)]"
                    >
                        <Card className="shadow-2xl border-0 bg-card/95 backdrop-blur-md">
                            <CardHeader className="pb-3 border-b">
                                <CardTitle className="text-lg font-semibold text-center flex items-center justify-center gap-2">
                                    <MessageCircle className="h-5 w-5 text-primary" />
                                    Girivalam Support
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                {/* Messages */}
                                <ScrollArea className="h-56 w-full rounded-md border p-3">
                                    <div className="space-y-3">
                                        {messages.length === 0 ? (
                                            <div className="text-center text-muted-foreground text-sm py-4">
                                                Start a conversation with our support team.
                                            </div>
                                        ) : (
                                            messages.map((message) => (
                                                <motion.div
                                                    key={message.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className={cn(
                                                        'flex',
                                                        message.role === 'user'
                                                            ? 'justify-end'
                                                            : 'justify-start'
                                                    )}
                                                >
                                                    <div
                                                        className={cn(
                                                            'max-w-[80%] rounded-lg px-3 py-2 text-sm',
                                                            message.role === 'user'
                                                                ? 'bg-primary text-primary-foreground'
                                                                : 'bg-muted'
                                                        )}
                                                    >
                                                        {message.message}
                                                        <div className="text-xs opacity-70 mt-1">
                                                            {new Date(
                                                                message.created_at
                                                            ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))
                                        )}
                                        {isLoading && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="flex justify-start"
                                            >
                                                <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                                                    Sending...
                                                </div>
                                            </motion.div>
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>
                                </ScrollArea>

                                {/* Input */}
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Type your message here…"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        disabled={isLoading || checkingMobile}
                                        className="flex-1"
                                    />
                                    <Button
                                        size="sm"
                                        onClick={sendMessage}
                                        disabled={
                                            !newMessage.trim() || isLoading || checkingMobile
                                        }
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ChatEmergencyWidget;
