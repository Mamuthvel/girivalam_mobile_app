import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Heart, 
  MessageCircle, 
  Camera, 
  PlusCircle, 
  Send, 
  Image as ImageIcon,
  X,
  MapPin,
  Clock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { logger } from "@/lib/logger";

interface CommunityPost {
  id: string;
  user_id: string;
  content: string | null;
  image_url: string | null;
  post_type: 'text' | 'photo' | 'mixed';
  created_at: string;
  likes_count: number;
  comments_count: number;
  profiles?: {
    display_name: string | null;
    email: string;
  } | null;
  is_liked?: boolean;
}

interface PostComment {
  id: string;
  content: string;
  created_at: string;
  profiles?: {
    display_name: string | null;
    email: string;
  } | null;
}

export const CommunityFeed: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [commentsDialog, setCommentsDialog] = useState<{ open: boolean; postId: string | null }>({
    open: false,
    postId: null
  });
  const [comments, setComments] = useState<PostComment[]>([]);

  // Form states
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchPosts();
    
    // Set up real-time subscription for new posts
    const channel = supabase
      .channel('community_posts_changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'community_posts' }, 
        () => {
          fetchPosts();
        }
      )
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'community_posts' }, 
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Fetch profiles separately for each post
      const postsWithProfiles = await Promise.all(
        (data || []).map(async (post) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, email')
            .eq('user_id', post.user_id)
            .maybeSingle();

          return {
            ...post,
            post_type: post.post_type as 'text' | 'photo' | 'mixed',
            profiles: profile
          };
        })
      );

      // Check which posts the current user has liked
      if (user) {
        const { data: likes, error: likesError } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postsWithProfiles.map(p => p.id));

        if (!likesError) {
          const likedPostIds = new Set(likes.map(l => l.post_id));
          const postsWithLikes = postsWithProfiles.map(post => ({
            ...post,
            is_liked: likedPostIds.has(post.id)
          }));
          setPosts(postsWithLikes);
          return;
        }
      }

      setPosts(postsWithProfiles);
    } catch (error) {
      logger.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load community posts",
        variant: "destructive",
      });
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('community-photos')
      .upload(fileName, file);

    if (error) {
      logger.error('Upload error:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('community-photos')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const createPost = async () => {
    if (!user || (!newPostContent.trim() && !selectedImage)) return;

    setLoading(true);
    try {
      let imageUrl = null;
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
        if (!imageUrl) {
          throw new Error('Failed to upload image');
        }
      }

      const postType = imageUrl && newPostContent.trim() ? 'mixed' : 
                      imageUrl ? 'photo' : 'text';

      const { error } = await supabase
        .from('community_posts')
        .insert({
          user_id: user.id,
          content: newPostContent.trim() || null,
          image_url: imageUrl,
          post_type: postType
        });

      if (error) throw error;

      setNewPostContent('');
      setSelectedImage(null);
      setImagePreview(null);
      setCreateDialogOpen(false);

      toast({
        title: "Post Shared! 🎉",
        description: "Your Girivalam experience has been shared with the community",
      });
    } catch (error) {
      logger.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.is_liked) {
        // Remove like from post_likes table
        const { error: deleteError } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (deleteError) throw deleteError;

        // Update likes_count in community_posts (ensure it never goes below 0)
        const newCount = Math.max(0, post.likes_count - 1);
        await supabase
          .from('community_posts')
          .update({ likes_count: newCount })
          .eq('id', postId);

        // Update local state
        setPosts(posts.map(p => 
          p.id === postId 
            ? { ...p, is_liked: false, likes_count: newCount }
            : p
        ));
      } else {
        // Add like to post_likes table
        const { error: insertError } = await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });

        if (insertError) throw insertError;

        // Update likes_count in community_posts
        const newCount = post.likes_count + 1;
        await supabase
          .from('community_posts')
          .update({ likes_count: newCount })
          .eq('id', postId);

        // Update local state
        setPosts(posts.map(p => 
          p.id === postId 
            ? { ...p, is_liked: true, likes_count: newCount }
            : p
        ));
      }
    } catch (error) {
      logger.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      });
    }
  };

  const fetchComments = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch profiles separately
      const commentsWithProfiles = await Promise.all(
        (data || []).map(async (comment) => {
           const { data: profile } = await supabase
             .from('profiles')
             .select('display_name, email')
             .eq('user_id', comment.user_id)
             .maybeSingle();

          return {
            ...comment,
            profiles: profile
          };
        })
      );

      setComments(commentsWithProfiles);
    } catch (error) {
      logger.error('Error fetching comments:', error);
    }
  };

  const addComment = async (postId: string) => {
    if (!user || !newComment.trim()) return;

    try {
      const { error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: newComment.trim()
        });

      if (error) throw error;

      setNewComment('');
      fetchComments(postId);
      
      // Update comments count
      setPosts(posts.map(p => 
        p.id === postId 
          ? { ...p, comments_count: p.comments_count + 1 }
          : p
      ));

      toast({
        title: "Comment Added",
        description: "Your comment has been shared",
      });
    } catch (error) {
      logger.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    }
  };

  const openComments = (postId: string) => {
    setCommentsDialog({ open: true, postId });
    fetchComments(postId);
  };

  return (
    <div className="space-y-6">
      {/* Create Post Button */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button size="lg" className="w-full">
            <PlusCircle className="mr-2 h-5 w-5" />
            Share Your Girivalam Experience
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Share with Community</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {imagePreview && (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            
            <Textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Share your thoughts, experiences, or mantras from the Girivalam path..."
              rows={4}
            />
            
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="image-upload"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('image-upload')?.click()}
              >
                <Camera className="mr-2 h-4 w-4" />
                Add Photo
              </Button>
              <Button 
                onClick={createPost} 
                disabled={loading || (!newPostContent.trim() && !selectedImage)}
                className="flex-1"
              >
                {loading ? "Sharing..." : "Share Post"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {(post.profiles?.display_name || post.profiles?.email || 'U')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">
                      {post.profiles?.display_name || post.profiles?.email?.split('@')[0] || 'Anonymous Devotee'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {post.post_type === 'photo' ? '📸 Photo' : 
                   post.post_type === 'mixed' ? '📝📸 Post' : '📝 Text'}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {post.content && (
                <p className="text-sm leading-relaxed">{post.content}</p>
              )}
              
              {post.image_url && (
                <img 
                  src={post.image_url} 
                  alt="Post image" 
                  className="w-full rounded-lg object-cover max-h-96"
                />
              )}
              
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLike(post.id)}
                    className={`${post.is_liked ? 'text-red-500' : 'text-muted-foreground'}`}
                  >
                    <Heart 
                      className={`mr-1 h-4 w-4 ${post.is_liked ? 'fill-current' : ''}`} 
                    />
                    {post.likes_count}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openComments(post.id)}
                  >
                    <MessageCircle className="mr-1 h-4 w-4" />
                    {post.comments_count}
                  </Button>
                </div>
                
                <Badge variant="secondary" className="text-xs">
                  <MapPin className="mr-1 h-3 w-3" />
                  Girivalam Path
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {posts.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No posts yet</p>
                <p className="text-sm">Be the first to share your Girivalam experience!</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Comments Dialog */}
      <Dialog 
        open={commentsDialog.open} 
        onOpenChange={(open) => setCommentsDialog({ open, postId: null })}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 p-3 bg-muted/30 rounded-lg">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {(comment.profiles?.display_name || comment.profiles?.email || 'U')[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {comment.profiles?.display_name || comment.profiles?.email?.split('@')[0] || 'Anonymous'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{comment.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
            
            {comments.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No comments yet</p>
            )}
          </div>
          
          <div className="flex gap-2 pt-4 border-t">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              onKeyPress={(e) => {
                if (e.key === 'Enter' && commentsDialog.postId) {
                  addComment(commentsDialog.postId);
                }
              }}
            />
            <Button 
              onClick={() => commentsDialog.postId && addComment(commentsDialog.postId)}
              disabled={!newComment.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommunityFeed;