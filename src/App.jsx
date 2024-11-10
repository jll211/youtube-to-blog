import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

function App() {
  const [session, setSession] = useState(null)
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)
  const [costEstimate, setCostEstimate] = useState(null)
  const [blogPost, setBlogPost] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleGetInfo = async () => {
    try {
      setStatus('estimating')
      setError(null)

      const { data, error } = await supabase.functions.invoke('video-info', {
        body: { url }
      })

      if (error) throw error

      setCostEstimate(data.costEstimate)
      setStatus('ready')
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  const handleConvert = async () => {
    try {
      setStatus('converting')
      setError(null)

      const { data, error } = await supabase.functions.invoke('convert', {
        body: { url }
      })

      if (error) throw error

      setBlogPost(data.blogPost)
      setStatus('complete')
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  if (!session) {
    return (
      <div className="max-w-md mx-auto mt-10 p-4">
        <h1 className="text-2xl font-bold mb-4">YouTube to Blog</h1>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['github']}
        />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">YouTube to Blog</h1>
        <button
          onClick={() => supabase.auth.signOut()}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Sign Out
        </button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block">YouTube URL</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="https://youtube.com/..."
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleGetInfo}
            disabled={!url || status === 'estimating'}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            {status === 'estimating' ? 'Estimating...' : 'Get Cost Estimate'}
          </button>

          <button
            onClick={handleConvert}
            disabled={!costEstimate || status === 'converting'}
            className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
          >
            {status === 'converting' ? 'Converting...' : 'Convert to Blog Post'}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {costEstimate && (
          <div className="p-4 bg-gray-100 rounded">
            <h2 className="font-bold mb-2">Cost Estimate</h2>
            <p>Whisper API: ${costEstimate.whisperCost.toFixed(4)}</p>
            <p>GPT API: ${costEstimate.gptCost.toFixed(4)}</p>
            <p className="font-bold">Total: ${costEstimate.totalCost.toFixed(4)}</p>
          </div>
        )}

        {blogPost && (
          <div className="p-4 border rounded">
            <h2 className="font-bold mb-2">Generated Blog Post</h2>
            <textarea
              value={blogPost}
              readOnly
              className="w-full h-64 p-2 border rounded"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default App
