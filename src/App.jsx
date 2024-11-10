import React from 'react'
import { createClient } from '@supabase/supabase-js'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

function App() {
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

export default App
