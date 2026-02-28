import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface Message {
  id: string;
  sender: "user" | "agent";
  content: string;
  timestamp: string;
}

interface Conversation {
  id: string;
  name: string;
  messages: Message[];
}

interface ChatState {
  messages: Message[];
  conversations: Conversation[];
  activeConversationId: string | null;
  isLoading: boolean;
  error: string | null;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  saveConversation: (name: string) => void;
  loadConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setActiveConversationId: (id: string | null) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      conversations: [],
      activeConversationId: null,
      isLoading: false,
      error: null,

      addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
      clearMessages: () => set({ messages: [], activeConversationId: null }),
      saveConversation: (name) => {
        const { messages, conversations } = get();
        const newConversation: Conversation = {
          id: Date.now().toString(),
          name: name,
          messages: messages,
        };
        set({ conversations: [...conversations, newConversation], activeConversationId: newConversation.id });
      },
      loadConversation: (id) => {
        const { conversations } = get();
        const conversation = conversations.find((conv) => conv.id === id);
        if (conversation) {
          set({ messages: conversation.messages, activeConversationId: conversation.id });
        }
      },
      deleteConversation: (id) => {
        set((state) => ({
          conversations: state.conversations.filter((conv) => conv.id !== id),
          activeConversationId: state.activeConversationId === id ? null : state.activeConversationId,
        }));
      },
      setIsLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error: error }),
      setActiveConversationId: (id) => set({ activeConversationId: id }),
    }),
    {
      name: "chat-storage", // unique name
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
