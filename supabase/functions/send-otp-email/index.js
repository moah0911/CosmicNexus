// Follow this setup guide to integrate the Deno runtime:
// https://deno.com/manual/runtime/manual/getting_started

// Import required dependencies
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

// You would need to set up an email service like SendGrid, Mailgun, etc.
// This is a placeholder for the actual implementation
const sendEmail = async (to, subject, body) => {
  // In a real implementation, you would use an email service API
  console.log(`Sending email to ${to}:`)
  console.log(`Subject: ${subject}`)
  console.log(`Body: ${body}`)
  
  // Return success for now
  return { success: true }
}

serve(async (req) => {
  try {
    // Get the request body
    const { email, otp } = await req.json()
    
    // Validate input
    if (!email || !otp) {
      return new Response(
        JSON.stringify({ error: 'Email and OTP are required' }),
        { headers: { 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    
    // Create a Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    
    // Prepare email content
    const subject = 'Your Cosmic Nexus Verification Code'
    const body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #6d28d9; text-align: center;">Cosmic Nexus</h2>
        <p>Hello,</p>
        <p>Thank you for registering with Cosmic Nexus!</p>
        <p>Your verification code is:</p>
        <div style="background-color: #f3f4f6; padding: 10px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
        <p>Best regards,<br>The Cosmic Nexus Team</p>
      </div>
    `
    
    // Send the email
    const { success, error } = await sendEmail(email, subject, body)
    
    if (!success) {
      throw new Error(error || 'Failed to send email')
    }
    
    // Return success response
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    // Return error response
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
