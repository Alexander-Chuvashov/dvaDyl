// src/components/UI/TheoryModal.tsx
import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import type { Theory } from '../../types/content';
import TheoryView from '../Chapters/TheoryView';

interface TheoryModalProps {
    theories: Theory[];
    onClose: () => void;
}

const TheoryModal: React.FC<TheoryModalProps> = ({ theories, onClose }) => {
    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/50"
            onClick={onClose}
        >
            <div
                className="bg-surface rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6 relative"
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute p-1 transition-colors rounded-full top-4 right-4 hover:bg-cream"
                >
                    <X className="w-5 h-5 text-dark/60" />
                </button>
                <h2 className="mb-4 text-2xl font-bold text-dark">📖 Теория</h2>
                <div className="space-y-6">
                    {theories.map(theory => (
                        <TheoryView key={theory.id} theory={theory} />
                    ))}
                </div>
            </div>
        </div>,
        document.body,
    );
};

export default TheoryModal;
