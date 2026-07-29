"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Minus, Plus, Settings, Type } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutoScrollToolbarProps {
  isPlaying: boolean;
  togglePlay: () => void;
  speed: number;
  decreaseSpeed: () => void;
  increaseSpeed: () => void;
  textSize: number;
  setTextSize: (s: number) => void;
  transposeStep: number;
  increaseTranspose: () => void;
  decreaseTranspose: () => void;
}

export function AutoScrollToolbar({
  isPlaying,
  togglePlay,
  speed,
  decreaseSpeed,
  increaseSpeed,
  textSize,
  setTextSize,
  transposeStep,
  increaseTranspose,
  decreaseTranspose
}: AutoScrollToolbarProps) {
  const [showSettings, setShowSettings] = React.useState(false);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <motion.div 
        layout
        className="flex items-center gap-1 p-2 rounded-full bg-black/60 border border-white/10 backdrop-blur-2xl shadow-2xl"
      >
        <button
          onClick={togglePlay}
          className={cn(
            "flex items-center justify-center w-12 h-12 rounded-full transition-colors",
            isPlaying ? "bg-accent text-black" : "bg-white/10 text-white hover:bg-white/20"
          )}
        >
          {isPlaying ? <Pause fill="currentColor" size={24} /> : <Play fill="currentColor" size={24} className="ml-1" />}
        </button>

        <div className="w-px h-8 bg-white/10 mx-2" />

        <button
          onClick={() => setShowSettings(!showSettings)}
          className={cn(
            "flex items-center justify-center w-12 h-12 rounded-full transition-colors",
            showSettings ? "bg-white/20 text-white" : "bg-transparent text-secondary hover:bg-white/10"
          )}
        >
          <Settings size={22} />
        </button>
      </motion.div>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: -80, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 w-64 bg-glass border border-glass-border backdrop-blur-2xl rounded-3xl p-4 shadow-2xl flex flex-col gap-4"
          >
            {/* Speed Control */}
            <div>
              <div className="flex justify-between text-xs text-secondary mb-2 font-medium uppercase tracking-wider">
                <span>Speed</span>
                <span className="text-accent">{speed.toFixed(2)}x</span>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={decreaseSpeed}
                  disabled={speed <= 0.25}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 disabled:opacity-30 active:bg-white/10 transition-colors"
                >
                  <Minus size={16} />
                </button>
                <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent" 
                    style={{ width: (((speed - 0.25) / 1.75) * 100) + '%' }}
                  />
                </div>
                <button 
                  onClick={increaseSpeed}
                  disabled={speed >= 2.0}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 disabled:opacity-30 active:bg-white/10 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="w-full h-px bg-white/10" />

            {/* Font Size Control */}
            <div>
              <div className="flex justify-between text-xs text-secondary mb-2 font-medium uppercase tracking-wider">
                <span>Text Size</span>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setTextSize(Math.max(14, textSize - 2))}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 active:bg-white/10 transition-colors"
                >
                  <Type size={14} />
                </button>
                <div className="flex-1 text-center text-sm font-medium">
                  {textSize}px
                </div>
                <button 
                  onClick={() => setTextSize(Math.min(32, textSize + 2))}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 active:bg-white/10 transition-colors"
                >
                  <Type size={20} />
                </button>
              </div>
            </div>

            <div className="w-full h-px bg-white/10" />

            {/* Transpose Control */}
            <div>
              <div className="flex justify-between text-xs text-secondary mb-2 font-medium uppercase tracking-wider">
                <span>Transpose</span>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={decreaseTranspose}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 active:bg-white/10 transition-colors font-medium text-lg"
                >
                  -
                </button>
                <div className="flex-1 text-center text-sm font-medium">
                  {transposeStep > 0 ? `+${transposeStep}` : transposeStep}
                </div>
                <button 
                  onClick={increaseTranspose}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 active:bg-white/10 transition-colors font-medium text-lg"
                >
                  +
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
