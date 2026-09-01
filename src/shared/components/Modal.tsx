'use client';

import * as Dialog from '@radix-ui/react-dialog';
import type { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, description, children }: ModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 max-h-[85vh] w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-surface p-6 focus:outline-none">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-lg font-semibold text-text">{title}</Dialog.Title>
            <Dialog.Close
              aria-label="Закрити"
              className="text-xl leading-none text-muted hover:text-text"
            >
              ×
            </Dialog.Close>
          </div>

          {/* Radix вимагає Dialog.Description для screen readers (інакше —
              console warning); візуально ховаємо, якщо окремий опис не потрібен */}
          <Dialog.Description className="sr-only">{description ?? title}</Dialog.Description>

          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
