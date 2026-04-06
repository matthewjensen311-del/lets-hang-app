'use client';

import { type ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                className={cn(
                  'fixed z-50 w-full max-w-lg rounded-t-[16px] bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.06)] focus:outline-none',
                  // Mobile: bottom sheet style
                  'bottom-0 left-0 right-0',
                  // Desktop: centered dialog
                  'sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:right-auto sm:rounded-[16px] sm:-translate-x-1/2 sm:-translate-y-1/2',
                  className,
                )}
                initial={{
                  opacity: 0,
                  y: '100%',
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: '100%',
                }}
                transition={{ type: 'spring', damping: 30, stiffness: 350 }}
                // Override for desktop
                style={{}}
              >
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    {title && (
                      <Dialog.Title className="text-lg font-semibold text-[#1A1A1A]">
                        {title}
                      </Dialog.Title>
                    )}
                    {description && (
                      <Dialog.Description className="mt-1 text-sm text-[#6B6B6B]">
                        {description}
                      </Dialog.Description>
                    )}
                  </div>
                  <Dialog.Close asChild>
                    <button
                      className="shrink-0 rounded-full p-1.5 text-[#9B9B9B] transition-colors hover:bg-[#F2F0ED] hover:text-[#1A1A1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C5CFC]"
                      aria-label="Close"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </Dialog.Close>
                </div>
                {children}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

export { Modal };
