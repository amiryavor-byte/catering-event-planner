
"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface UserSelectionModalProps {
    isOpen: boolean;
    onSelect: (user: 'Amir' | 'David') => void;
}

export function UserSelectionModal({ isOpen, onSelect }: UserSelectionModalProps) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-md p-6 bg-white rounded-xl shadow-2xl overflow-hidden"
                >
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
                        <p className="text-gray-500 mt-2">Please select your identity to begin editing.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => onSelect('Amir')}
                            className="flex flex-col items-center justify-center p-6 border-2 border-transparent hover:border-blue-500 bg-gray-50 hover:bg-blue-50 rounded-xl transition-all group"
                        >
                            <div className="w-16 h-16 mb-3 rounded-full bg-blue-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                👨‍💻
                            </div>
                            <span className="font-semibold text-gray-900">Amir</span>
                            <span className="text-xs text-gray-500 mt-1">Technical Co-Founder</span>
                        </button>

                        <button
                            onClick={() => onSelect('David')}
                            className="flex flex-col items-center justify-center p-6 border-2 border-transparent hover:border-green-500 bg-gray-50 hover:bg-green-50 rounded-xl transition-all group"
                        >
                            <div className="w-16 h-16 mb-3 rounded-full bg-green-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                💼
                            </div>
                            <span className="font-semibold text-gray-900">David</span>
                            <span className="text-xs text-gray-500 mt-1">Sales Co-Founder</span>
                        </button>
                    </div>

                    <div className="mt-6 text-center text-xs text-gray-400">
                        Session is versioned and auto-saved.
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
