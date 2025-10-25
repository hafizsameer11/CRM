import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '@/lib/axios'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Calendar, Send, Edit, Trash2, Image as ImageIcon } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import PostEditor from '@/components/posts/PostEditor'
import { toast } from '@/hooks/use-toast'
import { motion } from 'framer-motion'

interface Post {
  id: number
  caption: string
  media: number[]
  status: 'draft' | 'scheduled' | 'published' | 'failed'
  scheduled_for?: string
  published_at?: string
  channel: {
    id: number
    type: string
    identifiers: any
  }
  likes_count: number
  comments_count: number
  shares_count: number
  reach?: number
  error?: string
}

export default function Posts() {
  const [selectedTab, setSelectedTab] = useState('all')
  const [editorOpen, setEditorOpen] = useState(false)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const queryClient = useQueryClient()

  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts', selectedTab],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (selectedTab !== 'all') {
        params.append('status', selectedTab)
      }
      const response = await axiosInstance.get(`/tenant/posts?${params}`)
      return response.data
    },
  })

  const deletePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      await axiosInstance.delete(`/tenant/posts/${postId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast({
        title: 'Post deleted',
        description: 'Post has been deleted successfully',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete post',
        variant: 'destructive',
      })
    },
  })

  const handleEdit = (post: Post) => {
    setSelectedPost(post)
    setEditorOpen(true)
  }

  const handleDelete = (post: Post) => {
    if (confirm('Are you sure you want to delete this post?')) {
      deletePostMutation.mutate(post.id)
    }
  }

  const handleNewPost = () => {
    setSelectedPost(null)
    setEditorOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-500'
      case 'scheduled':
        return 'bg-blue-500'
      case 'draft':
        return 'bg-gray-500'
      case 'failed':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Posts</h1>
          <p className="text-muted-foreground">
            Create, schedule, and manage your social media posts
          </p>
        </div>
        <Button onClick={handleNewPost} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          New Post
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">Loading posts...</div>
          ) : posts?.data?.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No posts found</p>
                <Button onClick={handleNewPost} className="mt-4">
                  Create your first post
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {posts?.data?.map((post: Post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Badge className={getStatusColor(post.status)}>
                            {post.status}
                          </Badge>
                          <CardTitle className="mt-2 text-sm font-medium text-muted-foreground">
                            {post.channel.type.toUpperCase()}
                          </CardTitle>
                        </div>
                        <div className="flex gap-2">
                          {post.status === 'draft' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(post)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {(post.status === 'draft' || post.status === 'failed') && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(post)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <p className="text-sm line-clamp-3 mb-4">
                        {post.caption || 'No caption'}
                      </p>

                      {post.media && post.media.length > 0 && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                          <ImageIcon className="h-3 w-3" />
                          {post.media.length} media file(s)
                        </div>
                      )}

                      {post.status === 'scheduled' && post.scheduled_for && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDateTime(post.scheduled_for)}
                        </div>
                      )}

                      {post.status === 'published' && (
                        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t">
                          <div className="text-center">
                            <div className="font-semibold">{post.likes_count}</div>
                            <div className="text-xs text-muted-foreground">Likes</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold">{post.comments_count}</div>
                            <div className="text-xs text-muted-foreground">
                              Comments
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold">
                              {post.reach || 0}
                            </div>
                            <div className="text-xs text-muted-foreground">Reach</div>
                          </div>
                        </div>
                      )}

                      {post.status === 'failed' && post.error && (
                        <div className="mt-4 p-3 bg-destructive/10 rounded-md">
                          <p className="text-xs text-destructive">{post.error}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Post Editor Modal */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPost ? 'Edit Post' : 'Create New Post'}
            </DialogTitle>
          </DialogHeader>
          <PostEditor
            post={selectedPost}
            onClose={() => {
              setEditorOpen(false)
              queryClient.invalidateQueries({ queryKey: ['posts'] })
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Floating Action Button (Mobile) */}
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg md:hidden"
        onClick={handleNewPost}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  )
}


