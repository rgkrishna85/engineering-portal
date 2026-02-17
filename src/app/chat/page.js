'use client';
import { useState, useEffect, useRef } from 'react';

const suggestions = [
    'What is the leave policy?',
    'Show me project hours summary',
    'What are employee workloads?',
    'List all deliverables',
    'What is the travel policy?',
    'Show project status overview',
    'What is the review process?',
    'Show skills matrix',
];

export default function ChatPage() {
    const [messages, setMessages] = useState([
        {
            id: 'welcome',
            sender: 'assistant',
            text: "👋 Hello! I'm **EngineAI Assistant**, your AI-powered helper for engineering operations.\n\nI can help you with:\n- 🏢 **Company Policies** — Leave, travel, review, training, WFH policies\n- 📊 **Project Data** — Status, hours, deliverables, reviews\n- 👥 **Employee Info** — Workload, skills, availability\n\nAsk me anything!",
        },
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const sendMessage = async (text) => {
        const msg = text || input.trim();
        if (!msg) return;

        const userMessage = { id: Date.now().toString(), sender: 'user', text: msg };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: msg }),
            });
            const data = await res.json();

            setTimeout(() => {
                setIsTyping(false);
                setMessages(prev => [...prev, {
                    id: data.id || Date.now().toString() + '-r',
                    sender: 'assistant',
                    text: data.response || 'Sorry, I could not process that request.',
                }]);
            }, 800);
        } catch {
            setIsTyping(false);
            setMessages(prev => [...prev, {
                id: Date.now().toString() + '-err',
                sender: 'assistant',
                text: '⚠️ Sorry, something went wrong. Please try again.',
            }]);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const renderMarkdown = (text) => {
        // Simple markdown rendering
        let html = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br/>')
            .replace(/\|(.+)\|/g, (match) => {
                // Table rendering
                return match;
            })
            .replace(/• /g, '&bull; ')
            .replace(/- /g, '&ndash; ');
        return { __html: html };
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">🤖 AI Assistant</h1>
                <p className="page-subtitle">Ask about policies, project data, employee information, and more</p>
            </div>

            <div className="card chat-container">
                <div className="chat-messages">
                    {messages.map(msg => (
                        <div key={msg.id} className={`chat-message ${msg.sender}`}>
                            <div className="chat-avatar-sm">
                                {msg.sender === 'assistant' ? '🤖' : '👤'}
                            </div>
                            <div className="chat-bubble">
                                <div dangerouslySetInnerHTML={renderMarkdown(msg.text)} />
                            </div>
                        </div>
                    ))}

                    {isTyping && (
                        <div className="chat-message assistant">
                            <div className="chat-avatar-sm">🤖</div>
                            <div className="chat-bubble">
                                <div className="typing-indicator">
                                    <div className="typing-dot" />
                                    <div className="typing-dot" />
                                    <div className="typing-dot" />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {messages.length <= 1 && (
                    <div className="chat-suggestions">
                        {suggestions.map((s, i) => (
                            <button key={i} className="chat-suggestion-btn" onClick={() => sendMessage(s)}>
                                {s}
                            </button>
                        ))}
                    </div>
                )}

                <div className="chat-input-area">
                    <textarea
                        ref={inputRef}
                        className="chat-input"
                        placeholder="Ask about policies, project data, employee workload..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={1}
                    />
                    <button className="chat-send-btn" onClick={() => sendMessage()} disabled={isTyping}>
                        ➤
                    </button>
                </div>
            </div>
        </div>
    );
}
