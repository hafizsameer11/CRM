import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Send, Save, Sparkles, Upload, X, Image as ImageIcon, Video, Loader2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface PostEditorProps {
  post?: any
  onClose: () => void
}

export default function PostEditor({ post, onClose }: PostEditorProps) {
  const queryClient = useQueryClient()
  const [caption, setCaption] = useState(post?.caption || '')
  const [channelId, setChannelId] = useState(post?.channel_id?.toString() || '')
  const [scheduledFor, setScheduledFor] = useState(post?.scheduled_for || '')
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<number[]>(post?.media || [])
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false)
  const [uploadingFile, setUploadingFile] = useState<File | null>(null)

  // Fetch channels - only Facebook and Instagram
  const { data: channelsData } = useQuery({
    queryKey: ['channels'],
    queryFn: async () => {
      const response = await api.get('/tenant/channels')
      return response.data
    },
  })

  const channels = channelsData?.filter((c: any) => 
    c.type === 'facebook' || c.type === 'instagram'
  ) || []

  // Fetch media library
  const { data: mediaData, isLoading: mediaLoading } = useQuery({
    queryKey: ['media'],
    queryFn: async () => {
      const response = await api.get('/tenant/media')
      return response.data
    },
  })

  const media = mediaData?.data || []

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

  // Upload media mutation
  const uploadMediaMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const response = await api.post('/tenant/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['media'] })
      setSelectedMedia([...selectedMedia, data.id])
      setUploadingFile(null)
      toast({
        title: 'Media uploaded',
        description: 'File uploaded successfully',
      })
    },
    onError: (error: any) => {
      setUploadingFile(null)
      toast({
        title: 'Upload failed',
        description: error.response?.data?.error || 'Failed to upload file',
        variant: 'destructive',
      })
    },
  })

  const selectedChannel = channels.find((c: any) => c.id.toString() === channelId)
  const isInstagram = selectedChannel?.type === 'instagram'

  const handleSaveDraft = () => {
    if (!channelId) {
      toast({
        title: 'Channel required',
        description: 'Please select a channel',
        variant: 'destructive',
      })
      return
    }

    saveMutation.mutate({
      channel_id: channelId,
      caption,
      media: selectedMedia,
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

    // Instagram requires media
    if (isInstagram && selectedMedia.length === 0) {
      toast({
        title: 'Media required',
        description: 'Instagram posts require at least one media file',
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
        media: selectedMedia,
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

    // Instagram requires media
    if (isInstagram && selectedMedia.length === 0) {
      toast({
        title: 'Media required',
        description: 'Instagram posts require at least one media file',
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
        media: selectedMedia,
        status: 'draft',
      })
      scheduleMutation.mutate({ postId: result.data.id, scheduledFor })
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadingFile(file)
      uploadMediaMutation.mutate(file)
    }
  }

  const removeMedia = (mediaId: number) => {
    setSelectedMedia(selectedMedia.filter(id => id !== mediaId))
  }

  const addMedia = (mediaId: number) => {
    if (!selectedMedia.includes(mediaId)) {
      setSelectedMedia([...selectedMedia, mediaId])
    }
    setMediaDialogOpen(false)
  }

  const selectedMediaItems = media.filter((m: any) => selectedMedia.includes(m.id))

  return (
    <div className="space-y-6">
      {/* Channel Selection */}
      <div className="space-y-2">
        <Label htmlFor="channel">Channel *</Label>
        <Select value={channelId} onValueChange={setChannelId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a channel" />
          </SelectTrigger>
          <SelectContent>
            {channels.length === 0 ? (
              <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                No Facebook or Instagram channels connected. 
                <br />
                <Button
                  variant="link"
                  className="p-0 h-auto mt-2"
                  onClick={() => {
                    onClose()
                    window.location.href = '/integrations'
                  }}
                >
                  Connect channels
                </Button>
              </div>
            ) : (
              channels.map((channel: any) => (
                <SelectItem key={channel.id} value={channel.id.toString()}>
                  {channel.type === 'facebook' ? '📘' : '📷'} {channel.type.toUpperCase()} - {channel.identifiers?.page_name || channel.identifiers?.username || 'Unknown'}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {isInstagram && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            ⚠️ Instagram requires at least one media file
          </p>
        )}
      </div>

      {/* Media Selection */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Media {isInstagram && <span className="text-red-500">*</span>}</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setMediaDialogOpen(true)}
          >
            <Upload className="w-4 h-4 mr-2" />
            {selectedMedia.length > 0 ? 'Change Media' : 'Add Media'}
          </Button>
        </div>
        
        {selectedMediaItems.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {selectedMediaItems.map((item: any) => (
              <div key={item.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden border-2 border-primary">
                  {item.type === 'image' ? (
                    <img
                      src={item.url}
                      alt={item.original_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Video className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeMedia(item.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-2">No media selected</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMediaDialogOpen(true)}
            >
              Select Media
            </Button>
          </div>
        )}
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

      {/* Media Selection Dialog */}
      <Dialog open={mediaDialogOpen} onOpenChange={setMediaDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Media</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Upload New Media */}
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
              <Label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center justify-center py-4">
                  {uploadingFile ? (
                    <>
                      <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                      <p className="text-sm text-muted-foreground">Uploading {uploadingFile.name}...</p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm font-medium">Upload new media</p>
                      <p className="text-xs text-muted-foreground">Click to select a file</p>
                    </>
                  )}
                </div>
                <Input
                  id="file-upload"
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploadMediaMutation.isPending}
                />
              </Label>
            </div>

            {/* Media Library */}
            {mediaLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading media...</p>
              </div>
            ) : media.length === 0 ? (
              <div className="text-center py-8">
                <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No media files yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {media.map((item: any) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => addMedia(item.id)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedMedia.includes(item.id)
                        ? 'border-primary ring-2 ring-primary'
                        : 'border-muted hover:border-primary'
                    }`}
                  >
                    {item.type === 'image' ? (
                      <img
                        src={item.thumbnail_url || item.url}
                        alt={item.original_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Video className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    {selectedMedia.includes(item.id) && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <div className="bg-primary text-primary-foreground rounded-full p-1">
                          <X className="h-4 w-4" />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
