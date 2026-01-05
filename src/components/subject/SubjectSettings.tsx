/**
 * Subject Settings Modal
 *
 * Modal for editing subject settings (owner only)
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useSubjects } from '@/hooks/useSubjects';

interface SubjectSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  subject: any;
  onUpdate?: (subject: any) => void;
}

export function SubjectSettings({ isOpen, onClose, subject, onUpdate }: SubjectSettingsProps) {
  const { updateSubject, deleteSubject, regenerateCode, loading } = useSubjects();

  const [formData, setFormData] = useState({
    name: subject?.name || '',
    description: subject?.description || '',
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Refs for GSAP
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (subject) {
      setFormData({
        name: subject.name || '',
        description: subject.description || '',
      });
    }
  }, [subject]);

  /**
   * GSAP animations
   */
  useEffect(() => {
    if (isOpen && overlayRef.current && modalRef.current) {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      gsap.fromTo(
        modalRef.current,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.2)' }
      );
    }
  }, [isOpen]);

  const handleClose = () => {
    if (overlayRef.current && modalRef.current) {
      gsap.to(modalRef.current, { scale: 0.9, opacity: 0, duration: 0.3 });
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.2, onComplete: onClose });
    } else {
      onClose();
    }
  };

  const handleUpdate = async () => {
    try {
      const updated = await updateSubject(subject.id, formData);
      onUpdate?.(updated);
      handleClose();
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  const handleRegenerateCode = async () => {
    try {
      const updated = await regenerateCode(subject.id);
      onUpdate?.(updated);
    } catch (err) {
      console.error('Regenerate code error:', err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSubject(subject.id);
      handleClose();
      window.location.href = '/home';
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div
        ref={modalRef}
        className="relative w-full max-w-md rounded-2xl border border-[#30302e] bg-[#1e1f20] shadow-2xl"
      >
        <div className="border-b border-[#30302e] px-6 py-4">
          <h2 className="text-2xl font-bold text-white">Subject Settings</h2>
        </div>

        <div className="space-y-6 px-6 py-6">
          {/* Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-[#30302e] bg-[#262624] px-4 py-3 text-white"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full resize-none rounded-lg border border-[#30302e] bg-[#262624] px-4 py-3 text-white"
            />
          </div>

          {/* Invite Code */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Invite Code</label>
            <div className="flex gap-2">
              <code className="flex-1 rounded-lg border border-[#30302e] bg-[#262624] px-4 py-3 font-mono text-lg font-bold text-[#e94d37]">
                {subject?.invite_code}
              </code>
              <button
                onClick={handleRegenerateCode}
                disabled={loading}
                className="rounded-lg bg-[#30302e] px-4 py-3 text-white transition-colors hover:bg-[#3a3a38]"
              >
                🔄
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
            <h3 className="mb-2 text-sm font-semibold text-red-400">Danger Zone</h3>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full rounded-lg bg-red-500/10 px-4 py-2 text-red-400 transition-colors hover:bg-red-500/20"
              >
                Delete Subject
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-400">Are you sure? This cannot be undone.</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 rounded-lg bg-[#30302e] px-4 py-2 text-white transition-colors hover:bg-[#3a3a38]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 border-t border-[#30302e] px-6 py-4">
          <button
            onClick={handleClose}
            disabled={loading}
            className="flex-1 rounded-lg bg-[#30302e] px-4 py-3 text-white transition-colors hover:bg-[#3a3a38]"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="flex-1 rounded-lg bg-gradient-to-r from-[#f06b58] to-[#e94d37] px-4 py-3 text-white transition-all hover:from-[#e94d37] hover:to-[#d44330]"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SubjectSettings;
