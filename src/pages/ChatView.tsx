import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { SendHorizontal, ArrowLeft, Paperclip, Bot, User, FileText, Info, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { chatService, Message, Chat } from '@/services/chat';
import { aiService, AI_MODELS } from '@/services/ai';
import { getHybridChatContext } from '@/services/hybrid';

// Model IDs for the dropdown selector
const MODEL_OPTIONS = [
  { id: 'gemini', name: 'Gemini' },
  { id: 'gpt-4', name: 'GPT-4 (Coming Soon)', disabled: true },
  { id: 'claude', name: 'Claude (Coming Soon)', disabled: true }
];

// Helper to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const ChatView = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // States for chat data
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  // States for UI
  const [newMessage, setNewMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini');
  const [file, setFile] = useState<File | null>(null);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // State to track if this is a hybrid chat with context
  const [isHybrid, setIsHybrid] = useState(false);
  const [hybridContext, setHybridContext] = useState<any>(null);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);
  
  useEffect(() => {
    // Check if Gemini API key is configured
    const hasApiKey = aiService.isGeminiConfigured();
    setApiKeyConfigured(hasApiKey);
    
    if (!hasApiKey) {
      toast.warning('Gemini API key not configured. AI responses will be simulated.', {
        duration: 5000,
        id: 'gemini-key-warning'
      });
    }
  }, []);
  
  useEffect(() => {
    async function fetchChatData() {
      if (!chatId) return;
      
      setLoading(true);
      try {
        // Get basic chat details
        const chatData = await chatService.getChatDetails(chatId);
        setChat(chatData);
        
        // Check if this is a hybrid chat
        if (chatData.type === 'hybrid') {
          setIsHybrid(true);
          try {
            // Get the context from the imported chats
            const contextData = await getHybridChatContext(chatId);
            setHybridContext(contextData);
          } catch (err) {
            console.error('Error getting hybrid context:', err);
          }
        }
        
        // Get chat messages
        const messagesData = await chatService.getMessages(chatId);
        setMessages(messagesData);
      } catch (error) {
        console.error('Error fetching chat data:', error);
        toast.error('Failed to load chat data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchChatData();
  }, [chatId]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check if chat has AI capabilities
  const hasAiCapabilities = chat?.participants.some(p => p.id === 'gemini-bot') ?? false;
  
  // Render file attachment component
  const renderFileAttachment = (attachment: any) => {
    const isImage = attachment.type.startsWith('image/');
    
    return (
      <div className="mt-2 border rounded-md p-2 bg-secondary/30 max-w-[300px]">
        {isImage ? (
          <img 
            src={attachment.url} 
            alt={attachment.name} 
            className="rounded-md max-h-[200px] object-contain" 
          />
        ) : (
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <div className="overflow-hidden">
              <p className="font-medium truncate">{attachment.name}</p>
              {attachment.size && (
                <p className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !file) || sending) return;
    
    setSending(true);
    try {
      // Prepare attachments if there's a file
      const attachments = file ? [
        {
          name: file.name,
          type: file.type,
          url: URL.createObjectURL(file)
        }
      ] : undefined;
      
      // Send user message
      if (newMessage.trim() || file) {
        const content = newMessage.trim() || (file ? `Attached file: ${file.name}` : '');
        
        const messageData = {
          content: content,
          type: file ? 'file' as const : 'text' as const,
          attachments
        };
        
        const message = await chatService.sendMessage(chatId!, messageData);
        setMessages(prev => [...prev, message]);
        setNewMessage('');
        setFile(null);
        
        // If this chat uses AI, get response from selected model
        if (hasAiCapabilities) {
          // Add a temporary loading message
          const tempId = `temp-${Date.now()}`;
          const loadingMessage = {
            id: tempId,
            chatId: chatId!,
            userId: 'gemini-bot',
            content: '...',
            type: 'text' as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(), // Adding the missing updatedAt field
            user: {
              id: 'gemini-bot',
              name: 'Gemini',
              avatar: '/ai-avatar.png'
            }
          } as Message;
          
          setMessages(prev => [...prev, loadingMessage]);
          
          try {
            // Get context from past messages for AI
            const chatContext = messages
              .slice(-10) // Get last 10 messages for context
              .map(msg => ({
                role: msg.userId === user.id ? 'user' as const : 'assistant' as const,
                content: msg.content
              }));
            
            // Include hybrid context if applicable
            let contextualPrompt = '';
            if (isHybrid && hybridContext) {
              contextualPrompt = `This is a hybrid chat created from imported conversations. Use this context to inform your responses:\n${hybridContext.summary || 'Multiple conversations were merged.'}\n\n`;
            }
            
            // Add file content to the prompt if needed
            let fileContent = '';
            if (file) {
              // For text files, we could extract content
              if (file.type.startsWith('text/')) {
                try {
                  fileContent = await file.text();
                } catch (err) {
                  fileContent = `[Unable to read file content from ${file.name}]`;
                }
              } else {
                fileContent = `[File attached: ${file.name} (${file.type})]`;
              }
            }
            
            const finalPrompt = `${contextualPrompt}${fileContent ? 'Regarding this file: ' + fileContent + '\n' : ''}${content}`;
            
            // Get AI response
            const aiResponse = await aiService.sendMessage(
              finalPrompt,
              chatContext,
              { model: selectedModel }
            );
            
            // Remove loading message and add actual response
            setMessages(prev => prev.filter(m => m.id !== tempId).concat([
              {
                id: `ai-${Date.now()}`,
                chatId: chatId!,
                userId: 'gemini-bot',
                content: aiResponse.content,
                type: 'text' as const,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                user: {
                  id: 'gemini-bot',
                  name: 'Gemini',
                  avatar: '/ai-avatar.png'
                }
              } as Message
            ]));
          } catch (err: any) {
            // Remove loading message and show error
            setMessages(prev => prev.filter(m => m.id !== tempId));
            toast.error(`AI Error: ${err.message || 'Failed to get response'}`);  
          }
        }
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(`Failed to send message: ${error.message || 'Unknown error'}`);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      toast.info(`File attached: ${selectedFile.name}`);
    }
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    toast.info(`AI model set to ${model}`);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/app/chats')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {chat?.name?.[0] || 'C'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-lg">{chat?.name || 'Chat'}</h2>
              <p className="text-sm text-muted-foreground">
                {chat?.type === 'hybrid' ? 'Hybrid Chat' : 'Direct Chat'}
              </p>
            </div>
          </div>
        </div>

        {/* AI Model Selector */}
        <Select value={selectedModel} onValueChange={handleModelChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select AI Model" />
          </SelectTrigger>
          <SelectContent>
            {AI_MODELS.map(model => (
              <SelectItem 
                key={model.id} 
                value={model.id}
                disabled={model.id !== 'gemini'} // Only Gemini is enabled for now
      </div>
      
      {hasAiCapabilities && (
        <div className="flex items-center">
          <Select value={selectedModel} onValueChange={handleModelChange}>
            <SelectTrigger className="w-[130px] h-8 text-xs">
              <SelectValue placeholder="AI Model" />
            </SelectTrigger>
            <SelectContent>
              {AI_MODELS.map(model => (
                <SelectItem 
                  key={model.id} 
                  value={model.id}
                  disabled={model.id !== 'gemini'} // Only Gemini is enabled for now
                >
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {!apiKeyConfigured && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="ml-1">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Gemini API key not configured. AI responses will be simulated.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}
    </div>

    {/* Main chat area */}
    <ScrollArea className="flex-1 p-4 overflow-auto" ref={messagesContainerRef}>
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <p>Loading messages...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <p className="text-muted-foreground">No messages yet</p>
          {isHybrid && hybridContext && (
            <div className="mt-4 max-w-md bg-secondary/20 p-4 rounded-lg border">
              <p className="text-sm font-medium mb-2">This hybrid chat was created from:</p>
              <p className="text-sm text-muted-foreground">{hybridContext.summary || 'Multiple merged conversations'}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map(message => {
            const isUser = message.userId === user.id;
            const isAi = message.userId === 'gemini-bot';
            return (
              <motion.div 
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  <Avatar className="h-8 w-8 mt-1">
                    {!isUser && message.user?.avatar ? (
                      <AvatarImage src={message.user?.avatar} alt={message.user?.name} />
                    ) : null}
                    <AvatarFallback>
                      {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <Card className={`${isUser ? 'bg-primary text-primary-foreground' : ''} ${message.content === '...' ? 'animate-pulse' : ''}`}>
                    <CardContent className="p-3 break-words">
                      {message.content === '...' ? (
                        <p>AI is thinking...</p>
                      ) : (
                        <>
                          <p>{message.content}</p>
                          {message.type === 'file' && message.attachments?.length > 0 && (
                            renderFileAttachment(message.attachments[0])
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      )}
    </ScrollArea>

    {/* Message input area */}
    <div className="border-t p-3 dark:border-gray-800">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={handleFileSelect} disabled={sending}>
          <Paperclip className="h-5 w-5" />
        </Button>
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".txt,.pdf,.doc,.docx,.csv,image/*"
        />
        
        <div className="flex-1 flex gap-2 items-center">
          {file && (
            <div className="flex items-center text-xs bg-secondary rounded-md px-2 py-1">
              <span className="truncate max-w-[100px]">{file.name}</span>
              <Button variant="ghost" size="sm" className="h-5 w-5 ml-1" onClick={() => setFile(null)}>
                <span className="sr-only">Remove</span>
                &times;
              </Button>
            </div>
          )}
          <Input
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1"
          />
        </div>
        
        <Button 
          onClick={handleSendMessage} 
          disabled={sending || (!newMessage.trim() && !file)}
          className="bg-primary hover:bg-primary/90"
        >
          <SendHorizontal className="h-5 w-5" />
          {sending && <span className="ml-2">...</span>}
        </Button>
              size="sm"
              onClick={() => setFile(null)}
            >
              Remove
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatView;
