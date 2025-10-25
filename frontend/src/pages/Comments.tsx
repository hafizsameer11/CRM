import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { MessageCircle, Eye, EyeOff, Reply, Trash2, AlertTriangle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { formatDateTime } from '@/lib/utils'
import { motion } from 'framer-motion'

export default function Comments() {
  const [statusFilter, setStatusFilter] = useState('all')
  const [channelFilter, setChannelFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [replyDialog, setReplyDialog] = useState<any>(null)
  const [replyText, setReplyText] = useState('')
  const queryClient = useQueryClient()

  const { data: channels } = useQuery({
    queryKey: ['channels'],
    queryFn: async () => {
      const response = await api.get('/tenant/channels')
      return response.data
    },
  })

  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', statusFilter, channelFilter, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (channelFilter !== 'all') params.append('channel_id', channelFilter)
      if (searchQuery) params.append('search', searchQuery)
      const response = await api.get(`/tenant/comments?${params}`)
      return response.data
    },
  })

  const replyMutation = useMutation({
    mutationFn: async ({ id, text }: any) => {
      return await api.post(`/tenant/comments/${id}/reply`, { text })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] })
      toast({ title: 'Reply sent', description: 'Your reply has been posted' })
      setReplyDialog(null)
      setReplyText('')
    },
    onError: (error: any) => {
      toast({
        title: 'Reply failed',
        description: error.response?.data?.error || 'Failed to send reply',
        variant: 'destructive',
      })
    },
  })

  const hideMutation = useMutation({
    mutationFn: async (id: number) => await api.post(`/tenant/comments/${id}/hide`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] })
      toast({ title: 'Comment hidden', description: 'Comment has been hidden' })
    },
  })

  const unhideMutation = useMutation({
    mutationFn: async (id: number) => await api.post(`/tenant/comments/${id}/unhide`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] })
      toast({ title: 'Comment unhidden', description: 'Comment is now visible' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => await api.delete(`/tenant/comments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] })
      toast({ title: 'Comment deleted', description: 'Comment has been deleted' })
    },
    onError: (error: any) => {
      toast({
        title: 'Delete failed',
        description: error.response?.data?.error || 'Failed to delete',
        variant: 'destructive',
      })
    },
  })

  const spamMutation = useMutation({
    mutationFn: async (id: number) => await api.post(`/tenant/comments/${id}/spam`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] })
      toast({ title: 'Marked as spam', description: 'Comment has been marked as spam' })
    },
  })

  const handleReply = (comment: any) => {
    setReplyDialog(comment)
    setReplyText('')
  }

  const submitReply = () => {
    if (replyText.trim()) {
      replyMutation.mutate({ id: replyDialog.id, text: replyText })
    }
  }

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Comment Moderation</h1>
          <p className="text-muted-foreground">Manage and respond to comments</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Search comments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Select value={channelFilter} onValueChange={setChannelFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="All Channels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Channels</SelectItem>
            {channels?.map((channel: any) => (
              <SelectItem key={channel.id} value={channel.id.toString()}>
                {channel.type.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="visible">Visible</SelectItem>
            <SelectItem value="hidden">Hidden</SelectItem>
            <SelectItem value="spam">Spam</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Comments List */}
      {isLoading ? (
        <div className="text-center py-12">Loading comments...</div>
      ) : comments?.data?.length === 0 ? (
        <Card className="p-12 text-center">
          <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No comments yet</h3>
          <p className="text-muted-foreground">Comments will appear here when people engage with your posts</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {comments?.data?.map((comment: any) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">{comment.from_name || 'Unknown User'}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatDateTime(comment.created_at)}
                      </span>
                      {comment.status === 'hidden' && (
                        <Badge variant="secondary">Hidden</Badge>
                      )}
                      {comment.status === 'spam' && (
                        <Badge variant="destructive">Spam</Badge>
                      )}
                    </div>
                    <p className="text-sm mb-2">{comment.text}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{comment.channel_type?.toUpperCase()}</span>
                      <span>•</span>
                      <span>Post ID: {comment.post_id}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleReply(comment)}
                      title="Reply"
                    >
                      <Reply className="h-4 w-4" />
                    </Button>
                    {comment.status === 'visible' ? (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => hideMutation.mutate(comment.id)}
                        title="Hide comment"
                      >
                        <EyeOff className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => unhideMutation.mutate(comment.id)}
                        title="Unhide comment"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => spamMutation.mutate(comment.id)}
                      title="Mark as spam"
                    >
                      <AlertTriangle className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(comment.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Reply Dialog */}
      <Dialog open={!!replyDialog} onOpenChange={() => setReplyDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to Comment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-semibold mb-1">{replyDialog?.from_name}</p>
              <p className="text-sm">{replyDialog?.text}</p>
            </div>
            <Textarea
              placeholder="Type your reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyDialog(null)}>
              Cancel
            </Button>
            <Button
              onClick={submitReply}
              disabled={!replyText.trim() || replyMutation.isPending}
            >
              {replyMutation.isPending ? 'Sending...' : 'Send Reply'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
