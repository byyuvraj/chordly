"use client";

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sliders } from 'lucide-react';
import { parseChordPro, ParsedSong } from '@/lib/chordParser';
import { UkeChordDiagram } from '@/components/UkeChordDiagram';
import { AutoScrollToolbar } from '@/components/AutoScrollToolbar';
import { useAutoScroll } from '@/hooks/useAutoScroll';

export default function SongViewer({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [song, setSong] = useState<ParsedSong | null>(null);
  const [rawContent, setRawContent] = useState("");
  const [transposeStep, setTransposeStep] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const { isPlaying, togglePlay, speed, increaseSpeed, decreaseSpeed, setSpeed, setIsPlaying } = useAutoScroll();
  const [textSize, setTextSize] = useState(16);

  useEffect(() => {
    const fetchSong = async () => {
      try {
        // First check local storage for custom songs
        const customSongs = JSON.parse(localStorage.getItem('customSongs') || '[]');
        const custom = customSongs.find((s: any) => s.id === resolvedParams.id);
        
        if (custom) {
          setRawContent(custom.content);
        } else {
          // Fetch from manifest
          const indexRes = await fetch('/songs/index.json');
          const index = await indexRes.json();
          const manifestEntry = index.find((s: any) => s.id === resolvedParams.id);
          
          if (!manifestEntry) throw new Error("Song not found");
          
          const textRes = await fetch("/songs/" + manifestEntry.file);
          if (!textRes.ok) throw new Error("Could not fetch song file");
          const text = await textRes.text();
          setRawContent(text);
        }
      } catch (error) {
        console.error(error);
        alert("Song not found!");
        router.push('/');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSong();
  }, [resolvedParams.id, router]);

  useEffect(() => {
    if (rawContent) {
      setSong(parseChordPro(rawContent, transposeStep));
    }
  }, [rawContent, transposeStep]);

  if (loading || !song) {
    return <div className="flex-1 flex items-center justify-center h-screen text-secondary">Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background relative" style={{ fontSize: textSize + 'px' }}>
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-glass-border">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()} 
              className="p-2 -ml-2 text-secondary hover:text-foreground transition-colors rounded-full hover:bg-white/5"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="font-bold text-foreground text-lg leading-tight truncate max-w-[200px] sm:max-w-xs">{song.title}</h1>
              <p className="text-secondary text-xs">{song.artist}</p>
            </div>
          </div>
          
          <div className="flex items-center bg-white/5 border border-white/10 rounded-full px-3 py-1">
            <span className="text-secondary text-xs mr-2 uppercase tracking-wide">Key</span>
            <span className="text-accent font-bold text-sm">
              {song.key}
            </span>
          </div>
        </div>
      </header>

      {/* Ukulele Chord Strip */}
      {song.uniqueChords.length > 0 && (
        <div className="w-full bg-glass border-b border-glass-border overflow-hidden shadow-inner">
          <div className="max-w-4xl mx-auto px-6 py-6 flex gap-8 overflow-x-auto scrollbar-hide">
            {song.uniqueChords.map(chord => (
              <div key={chord} className="flex-shrink-0">
                <UkeChordDiagram chord={chord} width={90} className="hover:scale-105 transition-transform" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Info Section */}
      {(song.tempo || song.time || song.strumming) && (
        <div className="max-w-4xl mx-auto w-full px-4 pt-6">
          <div className="flex flex-wrap items-center gap-4 text-secondary text-sm">
            {song.tempo && (
              <div className="flex items-center bg-white/5 border border-white/10 rounded-full px-3 py-1">
                <span className="uppercase tracking-wider text-[10px] opacity-70 mr-2">Tempo</span>
                <span className="font-semibold text-foreground">{song.tempo} BPM</span>
              </div>
            )}
            
            {song.time && (
              <div className="flex items-center bg-white/5 border border-white/10 rounded-full px-3 py-1">
                <span className="uppercase tracking-wider text-[10px] opacity-70 mr-2">Time</span>
                <span className="font-semibold text-foreground">{song.time}</span>
              </div>
            )}

            {song.strumming && (
              <div className="flex items-center bg-white/5 border border-white/10 rounded-full px-3 py-1">
                <span className="uppercase tracking-wider text-[10px] opacity-70 mr-3">Strumming</span>
                <div className="flex gap-1">
                  {song.strumming.split(' ').map((stroke, i) => (
                    <span 
                      key={i} 
                      className={`flex items-center justify-center w-5 h-5 rounded text-xs font-bold ${
                        stroke.toUpperCase() === 'D' ? "bg-accent text-black" : 
                        stroke.toUpperCase() === 'U' ? "bg-white/20 text-white" : "bg-transparent text-secondary"
                      }`}
                    >
                      {stroke}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Song Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 pb-48 pt-8">
        <div className="font-sans space-y-3">
          {song.lines.map((line, lineIndex) => {
            if (line.type === 'empty') {
              return <div key={lineIndex} className="h-6" />;
            }

            if (line.type === 'tab') {
              return (
                <div key={lineIndex} className="my-6">
                  <div className="text-xs text-secondary mb-2 opacity-60 uppercase tracking-wider font-bold">
                    {line.tabLabel || "Tablature"}
                  </div>
                  <div className="bg-black/30 border border-white/5 rounded-xl p-4 overflow-x-auto scrollbar-hide shadow-inner">
                    <pre className="font-mono text-[0.95em] leading-relaxed text-foreground/90">
                      {line.items.map(item => item.lyrics).join('')}
                    </pre>
                  </div>
                </div>
              );
            }

            return (
              <div key={lineIndex} className="flex flex-wrap leading-tight">
                {line.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex flex-col">
                    {/* Render Chord */}
                    <div className="min-h-[1.5rem] flex items-end mb-0.5">
                      {item.chords ? (
                        <span className="text-accent font-bold text-[0.85em] px-1 py-0.5 rounded-md bg-accent/10 border border-accent/20 shadow-sm z-10 cursor-default">
                          {item.chords}
                        </span>
                      ) : (
                        <span className="whitespace-pre"> </span>
                      )}
                    </div>
                    {/* Render Lyric */}
                    <span className="whitespace-pre-wrap text-foreground/90 font-medium text-[1.1em]">
                      {item.lyrics || (item.chords ? ' ' : '')}
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </main>

      <AutoScrollToolbar
        isPlaying={isPlaying}
        togglePlay={togglePlay}
        speed={speed}
        increaseSpeed={increaseSpeed}
        decreaseSpeed={decreaseSpeed}
        textSize={textSize}
        setTextSize={setTextSize}
        transposeStep={transposeStep}
        increaseTranspose={() => setTransposeStep(s => s + 1)}
        decreaseTranspose={() => setTransposeStep(s => s - 1)}
        tempo={song.tempo ? parseInt(song.tempo) : undefined}
      />
    </div>
  );
}
