"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  align?: 'center' | 'left' | 'right';
}

export function Tooltip({ children, content, align = 'center' }: TooltipProps) {
  const [show, setShow] = useState(false);
  
  return (
    <div 
      className="relative flex items-center justify-center group"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onTouchStart={() => setShow(true)}
      onTouchEnd={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && content && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute -top-12 px-3 py-1.5 bg-black/90 border border-white/10 backdrop-blur-2xl text-white text-xs font-semibold tracking-wide rounded-lg shadow-xl z-[100] pointer-events-none whitespace-nowrap",
              align === 'center' && "left-1/2 -translate-x-1/2",
              align === 'right' && "right-0",
              align === 'left' && "left-0"
            )}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
