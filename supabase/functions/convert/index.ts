import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log("convert function loading...")

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()
    const authHeader = req.headers.get('Authorization')
    
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader
          }
        }
      }
    )

    // Create a conversion record
    const { data, error } = await supabaseClient
      .from('conversions')
      .insert({
        url,
        status: 'processing',
        progress: 0
      })
      .select()
      .single()

    if (error) throw error

    // Simulate processing (we'll implement real processing later)
    setTimeout(async () => {
      await supabaseClient
        .from('conversions')
        .update({
          status: 'completed',
          progress: 100,
          blog_post: 'This is a sample blog post generated from the video.'
        })
        .eq('id', data.id)
    }, 5000)

    return new Response(
      JSON.stringify({ 
        success: true, 
        id: data.id 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
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
        status: 500 
      }
    )
  }
})