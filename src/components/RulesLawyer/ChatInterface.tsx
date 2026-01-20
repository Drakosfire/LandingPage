import React, { useState, useRef, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useChatContext } from '../../context/ChatContext';
import { getRulebookPrompts } from './promptSets';
import './ChatInterface.css';

const ChatInterface: React.FC = () => {
    const [message, setMessage] = useState('');
    const {
        chatHistory,
        sendMessage,
        currentEmbedding,
        embeddingsLoaded,
        isLoadingEmbeddings
    } = useChatContext();
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const shouldAutoScrollRef = useRef(true);
    const [isLoading, setIsLoading] = useState(false);
    const [renderKey, setRenderKey] = useState(0);

    // Memoize remarkPlugins to avoid recreating on every render
    const remarkPlugins = useMemo(() => [remarkGfm], []);

    // Force re-render of markdown when streaming completes
    useEffect(() => {
        if (!isLoading) {
            // Small delay to ensure content is fully updated, then force re-render
            const timer = setTimeout(() => {
                setRenderKey(prev => prev + 1);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isLoading]);

    const examplePrompts = useMemo(
        () => getRulebookPrompts({ id: currentEmbedding }),
        [currentEmbedding]
    );

    // Add handler for prompt clicks
    const handlePromptClick = (prompt: string) => {
        setMessage(prompt);
    };

    // Chat history updates handled by component state

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
        const container = messagesContainerRef.current;
        if (!container) return;
        if (chatHistory.length === 0) return;
        if (!shouldAutoScrollRef.current) return;

        container.scrollTo({ top: container.scrollHeight, behavior: isLoading ? 'auto' : 'smooth' });
    }, [chatHistory, isLoading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setIsLoading(true);
        await sendMessage(message);
        setMessage('');
        setIsLoading(false);
    };

    return (
        // Heading that declares what embedding is loaded

        <div className="chat-container">

            <div className="chat-messages" ref={messagesContainerRef}>
                {chatHistory.map((msg, index) => {
                    const isAssistant = msg.role === 'assistant';
                    const isLastMessage = index === chatHistory.length - 1;
                    // Only force re-render on the last message when streaming completes
                    const markdownKey = isAssistant && isLastMessage
                        ? `assistant-${index}-${renderKey}`
                        : `assistant-${index}`;

                    return (
                        <div key={index} className={`message ${msg.role}`}>
                            {isAssistant && (
                                <div className="message-header">
                                    {'Rules Lawyer'}
                                </div>
                            )}
                            {isAssistant ? (
                                <ReactMarkdown
                                    key={markdownKey}
                                    className="message-content markdown"
                                    remarkPlugins={remarkPlugins}
                                    rehypePlugins={[]}
                                >
                                    {msg.content}
                                </ReactMarkdown>
                            ) : (
                                <p>{msg.content}</p>
                            )}
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
            {isLoading && (
                <div className="loading-indicator">
                    <img src="https://imagedelivery.net/SahcvrNe_-ej4lTB6vsAZA/caa1004e-9a74-4e4b-ac83-c821abca0900/blogpost" alt="Loading animation" height="150" width="150" />
                </div>
            )}
            <h2>Ask a question...</h2>
            <div className="prompt-bubbles">
                {examplePrompts.map((prompt, index) => (
                    <button
                        key={index}
                        className="prompt-bubble"
                        onClick={() => handlePromptClick(prompt)}
                    >
                        {prompt}
                    </button>
                ))}
            </div>
            <form onSubmit={handleSubmit} className="chat-input">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    // Define the height as two lines
                    style={{ height: '4em' }}
                    placeholder={
                        embeddingsLoaded
                            ? `Ask the ${'Rules Lawyer'} a question...`
                            : 'Select a ruleset to query...'
                    }
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoadingEmbeddings || !embeddingsLoaded || isLoading || !message.trim()}>
                    Send
                </button>
            </form>

        </div>
    );
};

export default ChatInterface;
