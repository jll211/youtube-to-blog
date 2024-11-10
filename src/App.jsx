import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, DollarSign, PlayCircle, History, Edit } from 'lucide-react';

const App = () => {
  const [session, setSession] = useState(null);
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [costEstimate, setCostEstimate] = useState(null);
  const [conversionId, setConversionId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [blogPost, setBlogPost] = useState(null);
  const [editedBlogPost, setEditedBlogPost] = useState(null);
  const [conversions, setConversions] = useState([]);
  const [activeTab, setActiveTab] = useState('convert');

  const handleGetInfo = async () => {
    try {
      setStatus('estimating');
      setError(null);

      const response = await fetch('https://lorcwuyjhxnrgfnfxajg.supabase.co/functions/v1/video-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ url })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setCostEstimate(data.costEstimate);
      setStatus('ready');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  const handleConvert = async () => {
    try {
      setStatus('processing');
      setError(null);
      setBlogPost(null);
      setProgress(0);

      const response = await fetch('https://lorcwuyjhxnrgfnfxajg.supabase.co/functions/v1/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ url })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setConversionId(data.id);
      checkConversionStatus(data.id);
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  const checkConversionStatus = async (id) => {
    try {
      const response = await fetch(`https://lorcwuyjhxnrgfnfxajg.supabase.co/rest/v1/conversions?id=eq.${id}`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'apikey': process.env.VITE_SUPABASE_ANON_KEY
        }
      });

      const [data] = await response.json();
      if (data) {
        setProgress(data.progress);
        if (data.status === 'completed') {
          setBlogPost(data.blog_post);
          setEditedBlogPost(data.blog_post);
          setStatus('complete');
          setConversionId(null);
        } else if (data.status === 'failed') {
          setError('Conversion failed. Please try again.');
          setStatus('error');
          setConversionId(null);
        } else {
          // Continue checking if not complete
          setTimeout(() => checkConversionStatus(id), 2000);
        }
      }
    } catch (err) {
      setError('Failed to check conversion status');
      setStatus('error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="convert">Convert</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          <Button variant="outline">Sign Out</Button>
        </div>

        <TabsContent value="convert">
          <Card>
            <CardHeader>
              <CardTitle>Convert YouTube to Blog Post</CardTitle>
              <CardDescription>Enter a YouTube URL to convert it into a blog post</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="https://youtube.com/watch?v=..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={status === 'processing'}
                />
                <Button
                  onClick={handleGetInfo}
                  disabled={!url || status === 'estimating' || status === 'processing'}
                  variant="outline"
                >
                  {status === 'estimating' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <DollarSign className="w-4 h-4 mr-2" />
                  )}
                  Estimate Cost
                </Button>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {costEstimate && (
                <Card>
                  <CardHeader>
                    <CardTitle>Cost Estimate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p>Whisper API: ${costEstimate.whisperCost.toFixed(4)}</p>
                      <p>GPT API: ${costEstimate.gptCost.toFixed(4)}</p>
                      <p className="font-bold">Total: ${costEstimate.totalCost.toFixed(4)}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Button
                onClick={handleConvert}
                disabled={!costEstimate || status === 'processing'}
                className="w-full"
              >
                {status === 'processing' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Converting... {progress}%
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Start Conversion
                  </>
                )}
              </Button>

              {status === 'processing' && (
                <Progress value={progress} />
              )}

              {blogPost && (
                <Card>
                  <CardHeader>
                    <CardTitle>Generated Blog Post</CardTitle>
                    <CardDescription>Generated content</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none whitespace-pre-wrap">
                      {editedBlogPost}
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setEditedBlogPost(blogPost)}
                    >
                      Reset to Original
                    </Button>
                    <Button>
                      Copy to Clipboard
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Conversion History</CardTitle>
              <CardDescription>Your previous conversions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversions.map((conversion) => (
                  <Card key={conversion.id}>
                    <CardHeader>
                      <CardTitle>{conversion.title || 'Untitled'}</CardTitle>
                      <CardDescription>{new Date(conversion.created_at).toLocaleString()}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500 truncate">{conversion.url}</p>
                      <div className="mt-2">
                        {conversion.status === 'completed' ? (
                          <span className="text-green-500">Completed</span>
                        ) : conversion.status === 'failed' ? (
                          <span className="text-red-500">Failed</span>
                        ) : (
                          <span className="text-yellow-500">{conversion.status}</span>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setBlogPost(conversion.blog_post);
                          setEditedBlogPost(conversion.blog_post);
                          setActiveTab('convert');
                        }}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(conversion.blog_post);
                          alert('Copied to clipboard!');
                        }}
                      >
                        Copy
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default App;
