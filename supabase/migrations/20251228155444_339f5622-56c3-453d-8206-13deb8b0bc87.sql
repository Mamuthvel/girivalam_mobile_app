-- Update likes_count to match the actual count from post_likes table
UPDATE public.community_posts cp
SET likes_count = (
  SELECT COUNT(*)::integer 
  FROM public.post_likes pl 
  WHERE pl.post_id = cp.id
);

-- Also fix comments_count while we're at it
UPDATE public.community_posts cp
SET comments_count = (
  SELECT COUNT(*)::integer 
  FROM public.post_comments pc 
  WHERE pc.post_id = cp.id
);