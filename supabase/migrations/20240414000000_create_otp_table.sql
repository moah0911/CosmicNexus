-- Create OTP codes table
CREATE TABLE IF NOT EXISTS public.otp_codes (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_otp_codes_email ON public.otp_codes (email);

-- Enable Row Level Security
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert (for registration)
CREATE POLICY "Anyone can insert OTP codes" ON public.otp_codes
  FOR INSERT WITH CHECK (true);

-- Create policy to allow users to read their own OTP codes
CREATE POLICY "Users can read their own OTP codes" ON public.otp_codes
  FOR SELECT USING (auth.email() = email);

-- Create policy to allow users to delete their own OTP codes
CREATE POLICY "Users can delete their own OTP codes" ON public.otp_codes
  FOR DELETE USING (auth.email() = email);

-- Create function to automatically delete expired OTP codes
CREATE OR REPLACE FUNCTION delete_expired_otp_codes()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.otp_codes WHERE expires_at < NOW();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run the function periodically
DROP TRIGGER IF EXISTS trigger_delete_expired_otp_codes ON public.otp_codes;
CREATE TRIGGER trigger_delete_expired_otp_codes
  AFTER INSERT ON public.otp_codes
  EXECUTE PROCEDURE delete_expired_otp_codes();
