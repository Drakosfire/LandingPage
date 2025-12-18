import React, { createContext, useState, useContext, useEffect } from 'react';
import { DUNGEONMIND_API_URL } from '../config';

interface Message {
    role: 'user' | 'assistant' | 'error';
    content: string;
}

interface ChatContextType {
    chatHistory: Message[];
    currentEmbedding: string;
    embeddingsLoaded: boolean;
    isLoadingEmbeddings: boolean;
    sendMessage: (message: string) => Promise<void>;
    setCurrentEmbedding: (embedding: string) => void;
    loadEmbedding: (embeddingId: string) => Promise<void>;
    clearMessages: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Default embedding to load on page access
const DEFAULT_EMBEDDING = 'DnD_PHB_55';

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [chatHistory, setChatHistory] = useState<Message[]>([]);
    const [currentEmbedding, setCurrentEmbedding] = useState<string>(DEFAULT_EMBEDDING);
    const [embeddingsLoaded, setEmbeddingsLoaded] = useState<boolean>(false);
    const [isLoadingEmbeddings, setIsLoadingEmbeddings] = useState<boolean>(false);

    // Check embedding status on mount
    useEffect(() => {
        const checkEmbeddingStatus = async () => {
            try {
                const response = await fetch(`${DUNGEONMIND_API_URL}/api/ruleslawyer/status`, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.embeddings_loaded) {
                        setEmbeddingsLoaded(true);
                        console.log('✅ [RulesLawyer] Embeddings already loaded');
                        return;
                    }
                }

                // Embeddings not loaded, auto-load default
                console.log(`🔄 [RulesLawyer] Embeddings not loaded, auto-loading ${DEFAULT_EMBEDDING}...`);
                await loadEmbedding(DEFAULT_EMBEDDING);
            } catch (error) {
                console.error('❌ [RulesLawyer] Error checking embedding status:', error);
                // Don't block UI if status check fails, but try to load anyway
                try {
                    await loadEmbedding(DEFAULT_EMBEDDING);
                } catch (loadError) {
                    console.error('❌ [RulesLawyer] Failed to auto-load embeddings:', loadError);
                }
            }
        };

        checkEmbeddingStatus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once on mount

    const loadEmbedding = async (embeddingId: string) => {
        setIsLoadingEmbeddings(true);
        try {
            const response = await fetch(`${DUNGEONMIND_API_URL}/api/ruleslawyer/loadembeddings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    embedding: embeddingId,
                    embeddings_file_path: `${embeddingId}_embeddings.csv`,
                    enhanced_json_path: `${embeddingId}.json`
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Failed to load embeddings' }));
                throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
            }

            setCurrentEmbedding(embeddingId);
            setEmbeddingsLoaded(true);
            console.log(`✅ [RulesLawyer] Successfully loaded embedding: ${embeddingId}`);
        } catch (error) {
            console.error('❌ [RulesLawyer] Error loading embeddings:', error);
            setEmbeddingsLoaded(false);
            throw error;
        } finally {
            setIsLoadingEmbeddings(false);
        }
    };

    const clearMessages = () => {
        console.log('🗑️ [RulesLawyer] Clearing chat history');
        setChatHistory([]);
    };

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

        const requestStartTime = performance.now();
        console.log('🚀 [RulesLawyer] Starting query request:', {
            messageLength: message.length,
            chatHistoryLength: chatHistoryTuples.length,
            timestamp: new Date().toISOString()
        });

        try {
            const fetchStartTime = performance.now();
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

            // Handle streaming response
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let assistantMessage = '';
            let buffer = '';

            // Add assistant message placeholder that we'll update
            setChatHistory(prev => [...prev, { role: 'assistant', content: '' }]);

            if (!reader) {
                throw new Error('No response body reader available');
            }

            console.log('🌊 [RulesLawyer] Starting to stream response...');
            let chunkCount = 0;
            let tokenCount = 0;

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    console.log(`✅ [RulesLawyer] Stream completed: chunks=${chunkCount}, tokens=${tokenCount}, total_length=${assistantMessage.length}`);
                    break;
                }

                chunkCount++;
                const rawChunk = decoder.decode(value, { stream: true });
                console.log(`📦 [RulesLawyer] Received chunk #${chunkCount}: length=${rawChunk.length}, preview="${rawChunk.substring(0, 100)}..."`);

                buffer += rawChunk;
                const lines = buffer.split('\n');
                buffer = lines.pop() || ''; // Keep incomplete line in buffer

                console.log(`📝 [RulesLawyer] Processed ${lines.length} lines from chunk, buffer remaining: ${buffer.length} chars`);

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        tokenCount++;
                        console.log(`📥 [RulesLawyer] Parsed token #${tokenCount}: length=${data.length}, preview="${data.substring(0, 50)}${data.length > 50 ? '...' : ''}"`);

                        if (data === '[DONE]') {
                            console.log(`✅ [RulesLawyer] Received [DONE] signal: total_length=${assistantMessage.length}`);
                            const totalDuration = performance.now() - requestStartTime;
                            console.log(`✅ [RulesLawyer] Total request completed in ${totalDuration.toFixed(2)}ms`);
                            break;
                        }

                        if (data.startsWith('[ERROR]')) {
                            const errorMsg = data.slice(7);
                            console.error(`❌ [RulesLawyer] Received error: ${errorMsg}`);
                            throw new Error(errorMsg);
                        }

                        // Append token to message
                        assistantMessage += data;
                        console.log(`✏️ [RulesLawyer] Updated message: total_length=${assistantMessage.length}`);

                        // Update the last message in chat history
                        setChatHistory(prev => {
                            const updated = [...prev];
                            updated[updated.length - 1] = {
                                role: 'assistant',
                                content: assistantMessage
                            };
                            console.log(`🔄 [RulesLawyer] Updated chat history: message_count=${updated.length}`);
                            return updated;
                        });
                    } else if (line.trim()) {
                        console.log(`⚠️ [RulesLawyer] Non-data line ignored: "${line.substring(0, 50)}"`);
                    }
                }
            }

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
            embeddingsLoaded,
            isLoadingEmbeddings,
            sendMessage,
            setCurrentEmbedding,
            loadEmbedding,
            clearMessages,
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
