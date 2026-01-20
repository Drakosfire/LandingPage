import React, { createContext, useState, useContext, useEffect } from 'react';
import { DUNGEONMIND_API_URL } from '../config';
import { trackGenerationTime } from '../shared/GenerationDrawerEngine/hooks';
import { useAuth } from './AuthContext';

interface Message {
    role: 'user' | 'assistant' | 'error';
    content: string;
}

interface ChatContextType {
    chatHistory: Message[];
    currentEmbedding: string;
    embeddingsLoaded: boolean;
    isLoadingEmbeddings: boolean;
    progressEvents: RetrievalProgress[];
    debugState: DebugState | null;
    savedRules: SavedRule[];
    sendMessage: (message: string) => Promise<void>;
    setCurrentEmbedding: (embedding: string) => void;
    loadEmbedding: (embeddingId: string) => Promise<void>;
    clearMessages: () => void;
    saveRule: (payload: SaveRulePayload) => Promise<void>;
    loadSavedRules: () => Promise<void>;
    updateSavedRule: (ruleId: string, payload: UpdateSavedRulePayload) => Promise<void>;
    deleteSavedRule: (ruleId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Default embedding to load on page access
const DEFAULT_EMBEDDING = 'DnD_PHB_55';

const normalizeErrorDetail = (detail: unknown, response: Response) => {
    if (typeof detail === 'string' && detail.trim()) return detail;
    if (Array.isArray(detail)) {
        const messages = detail
            .map((item) => {
                if (typeof item === 'string') return item;
                if (item && typeof item === 'object') {
                    const maybeMessage = (item as { msg?: string; detail?: string }).msg || (item as { detail?: string }).detail;
                    return maybeMessage || JSON.stringify(item);
                }
                return String(item);
            })
            .filter(Boolean);
        if (messages.length > 0) return messages.join('; ');
    }
    if (detail && typeof detail === 'object') {
        return JSON.stringify(detail);
    }
    return `HTTP ${response.status}: ${response.statusText}`;
};

const getErrorMessageFromResponse = async (response: Response) => {
    try {
        const data = await response.json();
        if (data && typeof data === 'object' && 'detail' in data) {
            return normalizeErrorDetail((data as { detail?: unknown }).detail, response);
        }
        return normalizeErrorDetail(data, response);
    } catch (error) {
        try {
            const text = await response.text();
            if (text.trim()) return text;
        } catch {
            // Ignore nested parse errors.
        }
        return normalizeErrorDetail(undefined, response);
    }
};

interface RetrievalProgress {
    stage: 'embedding' | 'search' | 'rerank' | 'context' | 'generation' | 'complete';
    message: string;
    metadata?: {
        chunksSearched?: number;
        matchesFound?: number;
        topSimilarity?: number;
        processingTimeMs?: number;
        tokensUsed?: number;
        query?: string;
        rulebookId?: string | null;
        systemPrompt?: string;
        prompt?: string;
        chunks?: DebugChunk[];
        timings?: DebugTimings;
        sizes?: DebugSizes;
        tokenCount?: number;
        yieldedCount?: number;
    };
}

interface DebugChunk {
    page?: number | string;
    content: string;
    source?: string;
    section?: string;
    score?: number;
    lexicalScore?: number;
    semanticScore?: number;
}

interface DebugTimings {
    searchMs?: number;
    contextMs?: number;
    promptMs?: number;
    openaiMs?: number;
    totalMs?: number;
    timeToFirstTokenMs?: number | null;
}

interface DebugSizes {
    systemPromptChars?: number;
    promptChars?: number;
    totalPromptChars?: number;
    contextChars?: number;
    chunkCount?: number;
    responseChars?: number;
}

interface DebugState {
    query?: string;
    rulebookId?: string | null;
    systemPrompt?: string;
    prompt?: string;
    chunks?: DebugChunk[];
    timings?: DebugTimings;
    sizes?: DebugSizes;
    tokenCount?: number;
    yieldedCount?: number;
}

export interface SavedRule {
    id: string;
    rulebookId: string;
    queryText: string;
    responseText: string;
    citations: Array<{ page: number; source?: string; section?: string; link?: string }>;
    tags: string[];
    createdAt?: string;
}

export interface SaveRulePayload {
    rulebookId: string;
    queryText: string;
    responseText: string;
    citations: Array<{ page: number; source?: string; section?: string; link?: string }>;
    tags?: string[];
}

export interface UpdateSavedRulePayload {
    queryText?: string;
    responseText?: string;
    citations?: Array<{ page: number; source?: string; section?: string; link?: string }>;
    tags?: string[];
}

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isLoggedIn } = useAuth();
    const [chatHistory, setChatHistory] = useState<Message[]>([]);
    const [currentEmbedding, setCurrentEmbedding] = useState<string>(DEFAULT_EMBEDDING);
    const [embeddingsLoaded, setEmbeddingsLoaded] = useState<boolean>(false);
    const [isLoadingEmbeddings, setIsLoadingEmbeddings] = useState<boolean>(false);
    const [progressEvents, setProgressEvents] = useState<RetrievalProgress[]>([]);
    const [debugState, setDebugState] = useState<DebugState | null>(null);
    const [savedRules, setSavedRules] = useState<SavedRule[]>([]);

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
                    if (data.embeddingsLoaded) {
                        setEmbeddingsLoaded(true);
                        if (data.activeRulebookId) {
                            setCurrentEmbedding(data.activeRulebookId);
                        }
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
                const errorMessage = await getErrorMessageFromResponse(response);
                throw new Error(errorMessage || `HTTP ${response.status}: ${response.statusText}`);
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

    const loadSavedRules = async () => {
        if (!isLoggedIn) {
            const saved = localStorage.getItem('ruleslawyer_saved_rules');
            if (saved) {
                setSavedRules(JSON.parse(saved));
            }
            return;
        }

        const response = await fetch(`${DUNGEONMIND_API_URL}/api/ruleslawyer/saved-rules`, {
            method: 'GET',
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            setSavedRules(data.rules || []);
        }
    };

    const saveRule = async (payload: SaveRulePayload) => {
        const rulebookId = payload.rulebookId?.trim();
        const queryText = payload.queryText?.trim();
        const responseText = payload.responseText?.trim();
        const citations = (payload.citations || []).filter(
            (citation) => Number.isFinite(citation.page) && citation.page >= 1
        );
        const tags = payload.tags || [];

        if (!rulebookId || !queryText || !responseText) {
            console.warn('⚠️ [RulesLawyer] Save rule skipped - missing required fields', {
                rulebookId,
                queryTextLength: queryText?.length ?? 0,
                responseTextLength: responseText?.length ?? 0,
            });
            throw new Error('Missing required fields to save rule.');
        }

        if (!isLoggedIn) {
            const next = [
                { id: `local-${Date.now()}`, rulebookId, queryText, responseText, citations, tags },
                ...savedRules,
            ];
            setSavedRules(next);
            localStorage.setItem('ruleslawyer_saved_rules', JSON.stringify(next));
            return;
        }

        const response = await fetch(`${DUNGEONMIND_API_URL}/api/ruleslawyer/saved-rules`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ rulebookId, queryText, responseText, citations, tags })
        });

