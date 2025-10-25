import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Send } from 'lucide-react'
import api from '@/lib/api'
import { formatTime } from '@/lib/utils'

export default function Inbox() {
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [message, setMessage] = useState('')

  const { data: conversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await api.get('/tenant/conversations')
      return response.data.data || []
    },
  })

  const { data: messages } = useQuery({
    queryKey: ['messages', selectedConversation?.id],
    queryFn: async () => {
      if (!selectedConversation?.id) return []
      const response = await api.get(`/tenant/conversations/${selectedConversation.id}/messages`)
      return response.data.data || []
    },
    enabled: !!selectedConversation,
  })

  const handleSend = async () => {
    if (!message.trim() || !selectedConversation) return

    await api.post(`/tenant/conversations/${selectedConversation.id}/messages`, {
      body: message,
      type: 'text',
    })

    setMessage('')
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Inbox</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-12rem)]">
        {/* Conversations List */}
        <Card className="col-span-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {conversations?.map((conv: any) => (
              <div
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedConversation?.id === conv.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium truncate">{conv.peer_id}</p>
                  <Badge variant={conv.status === 'open' ? 'default' : 'secondary'}>
                    {conv.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {formatTime(conv.last_message_at)}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Messages Panel */}
        <Card className="col-span-1 md:col-span-2 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Header */}
              <div className="border-b p-4">
                <h2 className="font-semibold">{selectedConversation.peer_id}</h2>
                <p className="text-sm text-muted-foreground">
                  {selectedConversation.channel?.type}
                </p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages?.map((msg: any) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.direction === 'out' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        msg.direction === 'out'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p>{msg.body}</p>
                      <p className="text-xs opacity-70 mt-1">{formatTime(msg.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  />
                  <Button onClick={handleSend}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a conversation to start messaging
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

