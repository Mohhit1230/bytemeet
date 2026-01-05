/**
 * Toast Component
 *
 * Toast notification system with auto-dismiss and animations
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

// Toast interface
export interface ToastData {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number; // in milliseconds, 0 for persistent
    onClick?: () => void;
    onClose?: () => void;
}

// Toast item component
function ToastItem({
    toast,
    onRemove,
}: {
    toast: ToastData;
    onRemove: (id: string) => void;
}) {
    const toastRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    const duration = toast.duration ?? 5000;

    // Enter animation
    useEffect(() => {
        const el = toastRef.current;
        if (!el) return;

        gsap.fromTo(
            el,
            { x: 100, opacity: 0, scale: 0.9 },
            { x: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.7)' }
        );
    }, []);

    // Auto-dismiss with progress
    useEffect(() => {
        if (duration === 0 || isHovered) return;

        const progressEl = progressRef.current;
        if (progressEl) {
            gsap.fromTo(
                progressEl,
                { scaleX: 1 },
                {
                    scaleX: 0,
                    duration: duration / 1000,
                    ease: 'none',
                    onComplete: () => handleClose(),
                }
            );
        }

        return () => {
            if (progressEl) {
                gsap.killTweensOf(progressEl);
            }
        };
    }, [duration, isHovered]);

    // Pause animation on hover
    useEffect(() => {
        const progressEl = progressRef.current;
        if (!progressEl || duration === 0) return;

        if (isHovered) {
            gsap.killTweensOf(progressEl);
        } else {
            const currentScale = gsap.getProperty(progressEl, 'scaleX') as number;
            const remainingDuration = currentScale * (duration / 1000);

            gsap.to(progressEl, {
                scaleX: 0,
                duration: remainingDuration,
                ease: 'none',
                onComplete: () => handleClose(),
            });
        }
    }, [isHovered, duration]);

    const handleClose = () => {
        const el = toastRef.current;
        if (!el) return;

        gsap.to(el, {
            x: 100,
            opacity: 0,
            scale: 0.9,
            duration: 0.3,
            ease: 'power2.in',
            onComplete: () => {
                onRemove(toast.id);
                toast.onClose?.();
            },
        });
    };

    const handleClick = () => {
        if (toast.onClick) {
            toast.onClick();
            handleClose();
        }
    };

    // Toast styles based on type
    const typeStyles: Record<ToastType, { bg: string; icon: string; iconColor: string; progress: string }> = {
        success: {
            bg: 'bg-green-500/10 border-green-500/30',
            icon: '✓',
            iconColor: 'text-green-400 bg-green-500/20',
            progress: 'bg-green-500',
        },
        error: {
            bg: 'bg-red-500/10 border-red-500/30',
            icon: '✕',
            iconColor: 'text-red-400 bg-red-500/20',
            progress: 'bg-red-500',
        },
        warning: {
            bg: 'bg-yellow-500/10 border-yellow-500/30',
            icon: '⚠',
            iconColor: 'text-yellow-400 bg-yellow-500/20',
            progress: 'bg-yellow-500',
        },
        info: {
            bg: 'bg-blue-500/10 border-blue-500/30',
            icon: 'ℹ',
            iconColor: 'text-blue-400 bg-blue-500/20',
            progress: 'bg-blue-500',
        },
    };

    const style = typeStyles[toast.type];

    return (
        <div
            ref={toastRef}
            className={`relative overflow-hidden rounded-xl border ${style.bg} backdrop-blur-lg shadow-2xl min-w-[320px] max-w-[400px] ${toast.onClick ? 'cursor-pointer hover:scale-[1.02]' : ''
                } transition-transform`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleClick}
        >
            <div className="flex items-start gap-3 p-4">
                {/* Icon */}
                <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${style.iconColor}`}
                >
                    {style.icon}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white">{toast.title}</p>
                    {toast.message && (
                        <p className="mt-0.5 text-sm text-gray-400 line-clamp-2">{toast.message}</p>
                    )}
                </div>

                {/* Close button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleClose();
                    }}
                    className="shrink-0 rounded-lg p-1 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Progress bar */}
            {duration > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
                    <div
                        ref={progressRef}
                        className={`h-full origin-left ${style.progress}`}
                    />
                </div>
            )}
        </div>
    );
}

// Toast container component
export function ToastContainer({ toasts, onRemove }: { toasts: ToastData[]; onRemove: (id: string) => void }) {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 z-100 flex flex-col-reverse gap-3">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>
    );
}

// Toast context and provider
interface ToastContextValue {
    toasts: ToastData[];
    addToast: (toast: Omit<ToastData, 'id'>) => string;
    removeToast: (id: string) => void;
    success: (title: string, message?: string, options?: Partial<ToastData>) => string;
    error: (title: string, message?: string, options?: Partial<ToastData>) => string;
    warning: (title: string, message?: string, options?: Partial<ToastData>) => string;
    info: (title: string, message?: string, options?: Partial<ToastData>) => string;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastData[]>([]);

    const addToast = (toast: Omit<ToastData, 'id'>): string => {
        const id = Math.random().toString(36).substr(2, 9);
        const newToast: ToastData = { ...toast, id };
        setToasts((prev) => [...prev, newToast]);
        return id;
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const success = (title: string, message?: string, options?: Partial<ToastData>): string => {
        return addToast({ type: 'success', title, message, ...options });
    };

    const error = (title: string, message?: string, options?: Partial<ToastData>): string => {
        return addToast({ type: 'error', title, message, duration: 7000, ...options });
    };

    const warning = (title: string, message?: string, options?: Partial<ToastData>): string => {
        return addToast({ type: 'warning', title, message, ...options });
    };

    const info = (title: string, message?: string, options?: Partial<ToastData>): string => {
        return addToast({ type: 'info', title, message, ...options });
    };

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
}

// Hook to use toast
export function useToast(): ToastContextValue {
    const context = React.useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

export default ToastProvider;
