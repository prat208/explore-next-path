REVOKE EXECUTE ON FUNCTION public.ensure_referral_code() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.claim_referral(text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.referral_stats() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.ensure_referral_code() TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_referral(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.referral_stats() TO authenticated;