'use client';

import * as AlertDialog from '@radix-ui/react-alert-dialog';

interface ConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  isConfirming?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmLabel = 'Видалити',
  isConfirming = false,
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-surface p-6 focus:outline-none">
          <AlertDialog.Title className="mb-2 text-base font-semibold text-text">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="mb-5 text-sm text-muted">
            {description}
          </AlertDialog.Description>

          <div className="flex justify-end gap-3">
            <AlertDialog.Cancel className="rounded-md border border-border px-4 py-2 text-sm text-text hover:bg-surface-2">
              Скасувати
            </AlertDialog.Cancel>
            <AlertDialog.Action
              disabled={isConfirming}
              className="rounded-md bg-expense px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
              onClick={(event) => {
                // AlertDialog.Action за замовчуванням закриває діалог ОДРАЗУ
                // по кліку — але нам треба дочекатись результату async-мутації
                // видалення (і не закривати, якщо вона впаде з помилкою).
                // preventDefault блокує авто-закриття; onConfirm сам вирішує,
                // коли викликати onOpenChange(false).
                event.preventDefault();
                onConfirm();
              }}
            >
              {isConfirming ? 'Видалення...' : confirmLabel}
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
