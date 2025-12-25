import React from 'react';
import { Toaster } from 'react-hot-toast';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="h-screen flex flex-col bg-pro-bg text-pro-text font-sans selection:bg-pro-accent/30 selection:text-white">
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: '#333',
                        color: '#fff',
                        border: '1px solid #444',
                        fontSize: '12px',
                    },
                    success: {
                        iconTheme: {
                            primary: '#E6B97E', // vintage-accent
                            secondary: 'black',
                        },
                    },
                }}
            />
            {/* 
                Future: Sidebar or Navigation could go here.
                For now, it's a clean shell.
            */}
            <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
                {children}
            </main>
        </div>
    );
};
