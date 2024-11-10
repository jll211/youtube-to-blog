import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { load } from 'https://deno.land/x/youtube_dl/mod.ts'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url } = await req.json()

    // Get video info using youtube-dl
    const yt = await load(url)
    const info = await yt.getInfo()

    // Calculate duration in minutes
    const durationMinutes = Math.ceil(parseInt(info.duration) / 60)

    // Calculate estimated costs
    const costEstimate = {
      whisperCost: durationMinutes * 0.006,  // $0.006 per minute
      gptCost: (durationMinutes * 150) * 0.00001,  // Estimate 150 tokens per minute, $0.01 per 1K tokens
      totalCost: 0
    }
    costEstimate.totalCost = costEstimate.whisperCost + costEstimate.gptCost

    const videoInfo = {
      title: info.title,
      duration: durationMinutes,
      author: info.uploader,
      thumbnail: info.thumbnail
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
        status: 400 
      }
    )
  }
})
