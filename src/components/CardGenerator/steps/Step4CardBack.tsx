import React, { useState } from 'react';
import '../../../styles/DesignSystem.css';

interface Step4CardBackProps {
}

const Step4CardBack: React.FC<Step4CardBackProps> = () => {
    const [selectedCardBack, setSelectedCardBack] = useState<string>('');
    const [customText, setCustomText] = useState<string>('');
    const [backStyle, setBackStyle] = useState<'standard' | 'custom' | 'generated'>('standard');

    const cardBackOptions = [
        {
            id: 'standard-fantasy',
            name: 'Standard Fantasy',
            image: '/api/placeholder/150/200',
            description: 'Classic D&D-style back with mystical symbols'
        },
        {
            id: 'vintage-parchment',
            name: 'Vintage Parchment',
            image: '/api/placeholder/150/200',
            description: 'Aged paper with elegant flourishes'
        },
        {
            id: 'arcane-symbols',
            name: 'Arcane Symbols',
            image: '/api/placeholder/150/200',
            description: 'Magical runes and arcane circles'
        },
        {
            id: 'guild-crest',
            name: 'Guild Crest',
            image: '/api/placeholder/150/200',
            description: 'Customizable with your guild or party insignia'
        }
    ];

    const isStepValid = () => {
        if (backStyle === 'standard') {
            return selectedCardBack !== '';
        } else if (backStyle === 'custom') {
            return customText.trim() !== '';
        }
        return true; // Generated backs are always valid
    };

    return (
        <div
            id="step-panel-card-back"
            role="tabpanel"
            aria-labelledby="step-tab-card-back"
            className="step-panel"
        >
            <div className="container">
                <div className="mb-6">
                    <div className="step-card">
                        <div className="step-card-header">
                            <h2 className="step-card-title">
                                Card Back Generation
                            </h2>
                            <p className="step-card-description">
                                Complete your card with a professional back design. Choose from our collection,
                                customize with your own text, or let AI generate a unique back.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Back Style Options */}
                    <div className="lg:col-span-2">
                        <div className="step-card">
                            <div className="step-card-header">
                                <h3 className="step-card-title" style={{ fontSize: 'var(--text-lg)' }}>
                                    Back Style Options
                                </h3>
                                <p className="step-card-description">
                                    Choose how you want to create your card back.
                                </p>
                            </div>

                            {/* Style Selection Tabs */}
                            <div className="flex gap-2 mb-6" style={{ borderBottom: '1px solid var(--border-light)' }}>
                                <button
                                    onClick={() => setBackStyle('standard')}
                                    className={`step-tab ${backStyle === 'standard' ? 'active' : ''}`}
                                    style={{ flex: 1 }}
                                >
                                    <span className="step-icon">🎨</span>
                                    Standard Templates
                                </button>
                                <button
                                    onClick={() => setBackStyle('custom')}
                                    className={`step-tab ${backStyle === 'custom' ? 'active' : ''}`}
                                    style={{ flex: 1 }}
                                >
                                    <span className="step-icon">✏️</span>
                                    Custom Text
                                </button>
                                <button
                                    onClick={() => setBackStyle('generated')}
                                    className={`step-tab ${backStyle === 'generated' ? 'active' : ''}`}
                                    style={{ flex: 1 }}
                                >
                                    <span className="step-icon">🤖</span>
                                    AI Generated
                                </button>
                            </div>

                            {/* Standard Templates */}
                            {backStyle === 'standard' && (
                                <div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {cardBackOptions.map((option) => (
                                            <div
                                                key={option.id}
                                                className={`cursor-pointer border-2 border-radius-lg p-3 transition-all ${selectedCardBack === option.id
                                                    ? 'border-color-primary-blue bg-primary-blue-light'
                                                    : 'border-color-border-light hover:border-color-primary-blue'
                                                    }`}
                                                style={{
                                                    borderColor: selectedCardBack === option.id ? 'var(--primary-blue)' : 'var(--border-light)',
                                                    backgroundColor: selectedCardBack === option.id ? 'rgba(74, 144, 226, 0.1)' : 'transparent',
                                                    borderRadius: 'var(--radius-lg)'
                                                }}
                                                onClick={() => setSelectedCardBack(option.id)}
                                            >
                                                <div style={{
                                                    width: '100%',
                                                    height: '120px',
                                                    backgroundColor: 'var(--surface-light)',
                                                    borderRadius: 'var(--radius-base)',
                                                    marginBottom: 'var(--space-2)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '2rem'
                                                }}>
                                                    🂠
                                                </div>
                                                <h4 style={{
                                                    fontSize: 'var(--text-sm)',
                                                    fontWeight: 'var(--font-medium)',
                                                    margin: '0 0 var(--space-1) 0',
                                                    color: 'var(--text-primary)'
                                                }}>
                                                    {option.name}
                                                </h4>
                                                <p style={{
                                                    fontSize: 'var(--text-xs)',
                                                    color: 'var(--text-secondary)',
                                                    margin: 0,
                                                    lineHeight: 'var(--leading-normal)'
                                                }}>
                                                    {option.description}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Custom Text */}
                            {backStyle === 'custom' && (
                                <div>
                                    <div className="form-group">
                                        <label className="form-label">
                                            Custom Text for Card Back
                                        </label>
                                        <textarea
                                            className="form-input form-textarea"
                                            value={customText}
                                            onChange={(e) => setCustomText(e.target.value)}
                                            placeholder="Enter custom text, quotes, lore, or any content for your card back..."
                                            rows={6}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="form-label">Font Style</label>
                                            <select className="form-input">
                                                <option>Elegant Script</option>
                                                <option>Ancient Runes</option>
                                                <option>Modern Clean</option>
                                                <option>Handwritten</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="form-label">Background Pattern</label>
                                            <select className="form-input">
                                                <option>Parchment Texture</option>
                                                <option>Mystic Symbols</option>
                                                <option>Solid Color</option>
                                                <option>Watermark Pattern</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* AI Generated */}
                            {backStyle === 'generated' && (
                                <div>
                                    <div className="text-center py-8" style={{
                                        background: 'linear-gradient(135deg, rgba(74, 144, 226, 0.05), rgba(126, 211, 33, 0.05))',
                                        border: '2px dashed var(--primary-blue)',
                                        borderRadius: 'var(--radius-lg)'
                                    }}>
                                        <div className="text-4xl mb-4">🤖</div>
                                        <h4 style={{
                                            fontSize: 'var(--text-lg)',
                                            fontWeight: 'var(--font-semibold)',
                                            color: 'var(--text-primary)',
                                            margin: '0 0 var(--space-2) 0'
                                        }}>
                                            AI Back Generation
                                        </h4>
                                        <p style={{
                                            fontSize: 'var(--text-base)',
                                            color: 'var(--text-secondary)',
                                            margin: '0 0 var(--space-4) 0',
                                            maxWidth: '400px',
                                            marginLeft: 'auto',
                                            marginRight: 'auto'
                                        }}>
                                            Our AI will analyze your item's properties and generate a thematically appropriate card back
                                            that matches your item's lore and style.
                                        </p>
                                        <button className="btn btn-primary">
                                            Generate AI Card Back
                                            <span className="spinner" style={{
                                                width: '16px',
                                                height: '16px',
                                                marginLeft: 'var(--space-2)'
                                            }}></span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Preview Section */}
                    <div className="lg:col-span-1">
                        <div className="preview-card">
                            <h3 className="text-lg font-semibold mb-4" style={{
                                fontFamily: 'var(--font-primary)',
                                color: 'var(--text-primary)'
                            }}>
                                Card Back Preview
                            </h3>

                            {isStepValid() ? (
                                <div>
                                    <div style={{
                                        width: '100%',
                                        height: '300px',
                                        backgroundColor: 'var(--surface-light)',
                                        borderRadius: 'var(--radius-lg)',
                                        border: '2px solid var(--primary-blue)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: 'var(--space-4)',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            textAlign: 'center',
                                            color: 'var(--text-muted)'
                                        }}>
                                            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-2)' }}>🂠</div>
                                            <p style={{ fontSize: 'var(--text-sm)' }}>Card Back Preview</p>
                                            {backStyle === 'custom' && customText && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    left: '50%',
                                                    transform: 'translate(-50%, -50%)',
                                                    fontSize: 'var(--text-xs)',
                                                    color: 'var(--text-secondary)',
                                                    maxWidth: '80%',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }}>
                                                    {customText.substring(0, 50)}...
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <span style={{
                                            color: 'var(--success-green)',
                                            fontSize: 'var(--text-sm)',
                                            fontWeight: 'var(--font-medium)'
                                        }}>
                                            ✓ Card back ready
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                                    <div className="text-2xl mb-2">🂠</div>
                                    <p className="text-sm">
                                        Choose a card back style to see the preview.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Step Status */}
                <div className="text-center" style={{
                    marginTop: 'var(--space-6)',
                    paddingTop: 'var(--space-4)',
                    borderTop: '1px solid var(--border-light)'
                }}>
                    {isStepValid() ? (
                        <span style={{ color: 'var(--success-green)', fontSize: 'var(--text-sm)' }}>
                            ✓ Card back configured - ready to proceed to next step
                        </span>
                    ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                            Please configure your card back to continue
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Step4CardBack; 