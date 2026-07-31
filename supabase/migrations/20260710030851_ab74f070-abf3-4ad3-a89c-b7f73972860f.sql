
-- Categories
CREATE TABLE public.guide_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_ta TEXT,
  name_te TEXT,
  name_kn TEXT,
  icon TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.guide_categories TO anon, authenticated;
GRANT ALL ON public.guide_categories TO service_role;
ALTER TABLE public.guide_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view enabled categories" ON public.guide_categories
  FOR SELECT USING (is_enabled = true OR public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage categories" ON public.guide_categories
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- Questions
CREATE TABLE public.guide_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.guide_categories(id) ON DELETE CASCADE,
  question_en TEXT NOT NULL,
  question_ta TEXT,
  question_te TEXT,
  question_kn TEXT,
  answer_en TEXT NOT NULL DEFAULT '',
  answer_ta TEXT,
  answer_te TEXT,
  answer_kn TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  is_human_verified BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  search_count INTEGER NOT NULL DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE ON public.guide_questions TO anon, authenticated;
GRANT ALL ON public.guide_questions TO service_role;
ALTER TABLE public.guide_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view enabled questions" ON public.guide_questions
  FOR SELECT USING (is_enabled = true OR public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage questions" ON public.guide_questions
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- Version history
CREATE TABLE public.guide_question_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.guide_questions(id) ON DELETE CASCADE,
  snapshot JSONB NOT NULL,
  changed_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.guide_question_versions TO authenticated;
GRANT ALL ON public.guide_question_versions TO service_role;
ALTER TABLE public.guide_question_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage versions" ON public.guide_question_versions
  FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- AI query analytics
CREATE TABLE public.guide_ai_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  query TEXT NOT NULL,
  matched_question_id UUID REFERENCES public.guide_questions(id) ON DELETE SET NULL,
  answer TEXT,
  source TEXT NOT NULL DEFAULT 'ai',
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.guide_ai_queries TO anon, authenticated;
GRANT SELECT, DELETE ON public.guide_ai_queries TO authenticated;
GRANT ALL ON public.guide_ai_queries TO service_role;
ALTER TABLE public.guide_ai_queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log queries" ON public.guide_ai_queries
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view analytics" ON public.guide_ai_queries
  FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete analytics" ON public.guide_ai_queries
  FOR DELETE USING (public.is_admin(auth.uid()));

-- Update triggers
CREATE TRIGGER trg_guide_categories_updated
  BEFORE UPDATE ON public.guide_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_guide_questions_updated
  BEFORE UPDATE ON public.guide_questions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Version snapshot trigger on update
CREATE OR REPLACE FUNCTION public.snapshot_guide_question()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO public.guide_question_versions (question_id, snapshot, changed_by)
    VALUES (OLD.id, to_jsonb(OLD), auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_guide_questions_snapshot
  BEFORE UPDATE ON public.guide_questions
  FOR EACH ROW EXECUTE FUNCTION public.snapshot_guide_question();

-- Indexes
CREATE INDEX idx_guide_questions_category ON public.guide_questions(category_id);
CREATE INDEX idx_guide_questions_featured ON public.guide_questions(is_featured) WHERE is_featured = true;
CREATE INDEX idx_guide_questions_order ON public.guide_questions(display_order);
CREATE INDEX idx_guide_ai_queries_created ON public.guide_ai_queries(created_at DESC);

-- Seed categories
INSERT INTO public.guide_categories (slug, name_en, icon, display_order) VALUES
  ('temple', 'Temple & Darshan', '🛕', 1),
  ('girivalam', 'Girivalam', '🚶', 2),
  ('pournami', 'Pournami', '🌕', 3),
  ('route', 'Route & Navigation', '🗺️', 4),
  ('facilities', 'Facilities', '🚻', 5),
  ('dress-code', 'Dress Code', '👕', 6),
  ('festivals', 'Festivals', '🪔', 7),
  ('annadhanam', 'Annadhanam', '🍽️', 8),
  ('travel', 'Travel', '🚗', 9),
  ('safety', 'Safety', '🛡️', 10);
