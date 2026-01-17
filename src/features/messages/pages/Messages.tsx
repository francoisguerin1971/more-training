import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/shared/components/ui/Card';
import {
    Send, User, Search, MoreVertical,
    CheckCheck, Check, Smile, Paperclip,
    Phone, Video, Info, MessageSquare, Trash2
} from 'lucide-react';
import { useLanguage } from '@/shared/context/LanguageContext';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { useMessages } from '@/shared/context/MessageContext';
import { cn } from '@/shared/lib/utils';
import { format } from 'date-fns';
// Direct import (removed named import if it was interfering with default export expectations, assuming it's a named export)
import { LiveConnection } from '@/features/live/pages/LiveConnection';

export function Messages() {
    const { t } = useLanguage();
    const { currentUser, getCoachesForAthlete, getAthletesForCoach } = useAuthStore();
    const { messages = [], sendMessage, getThread, markAsRead, deleteMessage } = useMessages();

    const [activeContactId, setActiveContactId] = useState<string | null>(null);
    const [isCallActive, setIsCallActive] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    const [inputText, setInputText] = useState('');
    const [contacts, setContacts] = useState<any[]>([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        const fetchContacts = async () => {
            // Don't fetch if we are in demo mode
            if (!currentUser || currentUser.id === 'demo-user' || activeContactId === 'demo-test') return;

            let data = [];
            // ... rest of fetch logic
            if ((currentUser.role as string) === 'coach') {
                data = await getAthletesForCoach(currentUser.id);
            } else {
                data = await getCoachesForAthlete(currentUser.id);
            }

            if (Array.isArray(data)) {
                setContacts(data);
                if (data.length > 0 && !activeContactId) {
                    setActiveContactId(data[0].id);
                }
            } else {
                setContacts([]);
            }
        };

        fetchContacts().then(() => {
            // Only add default demo coach if regular fetch yields nothing AND we are not already in a manual demo session
            setContacts(prev => {
                if (prev.length === 0 && (!currentUser || currentUser.id !== 'demo-user')) {
                    return [{
                        id: 'demo-coach',
                        name: 'Coach Demo (AI)',
                        avatar: '🤖',
                        role: 'coach'
                    }];
                }
                return prev;
            });
        });
    }, [currentUser, activeContactId]);

    useEffect(() => {
        // Prevent infinite loop: Only mark as read if there are actually unread messages
        if (activeContactId && currentUser && markAsRead) {
            const hasUnread = messages.some((m: any) => m.from === activeContactId && m.to === currentUser.id && !m.read);
            if (hasUnread) {
                markAsRead(activeContactId, currentUser.id);
            }
        }
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [activeContactId, messages, currentUser, markAsRead]);

    // Close Emoji Picker on Click Outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
        };

        if (showEmojiPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showEmojiPicker]);

    const activeContact = contacts.find(u => u.id === activeContactId);
    // Safe getThread call
    const thread = (activeContactId && currentUser && getThread)
        ? getThread(currentUser.id, activeContactId)
        : [];

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !currentUser || !activeContactId || !sendMessage) return;
        sendMessage(currentUser.id, activeContactId, inputText);
        setInputText('');
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && currentUser && activeContactId) {
            const file = e.target.files[0];
            sendMessage(currentUser.id, activeContactId, `📁 ${file.name}`);
        }
    };

    // Safe date formatter
    const safeFormatTime = (dateStr: any) => {
        try {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return '';
            return format(date, 'HH:mm');
        } catch (e) {
            return '';
        }
    };

    return (
        <div className="h-[calc(100vh-140px)] flex bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-700 relative">

            {/* Live Session Overlay */}
            {isCallActive && (
                <div className="absolute inset-0 z-50 bg-slate-950 flex flex-col">
                    <div className="flex-1 relative">
                        {/* Removed Suspense as LiveConnection is not lazy loaded here. Added Error Boundary Concept if needed, but keeping it simple first. */}
                        <LiveConnection onClose={() => setIsCallActive(false)} />
                    </div>
                </div>
            )}


            {/* Contact List */}
            <div className="w-80 border-r border-slate-800 flex flex-col bg-slate-900/30">
                <div className="p-6 border-b border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white uppercase tracking-tighter">{t('messages')}</h2>
                        <button
                            onClick={() => setIsOnline(!isOnline)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-all",
                                isOnline
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                                    : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                            )}
                        >
                            <div className={cn("w-2 h-2 rounded-full", isOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-500")} />
                            {isOnline ? 'Online' : 'Offline'}
                        </button>
                    </div>
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder={t('search_placeholder')}
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50 backdrop-blur-sm transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {contacts.map(contact => {
                        const lastMsg = messages.filter((m: any) => (currentUser && ((m.from === contact.id && m.to === currentUser.id) || (m.from === currentUser.id && m.to === contact.id)))).pop();
                        const unread = messages.filter((m: any) => currentUser && m.from === contact.id && m.to === currentUser.id && !m.read).length;

                        return (
                            <button
                                key={contact.id}
                                onClick={() => setActiveContactId(contact.id)}
                                className={cn(
                                    "w-full flex items-center gap-4 p-4 border-b border-slate-800/50 transition-all hover:bg-slate-800/50 text-left",
                                    activeContactId === contact.id && "bg-emerald-500/5 border-r-2 border-r-emerald-500"
                                )}
                            >
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-white font-bold border border-slate-700 shadow-lg">
                                        {contact.avatar}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900"></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <h4 className="text-sm font-bold text-white truncate">{contact.name}</h4>
                                        {lastMsg && lastMsg.timestamp && <span className="text-[9px] text-slate-600 font-bold uppercase">{format(new Date(lastMsg.timestamp), 'HH:mm')}</span>}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className={cn("text-xs truncate", unread > 0 ? "text-emerald-400 font-bold" : "text-slate-500")}>
                                            {lastMsg ? lastMsg.text : "Start a conversation..."}
                                        </p>
                                        {unread > 0 && (
                                            <span className="bg-emerald-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded-full ml-2">
                                                {unread}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-slate-950/20 relative">
                {activeContact ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-slate-800 bg-slate-900/30 flex items-center justify-between backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white font-bold border border-slate-700">
                                    {activeContact.avatar}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-sm">{activeContact.name}</h3>
                                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">{t('online')}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-slate-500">
                                <button onClick={() => setIsCallActive(true)} className="p-2 hover:text-white transition-colors"><Phone size={20} /></button>
                                <button onClick={() => setIsCallActive(true)} className="p-2 hover:text-white transition-colors"><Video size={20} /></button>
                                <button className="p-2 hover:text-white transition-colors"><Info size={20} /></button>
                            </div>
                        </div>

                        {/* Message Thread */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar"
                        >
                            {thread.map((msg: any, idx: number) => {
                                const isMine = currentUser && msg.from === currentUser.id;
                                return (
                                    <div key={idx} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                                        <div className={cn(
                                            "max-w-[70%] group relative",
                                            isMine ? "items-end" : "items-start"
                                        )}>
                                            <div className={cn(
                                                "p-4 rounded-2xl text-sm leading-relaxed shadow-xl transition-all hover:scale-[1.01]",
                                                isMine
                                                    ? "bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-tr-none border border-emerald-400/20"
                                                    : "bg-slate-900/80 backdrop-blur-md border border-slate-800 text-slate-300 rounded-tl-none"
                                            )}>
                                                {msg.text}
                                            </div>
                                            <div className={cn("flex items-center gap-1.5 mt-1.5", isMine ? "justify-end text-emerald-400/50" : "justify-start text-slate-600")}>

                                                {/* Delete button (only visible on group hover) */}
                                                <button
                                                    onClick={() => deleteMessage && deleteMessage(msg.id)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-500 hover:text-rose-500 mr-2"
                                                    title="Supprimer pour tous"
                                                >
                                                    <Trash2 size={12} />
                                                </button>

                                                <span className="text-[9px] font-bold uppercase tracking-tighter">
                                                    {safeFormatTime(msg.timestamp)}
                                                </span>
                                                {isMine && (
                                                    msg.read ? <CheckCheck size={14} className="text-blue-400" /> : <Check size={14} className="text-white/50" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Input Area */}
                        <div className="p-6 border-t border-slate-800 bg-slate-900/10">
                            <form onSubmit={handleSend} className="flex items-center gap-4">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleFileSelect}
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-3 bg-slate-800 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition-all active:scale-95"
                                >
                                    <Paperclip size={20} />
                                </button>
                                <div className="relative flex-1">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                        placeholder={t('type_message_placeholder')}
                                        className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 backdrop-blur-sm transition-all pr-12 h-14"
                                    />
                                    {showEmojiPicker && (
                                        <div
                                            ref={emojiPickerRef}
                                            className="absolute bottom-16 right-4 p-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl grid grid-cols-4 gap-1 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200"
                                        >
                                            {['👍', '🔥', '💪', '🏃', '🚴', '🥇', '👋', '🛑', '❤️', '✅', '🏋️', '🧘', '🥝', '💧', '🎯', "🎉"].map(emoji => (
                                                <button
                                                    key={emoji}
                                                    type="button"
                                                    onClick={() => {
                                                        setInputText(prev => prev + emoji);
                                                        setTimeout(() => inputRef.current?.focus(), 10);
                                                        // Optional: Close on select? User didn't specify, but often better UX to keep open for multiple.
                                                        // setShowEmojiPicker(false);
                                                    }}
                                                    className="w-8 h-8 flex items-center justify-center text-lg hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onMouseDown={(e) => {
                                            // Prevent default to stop blur/focus fighting
                                            e.preventDefault();
                                            // Click outside listener will fire before this click if we don't manage it carefully.
                                            // Actually, the button is OUTSIDE the ref, so the listener closes it, then this toggles it back ON if we are not careful.
                                            // Better approach: wrap both in the ref? Or stop propagation.
                                            e.stopPropagation();
                                            setShowEmojiPicker(!showEmojiPicker);
                                        }}
                                        className={cn("absolute right-4 top-1/2 -translate-y-1/2 transition-colors", showEmojiPicker ? "text-yellow-400" : "text-slate-500 hover:text-emerald-400")}
                                    >
                                        <Smile size={20} />
                                    </button>
                                </div>
                                <button
                                    type="submit"
                                    className="p-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
                                >
                                    <Send size={24} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600">
                        <div className="w-16 h-16 rounded-full bg-slate-900/50 border border-slate-800 flex items-center justify-center mb-4 animate-pulse">
                            <MessageSquare size={32} className="text-emerald-500" />
                        </div>
                        <p className="font-bold uppercase tracking-widest text-xs mb-4">Select a contact to start messaging or video calling</p>
                        <button
                            onClick={() => {
                                // Demo Setup
                                const demoContact = { id: 'demo-test', name: 'Test User', avatar: '🧪' };
                                setContacts([demoContact]);
                                setActiveContactId(demoContact.id);

                                // Mock current user for demo if missing (prevents blank screen)
                                if (!currentUser) {
                                    useAuthStore.setState({
                                        currentUser: {
                                            id: 'demo-user',
                                            name: 'Demo User',
                                            role: 'athlete',
                                            email: 'demo@test.com',
                                            status: 'active',
                                            created_at: new Date().toISOString(),
                                            updated_at: new Date().toISOString()
                                        }
                                    });
                                }
                            }}
                            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                        >
                            Lancer une Démo
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
