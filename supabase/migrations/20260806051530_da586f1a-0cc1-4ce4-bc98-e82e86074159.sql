CREATE TABLE public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  badge_id text NOT NULL,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  seen boolean NOT NULL DEFAULT false,
  UNIQUE (user_id, badge_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.achievements TO authenticated;
GRANT ALL ON public.achievements TO service_role;

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own achievements" ON public.achievements
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.solution_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  problem_id text NOT NULL,
  language text NOT NULL,
  code text NOT NULL,
  review jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, problem_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.solution_reviews TO authenticated;
GRANT ALL ON public.solution_reviews TO service_role;

ALTER TABLE public.solution_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own solution reviews" ON public.solution_reviews
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER solution_reviews_updated
  BEFORE UPDATE ON public.solution_reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();