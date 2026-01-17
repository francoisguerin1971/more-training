import React from 'react';
import { Sidebar } from './Sidebar';
import { LanguageDropdown } from '@/shared/components/common/LanguageDropdown';

interface LayoutProps {
    children: React.ReactNode;
    onLogout: () => void;
}

export function Layout({ children, onLogout }: LayoutProps) {
    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans flex">
            <Sidebar
                onLogout={onLogout}
            />
            <main className="flex-1 ml-64 overflow-y-auto h-screen">
                {/* Top Header Bar with Language Dropdown */}
                <div className="sticky top-0 z-[100] bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 px-8 py-4 flex justify-end">
                    <LanguageDropdown />
                </div>

                <div className="p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
