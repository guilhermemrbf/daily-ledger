CREATE TABLE public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  amount_cents bigint NOT NULL CHECK (amount_cents > 0),
  description text CHECK (char_length(description) <= 200),
  category text NOT NULL DEFAULT 'outros',
  transaction_date date NOT NULL,
  transaction_time time NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO authenticated;
GRANT ALL ON public.expenses TO service_role;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own expenses select" ON public.expenses FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own expenses insert" ON public.expenses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own expenses update" ON public.expenses FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own expenses delete" ON public.expenses FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX expenses_user_date_idx ON public.expenses (user_id, transaction_date DESC);

CREATE TABLE public.daily_closings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  closing_date date NOT NULL,
  profit_cents bigint NOT NULL CHECK (profit_cents >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, closing_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_closings TO authenticated;
GRANT ALL ON public.daily_closings TO service_role;
ALTER TABLE public.daily_closings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own closings select" ON public.daily_closings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own closings insert" ON public.daily_closings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own closings update" ON public.daily_closings FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own closings delete" ON public.daily_closings FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 40),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own categories all" ON public.categories FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER expenses_touch BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER closings_touch BEFORE UPDATE ON public.daily_closings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();