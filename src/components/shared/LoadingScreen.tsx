'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  messages?: string[];
}

const defaultMessages = ['Loading...'];

export function LoadingScreen({ messages = defaultMessages }: LoadingScreenProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (messages.length <= 1) return;

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [messages]);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#FAFAFA]">
      <div className="relative flex items-center justify-center mb-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF6B35] via-[#FF3F80] to-[#7C5CFC] animate-pulse" />
      </div>

      <div className="h-6">
        <AnimatePresence mode="wait">
          <motion.p
            key={messageIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="text-sm text-[#6B6B6B] font-medium"
          >
            {messages[messageIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
