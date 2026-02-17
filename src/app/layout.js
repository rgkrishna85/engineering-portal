'use client';
import { useState } from 'react';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function RootLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <html lang="en">
            <head>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>EngineAI – Enterprise Engineering Portal</title>
                <meta name="description" content="AI-powered enterprise engineering portal for managing projects, employees, workflows, and deliverables across global regions." />
            </head>
            <body>
                <div className="app-layout">
                    <Sidebar
                        isOpen={sidebarOpen}
                        onClose={() => setSidebarOpen(false)}
                    />
                    <div className="main-content">
                        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
                        <div className="page-content">
                            {children}
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}