        if (response.ok) {
            const saved = await response.json();
            setSavedRules((prev) => [saved, ...prev]);
        } else {
            const errorMessage = await getErrorMessageFromResponse(response);
            throw new Error(errorMessage || 'Failed to save rule');
        }
    };

    const updateSavedRule = async (ruleId: string, payload: UpdateSavedRulePayload) => {
        if (!isLoggedIn) {
            const next = savedRules.map((rule) =>
                rule.id === ruleId
                    ? {
                          ...rule,
                          ...payload,
                          tags: payload.tags ?? rule.tags,
                          citations: payload.citations ?? rule.citations,
                      }
                    : rule
            );
            setSavedRules(next);
            localStorage.setItem('ruleslawyer_saved_rules', JSON.stringify(next));
            return;
        }

        const response = await fetch(`${DUNGEONMIND_API_URL}/api/ruleslawyer/saved-rules/${ruleId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorMessage = await getErrorMessageFromResponse(response);
            throw new Error(errorMessage || 'Failed to update saved rule');
        }

        const updated = await response.json();
        setSavedRules((prev) => prev.map((rule) => (rule.id === ruleId ? updated : rule)));
    };

    const deleteSavedRule = async (ruleId: string) => {
        if (!isLoggedIn) {
            const next = savedRules.filter((rule) => rule.id !== ruleId);
            setSavedRules(next);
            localStorage.setItem('ruleslawyer_saved_rules', JSON.stringify(next));
            return;
        }

        const response = await fetch(`${DUNGEONMIND_API_URL}/api/ruleslawyer/saved-rules/${ruleId}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (!response.ok) {
            const errorMessage = await getErrorMessageFromResponse(response);
            throw new Error(errorMessage || 'Failed to delete saved rule');
        }

        setSavedRules((prev) => prev.filter((rule) => rule.id !== ruleId));
    };

    useEffect(() => {
        loadSavedRules();
    }, [isLoggedIn]);

    const sendMessage = async (message: string) => {
        setProgressEvents([]);
        // Add user message to UI immediately
        setChatHistory(prev => [...prev, { role: 'user', content: message }]);
        setDebugState((prev) => ({
            ...prev,
            query: message,
            rulebookId: currentEmbedding
        }));

        const requestStartTime = performance.now();
        console.log('🚀 [RulesLawyer] Starting query request:', {
            messageLength: message.length,
            chatHistoryLength: chatHistory.length,
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
                    message,
                    rulebookId: currentEmbedding,
                    chatHistory: chatHistory
                        .filter((msg) => msg.role !== 'error')
                        .map((msg) => ({ role: msg.role, content: msg.content }))
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
                    let parsedContent: string | { type?: string; stage?: string; message?: string; metadata?: RetrievalProgress['metadata'] };
                    try {
                        parsedContent = JSON.parse(dataContent);
                        if (typeof parsedContent === 'string') {
                            console.log(`✅ [RulesLawyer] JSON decoded: length=${parsedContent.length}, has_newlines=${parsedContent.includes('\n')}, newline_count=${(parsedContent.match(/\n/g) || []).length}`);
                        }
                    } catch {
                        // Fallback for non-JSON data (shouldn't happen with fixed backend)
                        console.warn(`⚠️ [RulesLawyer] Failed to parse JSON, using raw: ${dataContent.substring(0, 50)}`);
                        parsedContent = dataContent;
                    }

                    if (typeof parsedContent !== 'string' && parsedContent.type === 'progress') {
                        const progress = {
                            stage: parsedContent.stage || 'search',
                            message: parsedContent.message || 'Working...',
                            metadata: parsedContent.metadata
                        } as RetrievalProgress;
                        setProgressEvents((prev) => [...prev, progress]);
                        if (progress.metadata) {
                            const metadata = progress.metadata;
                            setDebugState((prev) => ({
                                ...prev,
                                query: metadata.query ?? prev?.query,
                                rulebookId: metadata.rulebookId ?? prev?.rulebookId,
                                systemPrompt: metadata.systemPrompt ?? prev?.systemPrompt,
                                prompt: metadata.prompt ?? prev?.prompt,
                                chunks: metadata.chunks ?? prev?.chunks,
                                timings: { ...prev?.timings, ...metadata.timings },
                                sizes: { ...prev?.sizes, ...metadata.sizes },
                                tokenCount: metadata.tokenCount ?? prev?.tokenCount,
                                yieldedCount: metadata.yieldedCount ?? prev?.yieldedCount,
                            }));
                        }
                        if (progress.stage === 'complete' && progress.metadata?.timings?.totalMs) {
                            const timingMetadata: Record<string, string | number> = {
                                rulebookId: progress.metadata.rulebookId || '',
                                searchMs: progress.metadata.timings.searchMs ?? 0,
                                contextMs: progress.metadata.timings.contextMs ?? 0,
                                promptMs: progress.metadata.timings.promptMs ?? 0,
                                openaiMs: progress.metadata.timings.openaiMs ?? 0,
                                totalMs: progress.metadata.timings.totalMs ?? 0,
                                timeToFirstTokenMs: progress.metadata.timings.timeToFirstTokenMs ?? 0,
                                promptChars: progress.metadata.sizes?.promptChars ?? 0,
                                systemPromptChars: progress.metadata.sizes?.systemPromptChars ?? 0,
                                totalPromptChars: progress.metadata.sizes?.totalPromptChars ?? 0,
                                contextChars: progress.metadata.sizes?.contextChars ?? 0,
                                responseChars: progress.metadata.sizes?.responseChars ?? 0,
                                chunkCount: progress.metadata.sizes?.chunkCount ?? 0,
                                tokenCount: progress.metadata.tokenCount ?? 0,
                                yieldedCount: progress.metadata.yieldedCount ?? 0,
                            };

                            trackGenerationTime(
                                'ruleslawyer',
                                'text',
                                progress.metadata.timings.totalMs,
                                timingMetadata
                            );
                        }
                        continue;
                    }

                    const messageDelta = typeof parsedContent === 'string' ? parsedContent : dataContent;
                    // Append token to message (newlines now preserved via JSON encoding!)
                    assistantMessage += messageDelta;
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
            progressEvents,
            debugState,
            savedRules,
            sendMessage,
            setCurrentEmbedding,
            loadEmbedding,
            clearMessages,
            saveRule,
            loadSavedRules,
            updateSavedRule,
            deleteSavedRule,
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
