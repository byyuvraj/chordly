"use client";

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { UkeChordDiagram } from '@/components/UkeChordDiagram';
import { ukeChords } from '@/lib/ukeChords';

export default function ChordsPage() {
  const router = useRouter();

  // Group chords
  const groups = {
    "Major": ["C", "C#", "Db", "D", "D#", "Eb", "E", "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B"],
    "Minor": ["Cm", "C#m", "Dbm", "Dm", "D#m", "Ebm", "Em", "Fm", "F#m", "Gbm", "Gm", "G#m", "Abm", "Am", "A#m", "Bbm", "Bm"],
    "Dominant 7th": ["C7", "D7", "E7", "F7", "G7", "A7", "B7"],
    "Major 7th": ["Cmaj7", "Fmaj7"],
    "Sus 4": ["Csus4", "Dsus4", "Esus4"]
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
          <h1 className="font-bold text-foreground text-lg">Chord Library</h1>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 pb-32 pt-8">
        <p className="text-secondary mb-10 text-lg">
          Master the ukulele with this complete reference guide to all common chords.
        </p>

        {Object.entries(groups).map(([groupName, chords]) => (
          <div key={groupName} className="mb-12">
            <h2 className="text-xl font-bold text-foreground mb-6 pl-3 border-l-4 border-accent uppercase tracking-widest">{groupName}</h2>
            <div className="flex flex-wrap gap-4 sm:gap-6 justify-start">
              {chords.map(chordName => {
                const fingering = ukeChords[chordName];
                if (!fingering) return null;
                return (
                  <div key={chordName} className="flex flex-col items-center p-4 bg-glass border border-glass-border rounded-2xl hover:scale-105 hover:bg-white/5 transition-all shadow-inner w-[104px]">
                    <UkeChordDiagram chord={chordName} width={70} />
                    <span className="mt-4 font-bold text-foreground text-sm">{chordName}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
