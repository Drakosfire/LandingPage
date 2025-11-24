import React, { createContext, useState, useContext } from 'react';
import { DUNGEONMIND_API_URL } from '../config';

interface Message {
    role: 'user' | 'assistant' | 'error';
    content: string;
}

interface ChatContextType {
    chatHistory: Message[];
    currentEmbedding: string;
    sendMessage: (message: string) => Promise<void>;
    setCurrentEmbedding: (embedding: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [chatHistory, setChatHistory] = useState<Message[]>([]);
    const [currentEmbedding, setCurrentEmbedding] = useState<string>('srd');

    const sendMessage = async (message: string) => {
        // Convert chatHistory from Message[] format to backend's tuple format: [(user_msg, assistant_msg), ...]
        // Filter out error messages and pair up user/assistant messages
        const chatHistoryTuples: [string, string][] = [];
        let currentUserMsg: string | null = null;

        for (const msg of chatHistory) {
            if (msg.role === 'user') {
                currentUserMsg = msg.content;
            } else if (msg.role === 'assistant' && currentUserMsg !== null) {
                chatHistoryTuples.push([currentUserMsg, msg.content]);
                currentUserMsg = null;
            }
        }

        // Add user message to UI immediately
        setChatHistory(prev => [...prev, { role: 'user', content: message }]);

        try {
            const response = await fetch(`${DUNGEONMIND_API_URL}/api/ruleslawyer/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Include session cookies
                body: JSON.stringify({
                    message: message,
                    chat_history: chatHistoryTuples
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
                throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            const assistantMessage = data.response;

            setChatHistory(prev => [...prev, {
                role: 'assistant',
                content: assistantMessage
            }]);

        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage = error instanceof Error
                ? error.message
                : 'Sorry, there was an error processing your request.';
            setChatHistory(prev => [...prev, {
                role: 'error',
                content: errorMessage
            }]);
        }
    };

    return (
        <ChatContext.Provider value={{
            chatHistory,
            currentEmbedding,
            sendMessage,
            setCurrentEmbedding,
        }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChatContext = () => {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChatContext must be used within a ChatProvider');
    }
    return context;
};
