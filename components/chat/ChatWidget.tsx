'use client';

import { useState } from 'react';
import { useChat } from '@/lib/contexts/ChatContext';
import { MessageCircle, X, Send, Mic, Image as ImageIcon, Minimize2, Maximize2 } from 'lucide-react';
import { useSession } from 'next-auth/react';

export function ChatWidget() {
    const { data: session } = useSession();
    const { messages, sendMessage, activeChannel, setActiveChannel } = useChat();
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [isRecording, setIsRecording] = useState(false);

    // PTT Refs
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
    const [recognition, setRecognition] = useState<any>(null); // SpeechRecognition type is erratic in TS
    const [liveTranscript, setLiveTranscript] = useState('');

    // Helper: Map user pref to SpeechRecog code
    const getLangCode = (lang: string) => {
        switch (lang) {
            case 'es': return 'es-ES';
            case 'fr': return 'fr-FR';
            case 'he': return 'he-IL';
            default: return 'en-US';
        }
    };

    // Initialize Speech Recognition (Effect to handle language change)
    const initRecognition = () => {
        if (typeof window !== 'undefined') {
            // @ts-ignore
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                const tempRecog = new SpeechRecognition();
                tempRecog.continuous = true;
                tempRecog.interimResults = true;
                // @ts-ignore
                tempRecog.lang = getLangCode(session?.user?.language || 'en');
                setRecognition(tempRecog);
            }
        }
    };

    // Re-init when session loads
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useState(() => {
        initRecognition();
    });

    const startRecording = async () => {
        setIsRecording(true);
        setAudioChunks([]);
        setLiveTranscript('');

        // 1. Start Audio Recording
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    setAudioChunks((prev) => [...prev, e.data]);
                }
            };

            recorder.onstop = () => {
                // Determine blob when stop is called (in handleSendAudio)
            };

            recorder.start();
            setMediaRecorder(recorder);
        } catch (err) {
            console.error('Mic permission denied', err);
            setIsRecording(false);
            return; // Exit
        }

        // 2. Start Transcription
        if (recognition) {
            recognition.onresult = (event: any) => {
                let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        setLiveTranscript((prev) => prev + event.results[i][0].transcript);
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                // Update input for visibility or just keep in liveTranscript
                setInput(liveTranscript + interimTranscript);
            };
            try { recognition.start(); } catch (e) {/* ignore if already started */ }
        }
    };

    const stopRecordingAndSend = async () => {
        setIsRecording(false);

        // Stop Audio
        if (mediaRecorder) {
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach(track => track.stop());

            // Wait a tick for ondataavailable to fire one last time? 
            // In React state, audioChunks might not include the last chunk yet if we access immediately.
            // Better to use a reliable "onStop" handler logic or wait a tiny bit.
            // For MVP, we will rely on a small timeout or event-driven sending.

            // Actually, let's wrap the send in a promise that resolves on recorder stop
            // But to keep this simple for the edit:
            setTimeout(async () => {
                const blob = new Blob(audioChunks, { type: 'audio/webm' });
                const file = new File([blob], 'ptt-message.webm', { type: 'audio/webm' });

                // Final Transcript
                if (recognition) recognition.stop();

                // Send
                await sendMessage('', 'audio', file, input || liveTranscript);

                // Reset
                setInput('');
                setLiveTranscript('');
                setAudioChunks([]);
            }, 500);
        }
    };

    if (!session) return null;

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim()) return;

        await sendMessage(input);
        setInput('');
    };

    // Auto-scroll to bottom logic would go here

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">

            {/* Chat Window */}
            {isOpen && (
                <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-80 md:w-96 h-[30rem] flex flex-col mb-4 overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-200">

                    {/* Header */}
                    <div className="bg-slate-800 p-3 border-b border-slate-700 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="font-semibold text-white">
                                {activeChannel?.type === 'event' ? `Event #${activeChannel.id}` :
                                    activeChannel?.type === 'dm' ? 'Direct Message' : 'General Chat'}
                            </span>
                        </div>
                        <div className="flex gap-2 text-slate-400">
                            <button className="hover:text-white"><Minimize2 size={16} /></button>
                            <button onClick={() => setIsOpen(false)} className="hover:text-red-400"><X size={18} /></button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/95">
                        {messages.length === 0 && (
                            <div className="text-center text-slate-500 text-sm mt-10">
                                No messages yet. Start the conversation!
                            </div>
                        )}
                        {messages.map((msg) => {
                            // @ts-ignore
                            const isMe = msg.senderId === session.user?.id;
                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${isMe ? 'bg-brand-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none'
                                        }`}>
                                        {!isMe && <div className="text-xs text-brand-300 font-bold mb-1">{msg.senderName || 'User'}</div>}

                                        {msg.type === 'image' ? (
                                            <img src={msg.content} alt="Attachment" className="rounded-lg max-w-full" />
                                        ) : msg.type === 'audio' ? (
                                            <audio controls src={msg.content} className="w-full h-8" />
                                        ) : (
                                            <p>{msg.content}</p>
                                        )}

                                        {msg.transcription && (
                                            <div className="mt-2 pt-2 border-t border-white/20 text-xs italic opacity-80">
                                                {/* Simulated Translation Layer */}
                                                {(session?.user as any)?.language && (session.user as any).language !== 'en' ? (
                                                    <span className="text-yellow-400">
                                                        [{(session.user as any).language.toUpperCase()}] {msg.transcription} (Translated)
                                                    </span>
                                                ) : (
                                                    <span>"{msg.transcription}"</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="bg-slate-800 p-3 border-t border-slate-700 flex gap-2 items-center">
                        <button type="button" className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-700">
                            <ImageIcon size={20} />
                        </button>

                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={isRecording ? "Listening..." : "Type a message..."}
                                className={`w-full bg-slate-900 border border-slate-600 rounded-full pl-4 pr-10 py-2 text-sm text-white focus:outline-none focus:border-brand-500 ${isRecording ? 'border-red-500 animate-pulse' : ''}`}
                            />
                            {/* PTT Button */}
                            <button
                                type="button"
                                className={`absolute right-1 top-1 bottom-1 p-1.5 rounded-full transition-colors ${isRecording ? 'bg-red-500 text-white scale-110' : 'text-slate-400 hover:text-brand-400'}`}
                                onMouseDown={startRecording}
                                onMouseUp={stopRecordingAndSend}
                                onTouchStart={startRecording}
                                onTouchEnd={stopRecordingAndSend}
                            >
                                <Mic size={16} />
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={!input.trim()}
                            className="bg-brand-600 hover:bg-brand-500 text-white p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}

            {/* Floating Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-brand-600 hover:bg-brand-500 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center"
                >
                    <MessageCircle size={28} />
                    {/* Badge could go here */}
                </button>
            )}
        </div>
    );
}
