// Chat Helper Functions for Conversation Management

import { supabase } from '@/integrations/supabase/client'
import { Database } from '@/integrations/supabase/types'
import { logger } from "@/lib/logger";

// --------------------
// Type Aliases
// --------------------

type Tables = Database['public']['Tables']

export type Conversation =
  Tables['support_conversations']['Row']

export type ConversationInsert =
  Tables['support_conversations']['Insert']

export type ConversationUpdate =
  Tables['support_conversations']['Update']

export type SupportMessage =
  Tables['support_messages']['Row']

export type SupportMessageInsert =
  Tables['support_messages']['Insert']

// --------------------
// Get or Create Conversation
// --------------------

export async function getOrCreateConversation(userId: string): Promise<{ id: string; isNew: boolean }> {
  const { data: existing } = await supabase
    .from('support_conversations')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) return { id: existing.id, isNew: false };

  const { data: created, error } = await supabase
    .from('support_conversations')
    .insert({
      user_id: userId,
      subject: 'Support Request',
      status: 'open',
    })
    .select('id')
    .single();

  if (error) throw error;

  return { id: created.id, isNew: true };
}

// --------------------
// Send User Message
// --------------------

// Inactivity threshold for triggering admin notification (1 hour in ms)
const INACTIVITY_THRESHOLD_MS = 60 * 60 * 1000

export async function sendUserMessage(
  userId: string,
  message: string
): Promise<SupportMessage | null> {
  try {
    const { id: conversationId, isNew } = await getOrCreateConversation(userId)
    if (!conversationId) throw new Error('Conversation not found')

    // Check if we should notify admin (new conversation OR 1hr+ inactivity)
    let shouldNotifyAdmin = isNew

    if (!isNew) {
      // Check last message time in this conversation
      const { data: lastMessage } = await supabase
        .from('support_messages')
        .select('created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (lastMessage) {
        const lastMessageTime = new Date(lastMessage.created_at).getTime()
        const now = Date.now()
        const inactivityDuration = now - lastMessageTime

        // Notify admin if more than 1 hour of inactivity
        if (inactivityDuration >= INACTIVITY_THRESHOLD_MS) {
          shouldNotifyAdmin = true
          logger.log(`Inactivity detected: ${Math.round(inactivityDuration / 60000)} minutes since last message`)
        }
      }
    }

    const insert: SupportMessageInsert = {
      conversation_id: conversationId,
      user_id: userId,
      role: 'user',
      message: message.trim(),
      status: 'sent'
    }

    const { data, error } = await supabase
      .from('support_messages')
      .insert(insert)
      .select()
      .single()

    if (error) throw error

    // Update conversation status to 'open' when user sends a message
    await supabase
      .from('support_conversations')
      .update({
        status: 'open',
        last_message_at: new Date().toISOString()
      })
      .eq('id', conversationId)

    // Send auto-reply for NEW conversations only
    if (isNew && data) {
      await sendAutoReply(conversationId, userId)
    }

    // Send admin notification email for new conversations OR after inactivity
    if (shouldNotifyAdmin && data) {
      // Get user profile for email notification
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, display_name')
        .eq('user_id', userId)
        .single()

      // Call edge function to notify admin
      try {
        const { error: fnError } = await supabase.functions.invoke('notify-admin-support', {
          body: {
            userEmail: profile?.email || 'Unknown',
            userName: profile?.display_name || 'Anonymous User',
            message: message.trim(),
            conversationId,
            isReturningUser: !isNew // Flag to indicate this is a returning user
          }
        })
        if (fnError) {
          logger.error('Admin notification failed:', fnError)
        }
      } catch (err) {
        logger.error('Failed to send admin notification:', err)
      }
    }

    return data
  } catch (err) {
    logger.error('sendUserMessage failed:', err)
    return null
  }
}

// --------------------
// Send Auto-Reply
// --------------------

async function sendAutoReply(
  conversationId: string,
  userId: string
): Promise<void> {
  const autoReplyMessage = `🙏 Thanks for contacting Girivalam Support.\n\nWe will reply shortly. Our team typically responds within a few hours.\n\nOm Namah Shivaya 🙏`

  try {
    // We need an admin user_id for the auto-reply
    // Use a system message approach - insert with the user's own ID but role='admin'
    await supabase
      .from('support_messages')
      .insert({
        conversation_id: conversationId,
        user_id: userId, // Using user's ID but with admin role
        role: 'admin',
        message: autoReplyMessage,
        status: 'sent'
      })
  } catch (err) {
    logger.error('Auto-reply failed:', err)
  }
}

// --------------------
// Send Admin Reply
// --------------------

