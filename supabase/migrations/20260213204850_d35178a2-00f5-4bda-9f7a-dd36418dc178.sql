
-- Knowledge base for RAG
CREATE TABLE public.knowledge_base (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  source_url TEXT,
  tags TEXT[] DEFAULT '{}',
  search_vector tsvector,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger to update search_vector
CREATE OR REPLACE FUNCTION public.knowledge_base_search_vector_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.category, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.content, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.tags, ' '), '')), 'B');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_knowledge_base_search_vector
BEFORE INSERT OR UPDATE ON public.knowledge_base
FOR EACH ROW EXECUTE FUNCTION public.knowledge_base_search_vector_trigger();

CREATE INDEX idx_knowledge_base_search ON public.knowledge_base USING GIN(search_vector);
CREATE INDEX idx_knowledge_base_category ON public.knowledge_base(category);

ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Knowledge base is publicly readable" ON public.knowledge_base FOR SELECT USING (true);
CREATE POLICY "Knowledge base can be inserted publicly" ON public.knowledge_base FOR INSERT WITH CHECK (true);

-- Support tickets for tracking deflection
CREATE TABLE public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT DEFAULT 'medium',
  resolution_source TEXT,
  ai_confidence FLOAT,
  user_satisfied BOOLEAN,
  conversation_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  is_synthetic BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_tickets_category ON public.support_tickets(category);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tickets are publicly readable" ON public.support_tickets FOR SELECT USING (true);
CREATE POLICY "Tickets can be inserted publicly" ON public.support_tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Tickets can be updated publicly" ON public.support_tickets FOR UPDATE USING (true);

-- Chat interactions for analytics
CREATE TABLE public.chat_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  user_query TEXT NOT NULL,
  ai_response TEXT,
  matched_articles UUID[],
  was_deflected BOOLEAN DEFAULT false,
  feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Interactions are publicly readable" ON public.chat_interactions FOR SELECT USING (true);
CREATE POLICY "Interactions can be inserted publicly" ON public.chat_interactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Interactions can be updated publicly" ON public.chat_interactions FOR UPDATE USING (true);

-- Function for full-text search
CREATE OR REPLACE FUNCTION public.search_knowledge_base(search_query TEXT, match_count INT DEFAULT 3)
RETURNS TABLE(id UUID, title TEXT, category TEXT, content TEXT, tags TEXT[], rank REAL)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id, kb.title, kb.category, kb.content, kb.tags,
    ts_rank(kb.search_vector, websearch_to_tsquery('english', search_query)) AS rank
  FROM public.knowledge_base kb
  WHERE kb.search_vector @@ websearch_to_tsquery('english', search_query)
  ORDER BY rank DESC
  LIMIT match_count;
END;
$$;
