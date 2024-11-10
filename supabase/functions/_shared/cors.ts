```typescript
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

2. Now let's update the `video-info` function. In `supabase/functions/video-info/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

console.log("video-info function loading...")

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()
    
    // For now, return mock data
    const videoInfo = {
      title: "Sample Video",
      duration: 5,
      author: "Sample Author"
    }
    
    const costEstimate = {
      whisperCost: videoInfo.duration * 0.006,
      gptCost: videoInfo.duration * 0.002,
      totalCost: videoInfo.duration * 0.008
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        videoInfo, 
        costEstimate 
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
```