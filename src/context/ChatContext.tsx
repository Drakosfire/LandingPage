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
                    // Debug: Log final complete message
                    console.log(`📋 [RulesLawyer] FINAL COMPLETE MESSAGE:`, {
                        length: assistantMessage.length,
                        content: assistantMessage,
                        has_newlines: assistantMessage.includes('\n'),
                        newline_count: (assistantMessage.match(/\n/g) || []).length,
                        markdown_headers: (assistantMessage.match(/^##/gm) || []).length,
                        markdown_lists: (assistantMessage.match(/^-\s/gm) || []).length,
                        raw_content: JSON.stringify(assistantMessage)
                    });
                    break;
                }

                chunkCount++;
                const rawChunk = decoder.decode(value, { stream: true });
                console.log(`📦 [RulesLawyer] Received chunk #${chunkCount}: length=${rawChunk.length}, preview="${rawChunk.substring(0, 100)}..."`);

                buffer += rawChunk;

                // Parse SSE format: messages are separated by \n\n
                // Each message can have multiple lines starting with "data: "
                // We need to split on \n\n to get complete messages, then parse the data field
                const messages = buffer.split('\n\n');
                buffer = messages.pop() || ''; // Keep incomplete message in buffer

                console.log(`📝 [RulesLawyer] Processed ${messages.length} complete SSE messages, buffer remaining: ${buffer.length} chars`);

                for (const message of messages) {
                    if (!message.trim()) continue; // Skip empty messages

                    // Parse SSE message - can have multiple "data: " lines (continuation)
                    const messageLines = message.split('\n');
                    let dataContent = '';

                    for (const line of messageLines) {
                        if (line.startsWith('data: ')) {
                            // First data line or continuation
                            if (dataContent) {
                                // Continuation line - add newline before content
                                dataContent += '\n' + line.slice(6);
                            } else {
                                // First data line
                                dataContent = line.slice(6);
                            }
                        } else if (line.startsWith('data:')) {
                            // Continuation without space (SSE spec allows this)
                            dataContent += '\n' + line.slice(5);
                        }
                    }

                    if (!dataContent) {
                        console.log(`⚠️ [RulesLawyer] Empty data content in message: "${message.substring(0, 100)}"`);
                        continue;
                    }

                    tokenCount++;
                    console.log(`📥 [RulesLawyer] Parsed token #${tokenCount}: raw_length=${dataContent.length}, preview="${dataContent.substring(0, 50)}${dataContent.length > 50 ? '...' : ''}"`);

                    if (dataContent === '[DONE]') {
                        console.log(`✅ [RulesLawyer] Received [DONE] signal: total_length=${assistantMessage.length}`);
                        const totalDuration = performance.now() - requestStartTime;
                        console.log(`✅ [RulesLawyer] Total request completed in ${totalDuration.toFixed(2)}ms`);
                        break;
                    }

                    if (dataContent.startsWith('[ERROR]')) {
                        const errorMsg = dataContent.slice(7);
                        console.error(`❌ [RulesLawyer] Received error: ${errorMsg}`);
                        throw new Error(errorMsg);
                    }

                    // Parse JSON-encoded content (backend sends json.dumps(content) to preserve newlines)
                    let parsedContent: string;
                    try {
                        parsedContent = JSON.parse(dataContent);
                        console.log(`✅ [RulesLawyer] JSON decoded: length=${parsedContent.length}, has_newlines=${parsedContent.includes('\n')}, newline_count=${(parsedContent.match(/\n/g) || []).length}`);
                    } catch {
                        // Fallback for non-JSON data (shouldn't happen with fixed backend)
                        console.warn(`⚠️ [RulesLawyer] Failed to parse JSON, using raw: ${dataContent.substring(0, 50)}`);
                        parsedContent = dataContent;
                    }

                    // Append token to message (newlines now preserved via JSON encoding!)
                    assistantMessage += parsedContent;
                    console.log(`✏️ [RulesLawyer] Updated message: total_length=${assistantMessage.length}, newline_count=${(assistantMessage.match(/\n/g) || []).length}`);

                    // Debug: Log full message content every 50 tokens or on first token
                    if (tokenCount === 1 || tokenCount % 50 === 0) {
                        console.log(`📋 [RulesLawyer] Full message content (token #${tokenCount}):`, {
                            length: assistantMessage.length,
                            content: assistantMessage,
                            last_100_chars: assistantMessage.slice(-100),
                            has_newlines: assistantMessage.includes('\n'),
                            newline_count: (assistantMessage.match(/\n/g) || []).length
                        });
                    }

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
