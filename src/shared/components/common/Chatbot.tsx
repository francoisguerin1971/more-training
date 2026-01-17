import React, { useState, useRef, useEffect } from 'react';
import {
    MessageSquare, X, Send,
    Bot, User, Sparkles,
    ChevronDown, Maximize2, Minimize2
} from 'lucide-react';
import { useLanguage } from '@/shared/context/LanguageContext';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { cn } from '@/shared/lib/utils';

export function Chatbot() {
    const { t, language } = useLanguage();
    const { currentUser } = useAuthStore();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: `${t('welcome_back')} ${currentUser?.name || ''}! ${t('chatbot_welcome')}`, sender: 'bot' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const scrollRef = useRef(null);

    // Update welcome message when language changes
    useEffect(() => {
        setMessages(prev => prev.map(msg =>
            msg.id === 1
                ? { ...msg, text: `${t('welcome_back')} ${currentUser?.name || ''}! ${t('chatbot_welcome')}` }
                : msg
        ));
    }, [language, currentUser, t]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMsg = { id: Date.now(), text: inputValue, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');

        // Mock bot response
        setTimeout(() => {
            const botMsg = {
                id: Date.now() + 1,
                text: t('chatbot_response'),
                sender: 'bot'
            };
            setMessages(prev => [...prev, botMsg]);
        }, 1000);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 z-[100] w-16 h-16 bg-emerald-600 text-slate-950 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-emerald-500/20 hover:scale-110 active:scale-95 transition-all group border-4 border-slate-950"
            >
                <Bot size={32} className="group-hover:rotate-12 transition-transform" />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-500 rounded-full border-4 border-slate-950"></div>
            </button>
        );
    }

    return (
        <div className={cn(
            "fixed bottom-8 right-8 z-[100] bg-slate-950 border border-slate-800 shadow-2xl transition-all duration-500 flex flex-col overflow-hidden",
            isMinimized ? "w-72 h-16 rounded-[1.5rem]" : "w-96 h-[550px] rounded-[2.5rem]"
        )}>
            {/* Header */}
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between cursor-pointer" onClick={() => isMinimized && setIsMinimized(false)}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-lg">
                        <Sparkles size={18} />
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest">More Training <span className="text-emerald-400">AI</span></h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-[8px] text-slate-500 font-bold uppercase">{t('chatbot_online_engine')}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                        className="p-2 text-slate-600 hover:text-white transition-colors"
                    >
                        {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                    </button>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 text-slate-600 hover:text-white transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Messages Area */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent">
                        {messages.map((m) => (
                            <div key={m.id} className={cn(
                                "flex gap-3 max-w-[85%]",
                                m.sender === 'user' ? "ml-auto flex-row-reverse text-right" : "mr-auto"
                            )}>
                                <div className={cn(
                                    "w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-slate-950 shadow-lg",
                                    m.sender === 'user' ? "bg-indigo-500" : "bg-emerald-500"
                                )}>
                                    {m.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                                </div>
                                <div className={cn(
                                    "p-4 rounded-2xl text-[11px] font-medium leading-relaxed tracking-tight shadow-xl",
                                    m.sender === 'user'
                                        ? "bg-indigo-600 text-white rounded-tr-none"
                                        : "bg-slate-900 border border-slate-800 text-slate-300 rounded-tl-none"
                                )}>
                                    {m.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-4 bg-slate-900/50 border-t border-slate-800">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={t('chatbot_hint')}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-5 pr-14 py-4 text-white text-xs focus:outline-none focus:border-emerald-500/50 transition-all font-medium italic"
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-emerald-600 text-slate-950 rounded-xl hover:scale-110 active:scale-95 transition-all shadow-lg"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </form>
                </>
            )}
        </div>
    );
}
