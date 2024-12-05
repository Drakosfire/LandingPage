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
        setChatHistory(prev => [...prev, { role: 'user', content: message }]);

        try {
            const response = await fetch(`${DUNGEONMIND_API_URL}/api/ruleslawyer/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message,
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            const assistantMessage = data.response;

            setChatHistory(prev => [...prev, {
                role: 'assistant',
                content: assistantMessage
            }]);

        } catch (error) {
            setChatHistory(prev => [...prev, {
                role: 'error',
                content: 'Sorry, there was an error processing your request.'
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
