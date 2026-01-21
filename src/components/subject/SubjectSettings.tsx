/**
 * Subject Settings Modal
 *
 * Modal for editing subject settings (owner only)
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import {
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
  useRegenerateCodeMutation,
} from '@/hooks/queries';
import type { Subject } from '@/types/database';

interface SubjectSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject;
  onUpdate?: (subject: Subject) => void;
}

export function SubjectSettings({ isOpen, onClose, subject, onUpdate }: SubjectSettingsProps) {
  const updateSubjectMutation = useUpdateSubjectMutation();
  const deleteSubjectMutation = useDeleteSubjectMutation();
  const regenerateCodeMutation = useRegenerateCodeMutation();
  const loading =
    updateSubjectMutation.isPending ||
    deleteSubjectMutation.isPending ||
    regenerateCodeMutation.isPending;

  const [formData, setFormData] = useState({
    name: subject?.name || '',
    description: subject?.description || '',
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  // Refs for GSAP
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (subject) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData((prev) => {
        // Only update if changes to prevent cycle
        if (
          prev.name === (subject.name || '') &&
          prev.description === (subject.description || '')
        ) {
          return prev;
        }
        return {
          name: subject.name || '',
          description: subject.description || '',
        };
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
      // Reset copied state when modal opens
      setCodeCopied(false);
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
      const updated = await updateSubjectMutation.mutateAsync({ id: subject.id, data: formData });
      onUpdate?.(updated);
      handleClose();
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  const handleRegenerateCode = async () => {
    try {
      const updated = await regenerateCodeMutation.mutateAsync(subject.id);
      onUpdate?.(updated);
      setCodeCopied(false); // Reset copied state after regenerating
    } catch (err) {
      console.error('Regenerate code error:', err);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(subject?.invite_code || '');
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 3000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSubjectMutation.mutateAsync(subject.id);
      handleClose();
      window.location.href = '/dashboard';
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
        className="border-bg-200 bg-bg-600 relative w-full max-w-md rounded-2xl border shadow-2xl"
      >
        <div className="border-bg-200 border-b px-6 py-4">
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
              className="border-bg-200 bg-bg-100 w-full rounded-lg border px-4 py-3 text-white"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="border-bg-200 bg-bg-100 w-full resize-none rounded-lg border px-4 py-3 text-white"
            />
          </div>

          {/* Invite Code */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Invite Code</label>
            <div className="flex gap-2">
              <code className="border-bg-200 bg-bg-100 text-accent flex-1 rounded-lg border px-4 py-3 font-mono text-lg font-bold tracking-wider">
                {subject?.invite_code}
              </code>
              <button
                onClick={handleCopyCode}
                disabled={loading}
                className={`rounded-lg px-4 py-3 transition-colors ${codeCopied
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-bg-200 hover:bg-bg-300 text-white'
                  }`}
                title="Copy invite code"
              >
                {codeCopied ? '✓' : '📋'}
              </button>
              <button
                onClick={handleRegenerateCode}
                disabled={loading}
                className="bg-bg-200 hover:bg-bg-300 rounded-lg px-4 py-3 text-white transition-colors"
                title="Regenerate invite code"
              >
                🔄
              </button>
            </div>
            <p className="mt-1.5 text-xs text-gray-500">
              Share this code with others to let them join this room
            </p>
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
                    className="bg-bg-200 hover:bg-bg-300 flex-1 rounded-lg px-4 py-2 text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-bg-200 flex gap-3 border-t px-6 py-4">
          <button
            onClick={handleClose}
            disabled={loading}
            className="bg-bg-200 hover:bg-bg-300 flex-1 rounded-lg px-4 py-3 text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="from-accent-light to-accent hover:from-accent hover:to-accent-dark flex-1 rounded-lg bg-linear-to-r px-4 py-3 text-white transition-all"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SubjectSettings;
