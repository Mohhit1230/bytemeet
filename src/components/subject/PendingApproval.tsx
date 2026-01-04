/**
 * Pending Approval Component
 * 
 * Shows while waiting for join request approval
 */

'use client';

import React from 'react';

interface PendingApprovalProps {
    subjectName: string;
}

export function PendingApproval({ subjectName }: PendingApprovalProps) {
    return (
        <div className="min-h-screen bg-[#131314] flex items-center justify-center p-4">
            <div className="text-center space-y-6 max-w-md">
                <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
                    <svg className="h-10 w-10 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Waiting for Approval</h2>
                    <p className="text-gray-400">
                        Your request to join <span className="text-[#e94d37] font-semibold">"{subjectName}"</span> is pending approval from the owner.
                    </p>
                </div>

                <div className="bg-[#1e1f20] border border-[#30302e] rounded-lg p-4">
                    <p className="text-sm text-gray-400">
                        💡 You'll receive a notification once your request is approved. You can check the status in your dashboard's "Pending" tab.
                    </p>
                </div>

                <button
                    onClick={() => window.location.href = '/home'}
                    className="px-6 py-3 bg-gradient-to-r from-[#f06b58] to-[#e94d37] text-white font-semibold rounded-lg hover:from-[#e94d37] hover:to-[#d44330] transition-all"
                >
                    Go to Dashboard
                </button>
            </div>
        </div>
    );
}

export default PendingApproval;
