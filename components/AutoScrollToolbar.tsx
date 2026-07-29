"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Minus, Plus, Settings, Type, Activity, Edit2 } from 'lucide-react';
import { Tooltip } from '@/components/Tooltip';
import { useMetronome } from '@/hooks/useMetronome';
import { cn } from '@/lib/utils';
import Link from 'next/link';

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
  tempo?: number;
  songId?: string;
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
  decreaseTranspose,
  tempo,
  songId
}: AutoScrollToolbarProps) {
  const [showSettings, setShowSettings] = React.useState(false);
  const { isPlaying: metronomeOn, toggle: toggleMetronome, currentBeat } = useMetronome(tempo);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <motion.div 
        layout
        className="flex items-center gap-1 p-2 rounded-full bg-black/60 border border-white/10 backdrop-blur-2xl shadow-2xl"
      >
        {tempo && (
          <>
            <div className="relative">
              <Tooltip content={`Metronome (${tempo} BPM)`}>
                <button
                  onClick={toggleMetronome}
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-full transition-colors relative z-10",
                    metronomeOn ? "bg-accent/20 text-accent" : "bg-transparent text-secondary hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Activity size={20} />
                </button>
              </Tooltip>
              
              {/* Visual Beat Indicator */}
              {metronomeOn && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className={cn(
                    "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                    currentBeat === 0 ? "bg-red-500" : "bg-accent"
                  )}></span>
                  <span className={cn(
                    "relative inline-flex rounded-full h-3 w-3",
                    currentBeat === 0 ? "bg-red-500" : "bg-accent"
                  )}></span>
                </span>
              )}
            </div>
            <div className="w-px h-8 bg-white/10 mx-1" />
          </>
        )}

        <Tooltip content={isPlaying ? "Pause Auto-scroll" : "Start Auto-scroll"}>
          <button
            onClick={togglePlay}
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded-full transition-colors",
              isPlaying ? "bg-accent text-black" : "bg-white/10 text-white hover:bg-white/20"
            )}
          >
            {isPlaying ? <Pause fill="currentColor" size={24} /> : <Play fill="currentColor" size={24} className="ml-1" />}
          </button>
        </Tooltip>

        <div className="w-px h-8 bg-white/10 mx-2" />

        <Tooltip content="Settings">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded-full transition-colors",
              showSettings ? "bg-white/20 text-white" : "bg-transparent text-secondary hover:bg-white/10"
            )}
          >
            <Settings size={22} />
          </button>
        </Tooltip>
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
                <Tooltip content="Decrease Speed">
                  <button 
                    onClick={decreaseSpeed}
                    disabled={speed <= 0.25}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 disabled:opacity-30 active:bg-white/10 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                </Tooltip>
                <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent" 
                    style={{ width: (((speed - 0.25) / 1.75) * 100) + '%' }}
                  />
                </div>
                <Tooltip content="Increase Speed">
                  <button 
                    onClick={increaseSpeed}
                    disabled={speed >= 2.0}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 disabled:opacity-30 active:bg-white/10 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </Tooltip>
              </div>
            </div>

            <div className="w-full h-px bg-white/10" />

            {/* Font Size Control */}
            <div>
              <div className="flex justify-between text-xs text-secondary mb-2 font-medium uppercase tracking-wider">
                <span>Text Size</span>
              </div>
              <div className="flex items-center gap-3">
                <Tooltip content="Decrease Text Size">
                  <button 
                    onClick={() => setTextSize(Math.max(14, textSize - 2))}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 active:bg-white/10 transition-colors"
                  >
                    <Type size={14} />
                  </button>
                </Tooltip>
                <div className="flex-1 text-center text-sm font-medium">
                  {textSize}px
                </div>
                <Tooltip content="Increase Text Size">
                  <button 
                    onClick={() => setTextSize(Math.min(32, textSize + 2))}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 active:bg-white/10 transition-colors"
                  >
                    <Type size={20} />
                  </button>
                </Tooltip>
              </div>
            </div>

            <div className="w-full h-px bg-white/10" />

            {/* Transpose Control */}
            <div>
              <div className="flex justify-between text-xs text-secondary mb-2 font-medium uppercase tracking-wider">
                <span>Transpose</span>
              </div>
              <div className="flex items-center gap-3">
                <Tooltip content="Transpose Down">
                  <button 
                    onClick={decreaseTranspose}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 active:bg-white/10 transition-colors font-medium text-lg"
                  >
                    -
                  </button>
                </Tooltip>
                <div className="flex-1 text-center text-sm font-medium">
                  {transposeStep > 0 ? `+${transposeStep}` : transposeStep}
                </div>
                <Tooltip content="Transpose Up">
                  <button 
                    onClick={increaseTranspose}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 active:bg-white/10 transition-colors font-medium text-lg"
                  >
                    +
                  </button>
                </Tooltip>
              </div>
            </div>
            
            {/* Edit Song Button */}
            {songId && (
              <>
                <div className="w-full h-px bg-white/10" />
                <Link
                  href={`/admin/edit/${songId}`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-secondary hover:text-white transition-colors text-sm font-medium border border-white/10"
                >
                  <Edit2 size={16} />
                  Edit Song in Admin
                </Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
