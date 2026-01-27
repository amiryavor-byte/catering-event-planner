
"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface SalesCoachChatProps {
    currentPitch: string;
    onUpdatePitch: (newPitch: string) => void;
    onClose: () => void;
}

export function SalesCoachChat({ currentPitch, onUpdatePitch, onClose }: SalesCoachChatProps) {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Hi! I'm your Sales Coach. Tell me about your prospect. Do they own a restaurant? Do they rent a kitchen? Or maybe they do onsite catering only?" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Click outside handler
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                onClose();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);


    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/sales-coach', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg, currentPitch })
            });
            const data = await res.json();

            if (data.reply) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting to the sales brain. Try again?" }]);
        } finally {
            setLoading(false);
        }
    };

    // Allow Enter to send
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                ref={popoverRef}
                className="absolute bottom-16 right-0 z-50 w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden ring-1 ring-black/5"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex justify-between items-center shadow-md">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🤖</span>
                        <div>
                            <h3 className="font-bold text-sm">AI Sales Coach</h3>
                            <p className="text-xs text-blue-100">Brainstorming Assistant</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white pb-3">x</button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${m.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-br-none'
                                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                                }`}>
                                {m.content}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-white border p-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-3 bg-white border-t">
                    <div className="flex gap-2">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                            className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!input.trim() || loading}
                            className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            ➤
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
