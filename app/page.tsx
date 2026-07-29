"use client";

import React, { useState, useEffect } from 'react';
import { Search, Plus, BookOpen, Activity } from 'lucide-react';
import { SongCard } from '@/components/SongCard';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Tooltip } from '@/components/Tooltip';

interface SongMeta {
  id: string;
  title: string;
  artist: string;
  key: string;
  file?: string;
  content?: string; // Lyrics/chords text
}

export default function Home() {
  const [songs, setSongs] = useState<SongMeta[]>([]);
  const [search, setSearch] = useState("");
  const router = useRouter();

  const loadSongs = async () => {
    try {
      const res = await fetch('/songs/index.json');
      const staticSongs = await res.json();
      
      // Fetch text content for all static songs in parallel to enable lyrics search
      const populatedSongs = await Promise.all(
        staticSongs.map(async (song: SongMeta) => {
          if (song.file) {
            try {
              const textRes = await fetch(`/songs/${song.file}`);
              if (textRes.ok) {
                const text = await textRes.text();
                song.content = text;
                const keyMatch = text.match(/{(?:key|k):\s*([^}]+)}/i);
                song.key = keyMatch ? keyMatch[1].trim() : '';
              }
            } catch (e) {
              // Ignore failure, we just won't be able to search lyrics for this song
            }
          }
          return song;
        })
      );
      
      const customSongs = JSON.parse(localStorage.getItem('customSongs') || '[]');
      setSongs([...populatedSongs, ...customSongs]);
    } catch (error) {
      console.error("Failed to load songs", error);
    }
  };

  useEffect(() => {
    loadSongs();
  }, []);

  const q = search.toLowerCase().trim();
  
  let titleArtistMatches: SongMeta[] = [];
  let lyricsMatches: SongMeta[] = [];

  if (!q) {
    titleArtistMatches = songs;
  } else {
    titleArtistMatches = songs.filter(s => 
      s.title.toLowerCase().includes(q) || 
      s.artist.toLowerCase().includes(q)
    );
    
    const titleArtistIds = new Set(titleArtistMatches.map(s => s.id));
    
    lyricsMatches = songs.filter(s => 
      !titleArtistIds.has(s.id) && 
      s.content?.toLowerCase().includes(q)
    );
  }

  return (
    <main className="flex-1 max-w-3xl w-full mx-auto p-4 pb-32">
      <header className="py-8">
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">Chordly</h1>
        <p className="text-secondary text-lg">
          <a href="https://yuvrajs.me" target="_blank" rel="noopener noreferrer" className="text-foreground hover:underline decoration-accent underline-offset-4 transition-colors">
            Yuvraj's
          </a> personal ukulele chord book.
        </p>
      </header>

      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="text-secondary" size={20} />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-foreground placeholder-secondary focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all shadow-inner"
          placeholder="Search by title, artist, or lyrics..."
        />
      </div>

      <div className="flex flex-col gap-6">
        {titleArtistMatches.length > 0 || lyricsMatches.length > 0 ? (
          <>
            {/* Title / Artist Matches */}
            {titleArtistMatches.length > 0 && (
              <div className="flex flex-col gap-4">
                {q && <h2 className="text-sm font-bold text-secondary uppercase tracking-wider pl-2">Title & Artist Matches</h2>}
                {titleArtistMatches.map(song => (
                  <SongCard
                    key={song.id}
                    id={song.id}
                    title={song.title}
                    artist={song.artist}
                    songKey={song.key}
                  />
                ))}
              </div>
            )}

            {/* Lyrics Matches */}
            {lyricsMatches.length > 0 && (
              <div className="flex flex-col gap-4 mt-4">
                <h2 className="text-sm font-bold text-secondary uppercase tracking-wider pl-2">Lyrics Matches</h2>
                {lyricsMatches.map(song => (
                  <SongCard
                    key={`lyrics-${song.id}`}
                    id={song.id}
                    title={song.title}
                    artist={song.artist}
                    songKey={song.key}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-secondary">
            <p>No songs found matching your search.</p>
          </div>
        )}
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 flex flex-col gap-3 sm:gap-4 z-40">
        <Tooltip content="Metronome">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/metronome')}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-glass border border-glass-border rounded-full flex items-center justify-center text-secondary hover:text-foreground shadow-lg hover:bg-white/10 transition-all self-end backdrop-blur-xl"
          >
            <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
          </motion.button>
        </Tooltip>

        <Tooltip content="Chord Library">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/chords')}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-glass border border-glass-border rounded-full flex items-center justify-center text-secondary hover:text-foreground shadow-lg hover:bg-white/10 transition-all self-end backdrop-blur-xl"
          >
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
          </motion.button>
        </Tooltip>

        <Tooltip content="Add New Song">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/admin')}
            className="w-12 h-12 sm:w-16 sm:h-16 bg-accent rounded-full flex items-center justify-center text-black shadow-[0_0_30px_rgba(245,197,99,0.3)] hover:shadow-[0_0_40px_rgba(245,197,99,0.5)] transition-shadow self-end"
          >
            <Plus className="w-6 h-6 sm:w-8 sm:h-8" />
          </motion.button>
        </Tooltip>
      </div>
    </main>
  );
}
