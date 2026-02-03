"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { pusherClient } from "@/lib/pusher";
import type { ApiError } from "@/types/api";
import { useUser } from "@/context/User";

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  lastMessage: string;
  updatedAt: string;
  otherUser: {
    name: string;
    image: string;
  };
}

const conversationsKey = (userId: string) => ["conversations", userId] as const;
const messagesKey = (conversationId: string) =>
  ["messages", conversationId] as const;

export const useMessages = () => {
  const qc = useQueryClient();
  const { user } = useUser();
  const userId = user?.id;

  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);

  const convKey = useMemo(
    () => (userId ? conversationsKey(userId) : ["conversations", "anonymous"]),
    [userId],
  );

  const conversationsQuery = useQuery<Conversation[], ApiError>({
    queryKey: convKey,
    enabled: !!userId,
    queryFn: () => apiClient<Conversation[]>(`/conversation?userId=${userId}`),
  });

  const currentMessagesQuery = useQuery<Message[], ApiError>({
    queryKey: selectedConversation
      ? messagesKey(selectedConversation)
      : ["messages", "none"],
    enabled: !!selectedConversation,
    queryFn: () =>
      apiClient<Message[]>(`/conversation/${selectedConversation}/messages`),
  });

  const sendMessageMutation = useMutation<
    Message,
    ApiError,
    { content: string; conversationId?: string }
  >({
    mutationFn: ({ content, conversationId }) => {
      const resolvedConversationId = conversationId || selectedConversation;
      if (!resolvedConversationId || !userId) {
        return Promise.reject({ message: "Missing conversation or user" });
      }

      return apiClient<Message>("/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId: resolvedConversationId,
          senderId: userId,
          content,
        }),
      });
    },
    onSuccess: (_msg, vars) => {
      const resolvedConversationId =
        vars.conversationId || selectedConversation;
      if (userId) qc.invalidateQueries({ queryKey: conversationsKey(userId) });
      if (resolvedConversationId) {
        qc.invalidateQueries({ queryKey: messagesKey(resolvedConversationId) });
      }
    },
  });

  const startConversationMutation = useMutation<Conversation, ApiError, string>(
    {
      mutationFn: (participantId) => {
        if (!userId) {
          return Promise.reject({ message: "Not authenticated" });
        }

        return apiClient<Conversation>("/conversation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ participantIds: [userId, participantId] }),
        });
      },
      onSuccess: (newConversation) => {
        if (userId)
          qc.invalidateQueries({ queryKey: conversationsKey(userId) });
        setSelectedConversation(newConversation._id);
        qc.invalidateQueries({ queryKey: messagesKey(newConversation._id) });
      },
    },
  );

  // Real-time: messages for selected conversation
  useEffect(() => {
    if (!selectedConversation) return;

    const channelName = `conversation-${selectedConversation}`;
    const channel = pusherClient.subscribe(channelName);

    channel.bind("new-message", (newMessage: Message) => {
      if (newMessage.conversationId !== selectedConversation) return;

      qc.setQueryData<Message[]>(messagesKey(selectedConversation), (prev) => {
        const existing = prev ?? [];
        if (existing.some((m) => m._id === newMessage._id)) return existing;
        return [newMessage, ...existing];
      });

      if (userId) qc.invalidateQueries({ queryKey: conversationsKey(userId) });
    });

    return () => {
      channel.unbind("new-message");
      pusherClient.unsubscribe(channelName);
    };
  }, [qc, selectedConversation, userId]);

  // Real-time: new/updated conversations for user
  useEffect(() => {
    if (!userId) return;

    const channelName = `user-${userId}`;
    const channel = pusherClient.subscribe(channelName);

    const invalidate = () => {
      qc.invalidateQueries({ queryKey: conversationsKey(userId) });
    };

    channel.bind("new-conversation", invalidate);
    channel.bind("conversation-updated", invalidate);

    return () => {
      channel.unbind("new-conversation", invalidate);
      channel.unbind("conversation-updated", invalidate);
      pusherClient.unsubscribe(channelName);
    };
  }, [qc, userId]);

  return {
    conversations: conversationsQuery.data ?? [],
    currentMessages: currentMessagesQuery.data ?? [],
    isLoadingConversations: conversationsQuery.isLoading,
    isFetchingConversations: conversationsQuery.isFetching,
    isLoadingMessages: currentMessagesQuery.isLoading,
    isFetchingMessages: currentMessagesQuery.isFetching,
    selectedConversation,
    fetchConversations: () =>
      userId
        ? qc.invalidateQueries({ queryKey: conversationsKey(userId) })
        : Promise.resolve(),
    fetchMessages: async (conversationId: string) => {
      setSelectedConversation(conversationId);
      await qc.invalidateQueries({ queryKey: messagesKey(conversationId) });
    },
    sendMessage: (content: string, conversationId?: string) =>
      sendMessageMutation.mutateAsync({ content, conversationId }),
    startNewConversation: (participantId: string) =>
      startConversationMutation.mutateAsync(participantId),
  };
};
