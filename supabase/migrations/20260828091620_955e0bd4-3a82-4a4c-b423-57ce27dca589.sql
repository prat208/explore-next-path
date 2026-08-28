CREATE TABLE public.referral_codes (
  user_id uuid PRIMARY KEY,
  code text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.referral_codes TO authenticated;
GRANT ALL ON public.referral_codes TO service_role;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own referral code" ON public.referral_codes FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_user_id uuid NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT referrals_no_self CHECK (referrer_id <> referred_user_id)
);
GRANT SELECT ON public.referrals TO authenticated;
GRANT ALL ON public.referrals TO service_role;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own referrals" ON public.referrals FOR SELECT TO authenticated
  USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);

CREATE OR REPLACE FUNCTION public.ensure_referral_code()
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_code text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT code INTO v_code FROM public.referral_codes WHERE user_id = auth.uid();
  IF v_code IS NOT NULL THEN RETURN v_code; END IF;
  LOOP
    v_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 7));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.referral_codes WHERE code = v_code);
  END LOOP;
  INSERT INTO public.referral_codes (user_id, code) VALUES (auth.uid(), v_code)
    ON CONFLICT (user_id) DO NOTHING;
  SELECT code INTO v_code FROM public.referral_codes WHERE user_id = auth.uid();
  RETURN v_code;
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_referral(_code text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_referrer uuid; v_created timestamptz;
BEGIN
  IF auth.uid() IS NULL OR _code IS NULL THEN RETURN false; END IF;
  IF EXISTS (SELECT 1 FROM public.referrals WHERE referred_user_id = auth.uid()) THEN RETURN false; END IF;
  SELECT created_at INTO v_created FROM auth.users WHERE id = auth.uid();
  IF v_created IS NULL OR v_created < now() - interval '7 days' THEN RETURN false; END IF;
  SELECT user_id INTO v_referrer FROM public.referral_codes WHERE code = upper(trim(_code));
  IF v_referrer IS NULL OR v_referrer = auth.uid() THEN RETURN false; END IF;
  INSERT INTO public.referrals (referrer_id, referred_user_id) VALUES (v_referrer, auth.uid())
    ON CONFLICT (referred_user_id) DO NOTHING;
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.referral_stats()
RETURNS json LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT json_build_object(
    'code', (SELECT code FROM public.referral_codes WHERE user_id = auth.uid()),
    'invited', (SELECT count(*) FROM public.referrals WHERE referrer_id = auth.uid()),
    'unlocked', (SELECT count(*) >= 3 FROM public.referrals WHERE referrer_id = auth.uid())
  );
$$;

GRANT EXECUTE ON FUNCTION public.ensure_referral_code() TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_referral(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.referral_stats() TO authenticated;