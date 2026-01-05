/**
 * Login Page
 * 
 * Authentication page for user login with animated background
 */

'use client';

import React from 'react';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-500 relative overflow-hidden">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-linear-to-br from-accent/5 via-transparent to-accent/10" />

            {/* Grid pattern overlay */}
            <div
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: `linear-gradient(#30302e 1px, transparent 1px), linear-gradient(90deg, #30302e 1px, transparent 1px)`,
                    backgroundSize: '50px 50px',
                }}
            />

            {/* Content */}
            <div className="relative z-10 w-full px-4">
                <LoginForm />
            </div>

            {/* Decorative elements */}
            <div className="absolute top-10 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </div>
    );
}