export async function sendAdminReply(
  conversationId: string,
  message: string
): Promise<SupportMessage | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from('support_messages')
    .insert({
      conversation_id: conversationId,
      user_id: user.id,        // ✅ REQUIRED
      role: 'admin',
      message: message.trim(),
      status: 'sent'
    })
    .select()
    .single()

  if (error) {
    logger.error('Admin reply failed:', error)
    return null
  }

  // Update status to 'replied' when admin responds
  await supabase
    .from('support_conversations')
    .update({
      status: 'replied',
      last_message_at: new Date().toISOString()
    })
    .eq('id', conversationId)

  return data
}

// --------------------
// Get Unread Count for Conversation
// --------------------

export async function getConversationUnreadCount(
  conversationId: string
): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('support_messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conversationId)
      .eq('role', 'user')
      .is('read_at', null)

    if (error) throw error
    return count ?? 0
  } catch (err) {
    logger.error('getConversationUnreadCount failed:', err)
    return 0
  }
}


// --------------------
// Load Messages
// --------------------

export async function loadConversationMessages(
  conversationId: string
): Promise<SupportMessage[]> {
  try {
    const { data, error } = await supabase
      .from('support_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data ?? []
  } catch (err) {
    logger.error('loadConversationMessages failed:', err)
    return []
  }
}

// --------------------
// Mark Messages as Read
// --------------------

export async function markMessagesAsRead(
  conversationId: string,
  role: 'user' | 'admin'
): Promise<void> {
  try {
    const { error } = await supabase.rpc('mark_messages_as_read', {
      p_conversation_id: conversationId,
      p_role: role
    })

    if (!error) return

    const oppositeRole = role === 'user' ? 'admin' : 'user'

    await supabase
      .from('support_messages')
      .update({
        status: 'read',
        read_at: new Date().toISOString()
      })
      .eq('conversation_id', conversationId)
      .eq('role', oppositeRole)
      .is('read_at', null)
  } catch (err) {
    logger.error('markMessagesAsRead failed:', err)
  }
}

// --------------------
// Unread Count
// --------------------

export async function getUnreadCount(
  userId: string
): Promise<number> {
  try {
    const { data, error } = await supabase.rpc(
      'get_unread_count',
      { p_user_id: userId }
    )

    if (!error && typeof data === 'number') return data

    const { data: conversations } = await supabase
      .from('support_conversations')
      .select('id')
      .eq('user_id', userId)

    if (!conversations?.length) return 0

    const { count } = await supabase
      .from('support_messages')
      .select('*', { count: 'exact', head: true })
      .in(
        'conversation_id',
        conversations.map(c => c.id)
      )
      .eq('role', 'admin')
      .is('read_at', null)

    return count ?? 0
  } catch (err) {
    logger.error('getUnreadCount failed:', err)
    return 0
  }
}

// --------------------
// Get User Active Conversation
// --------------------

export async function getUserConversation(
  userId: string
): Promise<Conversation | null> {
  try {
    const { data, error } = await supabase
      .from('support_conversations')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['open', 'in_progress'])
      .order('last_message_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw error
    return data
  } catch (err) {
    logger.error('getUserConversation failed:', err)
    return null
  }
}

// --------------------
// Admin: All Conversations
// --------------------

export async function getAllConversations(): Promise<Conversation[]> {
  try {
    const { data, error } = await supabase
      .from('support_conversations')
      .select('*')
      .order('last_message_at', { ascending: false })

    if (error) throw error
    return data ?? []
  } catch (err) {
    logger.error('getAllConversations failed:', err)
    return []
  }
}

// --------------------
// Update Conversation Status
// --------------------

export async function updateConversationStatus(
  conversationId: string,
  status: Conversation['status']
): Promise<void> {
  try {
    const update: ConversationUpdate = {
      status,
      resolved_at:
        status === 'resolved' || status === 'closed'
          ? new Date().toISOString()
          : null
    }

    await supabase
      .from('support_conversations')
      .update(update)
      .eq('id', conversationId)
  } catch (err) {
    logger.error('updateConversationStatus failed:', err)
  }
}

// --------------------
// Realtime Subscriptions
// --------------------

export function subscribeToConversationMessages(
  conversationId: string,
  callback: (message: SupportMessage) => void
) {
  return supabase
    .channel(`conversation-${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'support_messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      payload => callback(payload.new as SupportMessage)
    )
    .subscribe()
}

export function subscribeToAllMessages(
  callback: (message: SupportMessage) => void
) {
  return supabase
    .channel('all-support-messages')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'support_messages'
      },
      payload => callback(payload.new as SupportMessage)
    )
    .subscribe()
}
