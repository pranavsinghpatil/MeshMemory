
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService, SendMessageData } from '@/services/chat';
import { toast } from 'sonner';

export const useChats = () => {
  return useQuery({
    queryKey: ['chats'],
    queryFn: chatService.getChats,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useChatDetails = (chatId: string) => {
  return useQuery({
    queryKey: ['chat', chatId],
    queryFn: () => chatService.getChatDetails(chatId),
    enabled: !!chatId,
  });
};

export const useMessages = (chatId: string) => {
  return useQuery({
    queryKey: ['messages', chatId],
    queryFn: () => chatService.getMessages(chatId),
    enabled: !!chatId,
    staleTime: 1000 * 30, // 30 seconds
  });
};

export const useSendMessage = (chatId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendMessageData) => chatService.sendMessage(chatId, data),
    onSuccess: (newMessage) => {
      // Optimistically update messages
      queryClient.setQueryData(['messages', chatId], (old: any) => {
        return old ? [...old, newMessage] : [newMessage];
      });
      
      // Update chat list to show latest message
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to send message');
    }
  });
};

export const useCreateChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatService.createChat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      toast.success('Chat created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Failed to create chat');
    }
  });
};
