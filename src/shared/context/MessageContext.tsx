import React, { createContext, useContext, useState } from 'react';

const MessageContext = createContext<any>(null);

export function MessageProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([
        // Mock data for demo
        { id: '1', from: 'demo-test', to: 'demo-user', text: 'Bienvenue sur la messagerie !', timestamp: new Date(), read: false }
    ]);

    const showMessage = (content: string, type: 'info' | 'error' | 'success' = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, content, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(m => m.id !== id));
        }, 3000);
    };

    const sendMessage = (from: string, to: string, text: string) => {
        const newMessage = {
            id: Math.random().toString(36).substr(2, 9),
            from,
            to,
            text,
            timestamp: new Date(),
            read: false
        };
        setMessages(prev => [...prev, newMessage]);
    };

    const getThread = (userId: string, contactId: string) => {
        return messages.filter(m =>
            (m.from === userId && m.to === contactId) ||
            (m.from === contactId && m.to === userId) ||
            (m.from === 'demo-test') // Always show demo messages for testing
        ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    };

    const markAsRead = (contactId: string, userId: string) => {
        setMessages(prev => prev.map(m =>
            (m.from === contactId && m.to === userId) ? { ...m, read: true } : m
        ));
    };

    const deleteMessage = (messageId: string) => {
        setMessages(prev => prev.filter(m => m.id !== messageId));
    };

    return (
        <MessageContext.Provider value={{ messages, showMessage, sendMessage, getThread, markAsRead, deleteMessage, toasts }}>
            {children}
        </MessageContext.Provider>
    );
}

export const useMessages = () => {
    const context = useContext(MessageContext);
    if (!context) throw new Error('useMessages must be used within MessageProvider');
    return context;
};
