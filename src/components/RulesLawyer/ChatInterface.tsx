import React, { useState, useRef, useEffect } from 'react';
import { useChatContext } from '../../context/ChatContext';
import './ChatInterface.css';
import LoadingDots from './LoadingDots';

// This is only used for display purposes
const embeddingDisplayNames: { [key: string]: string } = {
    'DnD_PHB_55': 'DnD 2024 PHB Lawyer',
    'swon': 'Stars Without Number Lawyer',
    'swcr': "Swords & Wizardry Complete Revised Lawyer"
};

const ChatInterface: React.FC = () => {
    const [message, setMessage] = useState('');
    const [embeddingLoaded, setEmbeddingLoaded] = useState(false);
    const { chatHistory, sendMessage, currentEmbedding, setCurrentEmbedding } = useChatContext();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        console.log('Chat history updated:', chatHistory);
    }, [chatHistory]);

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
        console.log('Sending message:', message);
        await sendMessage(message);
        console.log('Message sent, current chat history:', chatHistory);
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
            <form onSubmit={handleSubmit} className="chat-input">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                        embeddingLoaded
                            ? `Ask the ${embeddingDisplayNames[currentEmbedding] || 'AI Assistant'} a question...`
                            : 'Select a ruleset to query...'
                    }
                />
                <button type="submit">Send</button>
            </form>
        </div>
    );
};

export default ChatInterface;
