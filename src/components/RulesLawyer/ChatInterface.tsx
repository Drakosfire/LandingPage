import React, { useState, useRef, useEffect } from 'react';
import { useChatContext } from '../../context/ChatContext';
import './ChatInterface.css';

const ChatInterface: React.FC = () => {
    const [message, setMessage] = useState('');
    const [embeddingLoaded, setEmbeddingLoaded] = useState(false);
    const { chatHistory, sendMessage, currentEmbedding, setCurrentEmbedding } = useChatContext();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Add example prompts
    const examplePrompts = [
        "What level can a wizard learn fireball?",
        "What roll would a bard use to seduce a dragon?",
        "What do I roll to run away from an angry dragon?"
    ];

    // Add handler for prompt clicks
    const handlePromptClick = (prompt: string) => {
        setMessage(prompt);
    };

    // Chat history updates handled by component state

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const chatMessagesElement = document.querySelector('.chat-messages');
        if (chatMessagesElement) {
            const isNearBottom = chatMessagesElement.scrollHeight - chatMessagesElement.scrollTop <= chatMessagesElement.clientHeight + 50;
            if (isNearBottom) {
                scrollToBottom();
            }
        }
    }, [chatHistory]);

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory]);

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

            <div className="chat-messages">
                {chatHistory.map((msg, index) => {
                    return (
                        <div key={index} className={`message ${msg.role}`}>
                            {msg.role === 'assistant' && (
                                <div className="message-header">
                                    {'Rules Lawyer'}
                                </div>
                            )}
                            <p>{msg.content}</p>
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
                        embeddingLoaded
                            ? `Ask the ${'Rules Lawyer'} a question...`
                            : 'Select a ruleset to query...'
                    }
                />
                <button type="submit">Send</button>
            </form>

        </div>
    );
};

export default ChatInterface;
