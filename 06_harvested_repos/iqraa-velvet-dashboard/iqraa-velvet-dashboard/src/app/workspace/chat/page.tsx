"use client";

import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatStore } from "@/store/chatStore";
import { cn } from "@/lib/utils";

// Define the structure of a message
interface Message {
  id: string;
  sender: "user" | "agent";
  content: string;
  timestamp: string;
}

/**
 * ChatPage component provides a full-featured chat interface.
 * It includes a sidebar for conversation history, a message display area,
 * and an input form for sending new messages.
 * State is managed through a Zustand store (`useChatStore`).
 */
export default function ChatPage() {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Zustand store integration
  const {
    messages,
    conversations,
    activeConversationId,
    isLoading,
    error,
    addMessage,
    loadConversation,
    saveConversation,
    clearMessages,
    setIsLoading,
    setError,
  } = useChatStore();

  // Effect for auto-scrolling to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  /**
   * Handles sending a new message.
   * It adds the user's message to the store and simulates an agent's response.
   */
  const handleSendMessage = () => {
    if (inputValue.trim() && !isLoading) {
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        sender: "user",
        content: inputValue,
        timestamp: new Date().toLocaleTimeString(),
      };
      addMessage(userMessage);
      setInputValue("");
      setIsLoading(true);
      setError(null);

      // --- Multi-Agent Orchestration Placeholder ---
      // In a real application, this is where you would call an API
      // to get a response from a language model or agent orchestrator.
      // The orchestrator would decide which agent/tool to use based on the input.
      setTimeout(() => {
        try {
          // Simulate an error for demonstration purposes
          if (inputValue.toLowerCase().includes("error")) {
            throw new Error("This is a simulated error from the agent.");
          }

          const agentResponse: Message = {
            id: `agent-${Date.now()}`,
            sender: "agent",
            content: `This is a simulated agent response to: "${userMessage.content}"`,
            timestamp: new Date().toLocaleTimeString(),
          };
          addMessage(agentResponse);
        } catch (e: any) {
          setError(e.message);
        } finally {
          setIsLoading(false);
        }
      }, 1500); // Simulate network delay
    }
  };

  /**
   * Starts a new, empty chat session.
   */
  const handleNewChat = () => {
    clearMessages();
  };

  /**
   * Saves the current set of messages as a new conversation.
   */
  const handleSaveConversation = () => {
    const name = prompt("Enter a name for this conversation:", "New Conversation");
    if (name) {
      saveConversation(name);
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Sidebar for Conversation History */}
      <aside className="w-72 border-r dark:border-gray-700 p-4 flex flex-col">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">History</h2>
        <ScrollArea className="flex-grow">
          <div className="space-y-2">
            {conversations.map((conv) => (
              <Button
                key={conv.id}
                variant={activeConversationId === conv.id ? "secondary" : "ghost"}
                className="w-full justify-start truncate"
                onClick={() => loadConversation(conv.id)}
              >
                {conv.name}
              </Button>
            ))}
          </div>
        </ScrollArea>
        <div className="mt-4 space-y-2">
           <Button variant="outline" className="w-full" onClick={handleNewChat}>
            New Chat
          </Button>
          <Button 
            variant="default" 
            className="w-full" 
            onClick={handleSaveConversation}
            disabled={messages.length === 0}
          >
            Save Conversation
          </Button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col">
        {/* Message Stream */}
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            {messages.length === 0 && !isLoading && (
              <div className="text-center text-gray-500 pt-20">
                Start a new conversation by typing a message below.
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-end gap-2",
                  message.sender === "user" ? "justify-end" : "justify-start"
                )}
              >
                <Card
                  className={cn(
                    "max-w-xl rounded-2xl",
                    message.sender === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  )}
                >
                  <CardContent className="p-4">
                    <p>{message.content}</p>
                    <p className="text-xs opacity-60 mt-2 text-right">
                      {message.timestamp}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}

            {/* Loading State Placeholder */}
            {isLoading && (
              <div className="flex items-end gap-2 justify-start">
                <Card className="max-w-xl rounded-2xl bg-white dark:bg-gray-800 animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-4 w-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {/* Error State Display */}
            {error && (
                 <div className="flex items-end gap-2 justify-start">
                 <Card className="max-w-xl rounded-2xl bg-red-100 dark:bg-red-900/50 border-red-500">
                   <CardContent className="p-4 text-red-700 dark:text-red-300">
                     <p className="font-semibold">Agent Error</p>
                     <p>{error}</p>
                   </CardContent>
                 </Card>
               </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Box */}
        <div className="border-t dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          <div className="relative">
            <Input
              placeholder="Ask the agent anything..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={isLoading}
              className="pr-20 h-12 rounded-full"
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={isLoading || !inputValue.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-9"
            >
              {isLoading ? "Thinking..." : "Send"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
