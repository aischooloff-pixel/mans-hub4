-- Create promo_codes table for subscription discounts
CREATE TABLE public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_percent integer NOT NULL DEFAULT 10,
  max_uses integer DEFAULT NULL,
  uses_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  expires_at timestamp with time zone DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Everyone can view active promo codes (to validate them)
CREATE POLICY "Active promo codes are viewable"
ON public.promo_codes
FOR SELECT
USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Service role can manage promo codes
CREATE POLICY "Service role can manage promo codes"
ON public.promo_codes
FOR ALL
USING (true)
WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_promo_codes_updated_at
BEFORE UPDATE ON public.promo_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create promo_code_usages table to track who used what promo
CREATE TABLE public.promo_code_usages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id uuid NOT NULL REFERENCES public.promo_codes(id) ON DELETE CASCADE,
  user_profile_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.promo_code_usages ENABLE ROW LEVEL SECURITY;

-- Service role can manage usages
CREATE POLICY "Service role can manage promo usages"
ON public.promo_code_usages
FOR ALL
USING (true)
WITH CHECK (true);

-- Add unique constraint to prevent double usage
CREATE UNIQUE INDEX idx_promo_usage_unique ON public.promo_code_usages(promo_code_id, user_profile_id);