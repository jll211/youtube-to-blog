const handleConvert = async () => {
  try {
    setStatus('converting')
    setError(null)

    const { data: { session } } = await supabase.auth.getSession()
    console.log("Session:", session ? "Present" : "Missing")

    const { data, error } = await supabase.functions.invoke('convert', {
      body: { url },
      headers: {
        Authorization: `Bearer ${session?.access_token}`
      }
    })

    console.log("Response:", data, error)

    if (error) throw error

    setBlogPost(data.blogPost)
    setStatus('complete')
  } catch (err) {
    console.error("Error:", err)
    setError(err.message)
    setStatus('error')
  }
}
