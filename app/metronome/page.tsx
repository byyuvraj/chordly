"use client";

import React, { useState } from 'react';
import { ArrowLeft, Play, Pause, Minus, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMetronome } from '@/hooks/useMetronome';
import { cn } from '@/lib/utils';

export default function MetronomePage() {
  const router = useRouter();
  const [tempo, setTempo] = useState(120);
  const { isPlaying, toggle, currentBeat } = useMetronome(tempo);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempo(parseInt(e.target.value));
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-glass-border">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-4">
          <button 
            onClick={() => router.back()} 
            className="p-2 -ml-2 text-secondary hover:text-foreground transition-colors rounded-full hover:bg-white/5"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="font-bold text-foreground text-lg">Pro Metronome</h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="bg-glass border border-glass-border rounded-3xl p-8 shadow-2xl max-w-sm w-full flex flex-col items-center">
          
          {/* Visual Indicator */}
          <div className="flex gap-4 mb-12">
            {[0, 1, 2, 3].map(beat => (
              <div 
                key={beat} 
                className={cn(
                  "w-4 h-4 rounded-full transition-all duration-75",
                  isPlaying && currentBeat === beat 
                    ? (beat === 0 ? "bg-red-500 scale-150 shadow-[0_0_15px_rgba(239,68,68,0.5)]" : "bg-accent scale-150 shadow-[0_0_15px_rgba(245,197,99,0.5)]") 
                    : "bg-white/10"
                )}
              />
            ))}
          </div>

          {/* Tempo Display */}
          <div className="text-center mb-8">
            <span className="text-7xl font-bold text-foreground tracking-tighter">{tempo}</span>
            <span className="text-secondary text-lg ml-2 font-medium tracking-widest uppercase">BPM</span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-6 w-full mb-8">
            <button 
              onClick={() => setTempo(t => Math.max(40, t - 1))}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 active:bg-white/20 transition-colors"
            >
              <Minus size={20} />
            </button>

            <input 
              type="range" 
              min="40" 
              max="240" 
              value={tempo} 
              onChange={handleSliderChange}
              className="flex-1 accent-accent h-2 bg-white/10 rounded-full appearance-none outline-none cursor-pointer"
            />

            <button 
              onClick={() => setTempo(t => Math.min(240, t + 1))}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 active:bg-white/20 transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>

          {/* Play Button */}
          <button
            onClick={toggle}
            className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-xl",
              isPlaying 
                ? "bg-white/10 text-white hover:bg-white/20" 
                : "bg-accent text-black hover:scale-105 shadow-[0_0_30px_rgba(245,197,99,0.3)]"
            )}
          >
            {isPlaying ? <Pause fill="currentColor" size={40} /> : <Play fill="currentColor" size={40} className="ml-2" />}
          </button>
        </div>
      </main>
    </div>
  );
}
