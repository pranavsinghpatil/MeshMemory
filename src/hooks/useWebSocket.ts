
import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export interface WebSocketEvents {
  'message:new': (message: any) => void;
  'message:update': (message: any) => void;
  'message:delete': (messageId: string) => void;
  'typing:status': (data: { userId: string; chatId: string; isTyping: boolean }) => void;
  'presence:update': (data: { userId: string; status: 'online' | 'offline' }) => void;
}

interface UseWebSocketOptions {
  enabled?: boolean;
  token?: string;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const { enabled = true, token } = options;
  const socketRef = useRef<Socket | null>(null);
  const listenersRef = useRef<Map<string, any>>(new Map());

  const connect = useCallback(() => {
    if (!enabled || socketRef.current) return;

    try {
      const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';
      
      socketRef.current = io(wsUrl, {
        auth: {
          token: token || localStorage.getItem('meshmemory-token'),
        },
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
        timeout: 10000,
      });

      socketRef.current.on('connect', () => {
        console.log('WebSocket connected');
      });

      socketRef.current.on('disconnect', () => {
        console.log('WebSocket disconnected');
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
      });

      // Re-register all existing listeners
      listenersRef.current.forEach((callback, event) => {
        socketRef.current?.on(event, callback);
      });
    } catch (error) {
      console.error('Failed to initialize WebSocket connection:', error);
    }
  }, [enabled, token]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  const on = useCallback((
    event: string,
    callback: (...args: any[]) => void
  ) => {
    listenersRef.current.set(event, callback);
    if (socketRef.current) {
      socketRef.current.on(event as any, callback);
    }
  }, []);

  const off = useCallback((
    event: string,
    callback?: (...args: any[]) => void
  ) => {
    if (callback) {
      listenersRef.current.delete(event);
    }
    if (socketRef.current) {
      socketRef.current.off(event as any, callback);
    }
  }, []);

  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected || false,
    connect,
    disconnect,
    on,
    off,
    emit,
  };
};
