import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log("Request received")
    const { url } = await req.json()
    console.log("URL received:", url)
    
    const authHeader = req.headers.get('Authorization')
    console.log("Auth header:", authHeader ? "Present" : "Missing")

    // For debugging, let's return a simple success response
    return new Response(
      JSON.stringify({
        success: true,
        blogPost: "This is a test blog post."
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      }
    )
  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200  // Changed from 400 to 200 for testing
      }
    )
  }
})
