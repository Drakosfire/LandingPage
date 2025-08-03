import React, { useState, useEffect } from 'react';
import { Alert, Text, Badge } from '@mantine/core';

interface SuccessCelebrationProps {
    type: 'text' | 'image' | 'border' | 'assembly';
    itemName?: string;
    onComplete?: () => void;
}

const SuccessCelebration: React.FC<SuccessCelebrationProps> = ({
    type,
    itemName,
    onComplete
}) => {
    const [showConfetti, setShowConfetti] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowConfetti(false);
            if (onComplete) {
                onComplete();
            }
        }, 3000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    const celebrations = {
        text: { emoji: "📝", message: "Description enhanced with magic!", color: "blue" },
        image: { emoji: "🎨", message: "Beautiful images created!", color: "purple" },
        border: { emoji: "✨", message: "Stylish borders applied!", color: "gold" },
        assembly: { emoji: "🔮", message: "Your card is ready!", color: "green" }
    };

    const celebration = celebrations[type];

    return (
        <Alert
            icon={<span style={{ fontSize: '1.5rem' }}>{celebration.emoji}</span>}
            color={celebration.color}
            variant="light"
            style={{
                animation: 'slideIn 0.5s ease-out',
                marginBottom: '1rem'
            }}
        >
            <Text fw={500}>{celebration.message}</Text>
            {itemName && (
                <Text size="sm" c="dimmed">"{itemName}" is looking great!</Text>
            )}
            {showConfetti && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    overflow: 'hidden'
                }}>
                    {/* Simple confetti effect */}
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            style={{
                                position: 'absolute',
                                width: '8px',
                                height: '8px',
                                backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'][i % 5],
                                left: `${Math.random() * 100}%`,
                                top: '-10px',
                                animation: `confetti 3s linear forwards`,
                                animationDelay: `${Math.random() * 0.5}s`,
                                borderRadius: '50%'
                            }}
                        />
                    ))}
                </div>
            )}
        </Alert>
    );
};

export default SuccessCelebration; 