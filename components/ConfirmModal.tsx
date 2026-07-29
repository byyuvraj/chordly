"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  confirmText = "Confirm", 
  isDanger = false,
  onConfirm, 
  onCancel 
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onCancel}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-glass border border-glass-border rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                isDanger ? "bg-red-500/20 text-red-500" : "bg-accent/20 text-accent"
              )}>
                <AlertTriangle size={24} />
              </div>
              <div className="pt-1">
                <h3 className="text-xl font-bold text-foreground">{title}</h3>
                <p className="text-secondary text-sm leading-relaxed mt-2">{message}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 mt-6">
              <button 
                onClick={onCancel}
                className="px-5 py-2.5 rounded-xl font-medium text-secondary hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={onConfirm}
                className={cn(
                  "px-5 py-2.5 rounded-xl font-semibold transition-all",
                  isDanger 
                    ? "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_25px_rgba(239,68,68,0.5)] hover:bg-red-600" 
                    : "bg-accent text-black shadow-[0_0_15px_rgba(245,197,99,0.3)] hover:shadow-[0_0_25px_rgba(245,197,99,0.5)]"
                )}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
