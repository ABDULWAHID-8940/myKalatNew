"use client";

import { useState, useEffect } from "react";
import { useMessages } from "@/context/Message";
import { useUser } from "@/context/User";
import { useRouter } from "next/navigation";
import { MessageSquare, Send, User, ChevronLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";

function MessagesPage() {
  const [messageInput, setMessageInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);
  const {
    conversations,
    currentMessages,
    selectedConversation,
    fetchMessages,
    sendMessage,
    fetchConversations,
  } = useMessages();

  const { user } = useUser();
  const router = useRouter();

  const handleSendMessage = async () => {
    if (messageInput.trim() && selectedConversation) {
      setIsSending(true);
      try {
        await sendMessage(messageInput);
        setMessageInput("");
      } finally {
        setIsSending(false);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSelectConversation = (convoId: string) => {
    fetchMessages(convoId);
    setShowConversationList(false);
  };

  const handleBackToConversations = () => {
    setShowConversationList(true);
  };

  useEffect(() => {
    fetchConversations();
    // Reset conversation view on load
    setShowConversationList(true);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Chat Interface - Full Height */}
      <div className="flex-1 flex">
        {/* Conversation List - Always visible on desktop, conditionally on mobile */}
        <div
          className={`w-full lg:w-1/3 border-r border-gray-200 bg-white ${
            !showConversationList ? "hidden lg:block" : "block"
          }`}
        >
          <div className="p-4 h-full flex flex-col">
            <h2 className="flex items-center font-semibold mb-4 text-gray-800 flex-shrink-0">
              <Link
                href="/business"
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/business");
                }}
              >
                <ChevronLeft size={20} className="inline-block mr-2" />
              </Link>
              Conversations
            </h2>
            {conversations.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                <MessageSquare size={24} className="mx-auto mb-2" />
                <p>No conversations yet</p>
              </div>
            ) : (
              <ScrollArea className="flex-1">
                <div className="space-y-2">
                  {conversations.map((convo) => (
                    <button
                      key={convo._id}
                      onClick={() => handleSelectConversation(convo._id)}
                      className={`
                        w-full p-3 rounded-lg transition-colors
                        ${
                          selectedConversation === convo._id
                            ? "bg-gray-100 shadow-sm border border-gray-200"
                            : "hover:bg-gray-100"
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage
                            src={convo.otherUser.image}
                            alt={convo.otherUser.name}
                          />
                          <AvatarFallback>
                            <User size={20} className="text-gray-500" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0 text-left">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900 truncate">
                              {convo.otherUser.name}
                            </h3>
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {formatTime(convo.updatedAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            {convo.lastMessage}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        {/* Chat Window - Conditionally shown on mobile */}
        <div
          className={`flex-1 flex flex-col bg-white ${
            showConversationList ? "hidden lg:flex" : "flex"
          }`}
        >
          {selectedConversation ? (
            <div className="flex flex-col h-screen">
              {/* Chat Header with back button on mobile */}
              <div className="border-b border-gray-200 px-4 py-3 flex items-center flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToConversations}
                  className="lg:hidden p-1 mr-2 text-gray-500 hover:text-gray-700"
                >
                  <ChevronLeft size={20} />
                </Button>
                <Avatar className="w-10 h-10">
                  <AvatarImage
                    src={
                      conversations.find((c) => c._id === selectedConversation)
                        ?.otherUser.image
                    }
                    alt={
                      conversations.find((c) => c._id === selectedConversation)
                        ?.otherUser.name
                    }
                  />
                  <AvatarFallback>
                    <User size={20} className="text-gray-500" />
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <h3 className="font-medium text-gray-900">
                    {
                      conversations.find((c) => c._id === selectedConversation)
                        ?.otherUser.name
                    }
                  </h3>
                </div>
              </div>

              {/* Scrollable Messages Area */}
              <div className="flex-1 overflow-y-auto bg-gray-50 px-4">
                <ScrollArea className="h-full px-4 bg-gray-50">
                  {currentMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <MessageSquare size={48} className="mb-4 opacity-50" />
                      <p>No messages yet</p>
                      <p className="text-sm">Start the conversation</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {[...currentMessages].reverse().map((message) => (
                        <div
                          key={message._id}
                          className={`flex ${
                            message.senderId === user?.id
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md min-w-30 rounded-md px-2 py-1 ${
                              message.senderId === user?.id
                                ? "bg-primary text-white border-primary"
                                : "bg-white border-gray-200"
                            } shadow-sm`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p
                              className={`text-xs mt-1 text-right ${
                                message.senderId === user?.id
                                  ? "text-primary-100"
                                  : "text-gray-500"
                              }`}
                            >
                              {formatTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>

              {/* Message Input */}
              <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSendMessage();
                    }}
                    placeholder="Type your message..."
                    className="flex-1 rounded-full"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || isSending}
                    size="sm"
                    className="rounded-full min-w-[40px] h-10 w-10 p-0"
                  >
                    {isSending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Send size={18} />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-50">
              <div className="text-center">
                <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-1">
                  No conversation selected
                </h3>
                <p className="text-sm">
                  Select a conversation to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MessagesPage;
