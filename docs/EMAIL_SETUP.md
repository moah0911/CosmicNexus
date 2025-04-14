# Setting Up EmailJS for OTP Verification

This document explains how to set up EmailJS to send OTP verification emails for Cosmic Nexus.

## Step 1: Create an EmailJS Account

1. Go to [EmailJS](https://www.emailjs.com/) and sign up for an account
2. The free tier allows 200 emails per month, which should be sufficient for testing

## Step 2: Add an Email Service

1. In the EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the instructions to connect your email account
5. Note the Service ID (e.g., `service_abc123`)

## Step 3: Create an Email Template

1. In the EmailJS dashboard, go to "Email Templates"
2. Click "Create New Template"
3. Design your template with the following content:

**Subject:**
```
Your Cosmic Nexus Verification Code
```

**Body:**
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
  <h2 style="color: #6d28d9; text-align: center;">Cosmic Nexus</h2>
  <p>Hello,</p>
  <p>Thank you for registering with Cosmic Nexus!</p>
  <p>Your verification code is:</p>
  <div style="background-color: #f3f4f6; padding: 10px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
    {{otp_code}}
  </div>
  <p>This code will expire in {{expiry_time}}.</p>
  <p>If you didn't request this code, please ignore this email.</p>
  <p>Best regards,<br>The Cosmic Nexus Team</p>
</div>
```

4. Save the template and note the Template ID (e.g., `template_xyz789`)

## Step 4: Get Your Public Key

1. In the EmailJS dashboard, go to "Account"
2. Find your Public Key (e.g., `user_abc123xyz789`)

## Step 5: Update Environment Variables

1. Open your `.env` file
2. Update the EmailJS configuration with your credentials:

```
VITE_EMAILJS_SERVICE_ID=service_your_service_id
VITE_EMAILJS_TEMPLATE_ID=template_your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

## Step 6: Create the OTP Table in Supabase

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Run the following SQL to create the OTP table:

```sql
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
```

## Testing

1. Start your application
2. Register with a valid email address
3. Check your email for the verification code
4. Enter the code on the verification page

## Troubleshooting

- If emails are not being sent, check the browser console for errors
- Verify that your EmailJS credentials are correct
- Make sure your email service is properly connected in EmailJS
- Check if your email is being filtered as spam
