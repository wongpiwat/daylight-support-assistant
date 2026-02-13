DROP FUNCTION IF EXISTS public.search_knowledge_base(text, integer);

CREATE FUNCTION public.search_knowledge_base(search_query text, match_count integer DEFAULT 3)
 RETURNS TABLE(id uuid, title text, category text, content text, tags text[], rank real, source_url text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    kb.id, kb.title, kb.category, kb.content, kb.tags,
    ts_rank(kb.search_vector, websearch_to_tsquery('english', search_query)) AS rank,
    kb.source_url
  FROM public.knowledge_base kb
  WHERE kb.search_vector @@ websearch_to_tsquery('english', search_query)
  ORDER BY rank DESC
  LIMIT match_count;
END;
$function$;