import { useEffect, useRef, useState, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import type { ChatMessageItem } from '../types/chat';
import { getChatMessages } from '../api/chatApi';

export function useChat(chatId: string, token: string | null) {
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    if (!token || !chatId) return;

    const baseUrl = import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '');

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${baseUrl}/hubs/chat`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    connection.on('ReceiveMessage', (message: ChatMessageItem) => {
      setMessages((prev) => [...prev, message]);
    });

    connection.on('MessagesRead', () => {
      setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
    });

    connectionRef.current = connection;

    const start = async () => {
      await connection.start();
      setIsConnected(true);
      await connection.invoke('JoinChat', chatId);

      const result = await getChatMessages(chatId);
      setMessages(result.items);

      await connection.invoke('MarkRead', chatId);
    };

    start().catch(console.error);

    return () => {
      connection
        .invoke('LeaveChat', chatId)
        .catch(console.error)
        .finally(() => {
          connection.stop();
          setIsConnected(false);
        });
    };
  }, [chatId, token]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (
        connectionRef.current?.state === signalR.HubConnectionState.Connected
      ) {
        await connectionRef.current.invoke('SendMessage', chatId, content);
      }
    },
    [chatId]
  );

  const markRead = useCallback(async () => {
    if (
      connectionRef.current?.state === signalR.HubConnectionState.Connected
    ) {
      await connectionRef.current.invoke('MarkRead', chatId);
    }
  }, [chatId]);

  return { messages, isConnected, sendMessage, markRead };
}
