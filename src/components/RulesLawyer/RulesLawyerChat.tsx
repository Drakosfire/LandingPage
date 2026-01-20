import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button, Group, Paper, Stack, Text, Textarea } from '@mantine/core';
import { RULESLAWYER_ASSET_BASE_URL } from '../../config';
import { useChatContext } from '../../context/ChatContext';
import { getRulebookPrompts } from './promptSets';
import './RulesLawyer.css';

const LOADING_ANIMATION_CDN =
    'https://imagedelivery.net/SahcvrNe_-ej4lTB6vsAZA/caa1004e-9a74-4e4b-ac83-c821abca0900/blogpost';

interface RulesLawyerChatProps {
    rulebookTitle?: string;
}

const RulesLawyerChat: React.FC<RulesLawyerChatProps> = ({ rulebookTitle }) => {
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [loadingSrc, setLoadingSrc] = useState(LOADING_ANIMATION_CDN);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const shouldAutoScrollRef = useRef(true);
    const remarkPlugins = useMemo(() => [remarkGfm], []);

    const {
        chatHistory,
        sendMessage,
        embeddingsLoaded,
        isLoadingEmbeddings,
        progressEvents,
        saveRule,
        currentEmbedding
    } = useChatContext();

    const examplePrompts = useMemo(
        () => getRulebookPrompts({ id: currentEmbedding, title: rulebookTitle }),
        [currentEmbedding, rulebookTitle]
    );

    const scrollToBottom = (behavior: ScrollBehavior) => {
        const container = messagesContainerRef.current;
        if (!container) return;
        container.scrollTo({ top: container.scrollHeight, behavior });
    };

    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
            shouldAutoScrollRef.current = distanceFromBottom <= 60;
        };

        container.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (chatHistory.length === 0) return;
        if (!shouldAutoScrollRef.current) return;
        if (!messagesContainerRef.current) return;
        scrollToBottom(isSending ? 'auto' : 'smooth');
    }, [chatHistory, isSending]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!message.trim()) return;

        setIsSending(true);
        await sendMessage(message.trim());
        setMessage('');
        setIsSending(false);
    };

    const extractCitations = (content: string) => {
        const match = content.match(/Citations:\s*([^\n]+)/i);
        if (!match) return [];
        return match[1]
            .split(',')
            .map((part) => part.trim().replace(/[^\d]/g, ''))
            .filter(Boolean)
            .map((page) => ({ page: Number(page) }));
    };

    const handleLoadingError = () => {
        const fallbackSrc = `${RULESLAWYER_ASSET_BASE_URL}/loading-spinner.svg`;
        if (loadingSrc !== fallbackSrc) {
            console.warn('⚠️ [RulesLawyer] Loading animation failed, using fallback asset.');
            setLoadingSrc(fallbackSrc);
        }
    };

    return (
        <Stack gap="md" className="ruleslawyer-chat">
            <Paper withBorder p="md" className="ruleslawyer-chat__messages" ref={messagesContainerRef}>
                <Stack gap="sm">
                    {chatHistory.map((msg, index) => {
                        const isAssistant = msg.role === 'assistant';
                        const previousUser = isAssistant ? chatHistory[index - 1] : null;
                        const canSave = isAssistant && previousUser?.role === 'user';

                        return (
                        <div
                            key={`${msg.role}-${index}`}
                            className={`ruleslawyer-chat__message ruleslawyer-chat__message--${msg.role}`}
                        >
                            {isAssistant && (
                                <Group justify="space-between" align="center" mb="xs">
                                    <Text size="xs" fw={600} className="ruleslawyer-chat__message-header">
                                        Rules Lawyer
                                    </Text>
                                    {canSave && (
                                        <Button
                                            size="xs"
                                            variant="light"
                                            onClick={() => saveRule({
                                                rulebookId: currentEmbedding,
                                                queryText: previousUser?.content || '',
                                                responseText: msg.content,
                                                citations: extractCitations(msg.content)
                                            })}
                                        >
                                            Save Rule
                                        </Button>
                                    )}
                                </Group>
                            )}
                            {isAssistant ? (
                                <ReactMarkdown
                                    className="ruleslawyer-chat__message-content markdown"
                                    remarkPlugins={remarkPlugins}
                                >
                                    {msg.content}
                                </ReactMarkdown>
                            ) : (
                                <Text size="sm">{msg.content}</Text>
                            )}
                        </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </Stack>
            </Paper>

            {progressEvents.length > 0 && (
                <Paper withBorder p="sm" className="ruleslawyer-chat__progress">
                    <Stack gap="xs">
                        {progressEvents.map((event, idx) => (
                            <Text size="xs" key={`${event.stage}-${idx}`}>
                                {event.message}
                            </Text>
                        ))}
                    </Stack>
                </Paper>
            )}

            {(isSending || isLoadingEmbeddings) && (
                <div className="ruleslawyer-chat__loading">
                    <img
                        src={loadingSrc}
                        onError={handleLoadingError}
                        alt="Loading response"
                        width={96}
                        height={96}
                    />
                </div>
            )}

            <div className="ruleslawyer-chat__prompts">
                <Text size="sm" fw={500} mb={4}>
                    Quick prompts
                </Text>
                <Group gap="sm" wrap="wrap" className="ruleslawyer-chat__prompt-list">
                    {examplePrompts.map((prompt) => (
                        <Button
                            key={prompt}
                            variant="light"
                            size="xs"
                            className="ruleslawyer-chat__prompt-button"
                            onClick={() => setMessage(prompt)}
                        >
                            {prompt}
                        </Button>
                    ))}
                </Group>
            </div>

            <form onSubmit={handleSubmit} className="ruleslawyer-chat__input">
                <Textarea
                    value={message}
                    onChange={(event) => setMessage(event.currentTarget.value)}
                    placeholder={embeddingsLoaded ? 'Ask a rules question...' : 'Select a ruleset to query...'}
                    minRows={3}
                    autosize
                    disabled={isSending}
                />
                <Group justify="flex-end" mt="sm" className="ruleslawyer-chat__actions">
                    <Button
                        type="submit"
                        disabled={!embeddingsLoaded || isLoadingEmbeddings || isSending || !message.trim()}
                        className="ruleslawyer-chat__send"
                    >
                        Send
                    </Button>
                </Group>
            </form>
        </Stack>
    );
};

export default RulesLawyerChat;
