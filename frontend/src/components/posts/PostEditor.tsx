import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Send, Save, Sparkles } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface PostEditorProps {
  post?: any
  onClose: () => void
}

export default function PostEditor({ post, onClose }: PostEditorProps) {
  const queryClient = useQueryClient()
  const [caption, setCaption] = useState(post?.caption || '')
  const [channelId, setChannelId] = useState(post?.channel_id || '')
  const [scheduledFor, setScheduledFor] = useState(post?.scheduled_for || '')
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)

  // Fetch channels
  const { data: channels } = useQuery({
    queryKey: ['channels'],
    queryFn: async () => {
      const response = await api.get('/tenant/channels')
      return response.data
    },
  })

  // Create/Update post mutation
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (post) {
        return await api.put(`/tenant/posts/${post.id}`, data)
      }
      return await api.post('/tenant/posts', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast({
        title: post ? 'Post updated' : 'Post created',
        description: 'Your post has been saved successfully',
      })
      onClose()
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to save post',
        variant: 'destructive',
      })
    },
  })

  // Publish mutation
  const publishMutation = useMutation({
    mutationFn: async (postId: number) => {
      return await api.post(`/tenant/posts/${postId}/publish`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast({
        title: 'Post publishing',
        description: 'Your post is being published to the selected channel',
      })
      onClose()
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to publish post',
        variant: 'destructive',
      })
    },
  })

  // Schedule mutation
  const scheduleMutation = useMutation({
    mutationFn: async ({ postId, scheduledFor }: any) => {
      return await api.post(`/tenant/posts/${postId}/schedule`, { scheduled_for: scheduledFor })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast({
        title: 'Post scheduled',
        description: 'Your post has been scheduled successfully',
      })
      onClose()
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to schedule post',
        variant: 'destructive',
      })
    },
  })

  // Generate AI caption
  const generateCaption = async () => {
    if (!caption) {
      toast({
        title: 'Topic required',
        description: 'Please enter a topic or brief description first',
        variant: 'destructive',
      })
      return
    }

    setIsGeneratingAI(true)
    try {
      const response = await api.post('/tenant/ai/generate-caption', {
        topic: caption,
        tone: 'professional',
        platform: channels?.find((c: any) => c.id === parseInt(channelId))?.type || 'facebook',
        hashtags: true,
        emoji: true,
      })

      if (response.data.suggestions?.[0]) {
        setCaption(response.data.suggestions[0])
        toast({
          title: 'AI caption generated',
          description: 'Caption has been generated successfully',
        })
      }
    } catch (error: any) {
      toast({
        title: 'AI generation failed',
        description: error.response?.data?.message || 'Failed to generate caption',
        variant: 'destructive',
      })
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const handleSaveDraft = () => {
    saveMutation.mutate({
      channel_id: channelId,
      caption,
      status: 'draft',
    })
  }

  const handlePublishNow = async () => {
    if (!channelId) {
      toast({
        title: 'Channel required',
        description: 'Please select a channel',
        variant: 'destructive',
      })
      return
    }

    if (post) {
      publishMutation.mutate(post.id)
    } else {
      const result = await saveMutation.mutateAsync({
        channel_id: channelId,
        caption,
        status: 'draft',
      })
      publishMutation.mutate(result.data.id)
    }
  }

  const handleSchedule = async () => {
    if (!channelId || !scheduledFor) {
      toast({
        title: 'Missing information',
        description: 'Please select a channel and schedule time',
        variant: 'destructive',
      })
      return
    }

    if (post) {
      scheduleMutation.mutate({ postId: post.id, scheduledFor })
    } else {
      const result = await saveMutation.mutateAsync({
        channel_id: channelId,
        caption,
        status: 'draft',
      })
      scheduleMutation.mutate({ postId: result.data.id, scheduledFor })
    }
  }

  return (
    <div className="space-y-6">
      {/* Channel Selection */}
      <div className="space-y-2">
        <Label htmlFor="channel">Channel</Label>
        <Select value={channelId} onValueChange={setChannelId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a channel" />
          </SelectTrigger>
          <SelectContent>
            {channels?.map((channel: any) => (
              <SelectItem key={channel.id} value={channel.id.toString()}>
                {channel.type.toUpperCase()} - {channel.identifiers?.page_name || channel.identifiers?.username || 'Unknown'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Caption */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="caption">Caption</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={generateCaption}
            disabled={isGeneratingAI}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isGeneratingAI ? 'Generating...' : 'AI Generate'}
          </Button>
        </div>
        <Textarea
          id="caption"
          placeholder="Write your post caption here..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={6}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground text-right">
          {caption.length} characters
        </p>
      </div>

      {/* Schedule Time */}
      <div className="space-y-2">
        <Label htmlFor="scheduled">Schedule Time (Optional)</Label>
        <Input
          id="scheduled"
          type="datetime-local"
          value={scheduledFor}
          onChange={(e) => setScheduledFor(e.target.value)}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="outline"
          onClick={handleSaveDraft}
          disabled={saveMutation.isPending}
        >
          <Save className="w-4 h-4 mr-2" />
          Save Draft
        </Button>
        {scheduledFor && (
          <Button
            onClick={handleSchedule}
            disabled={scheduleMutation.isPending}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Schedule
          </Button>
        )}
        {!scheduledFor && (
          <Button
            onClick={handlePublishNow}
            disabled={publishMutation.isPending}
          >
            <Send className="w-4 h-4 mr-2" />
            Publish Now
          </Button>
        )}
      </div>
    </div>
  )
}
