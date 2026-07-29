"use client";

import React, { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { SongCard } from '@/components/SongCard';
import { AddSongModal } from '@/components/AddSongModal';
import { motion } from 'framer-motion';

interface SongMeta {
  id: string;
  title: string;
  artist: string;
  key: string;
  tags?: string[];
  file?: string;
  content?: string; // For custom songs
}

export default function Home() {
  const [songs, setSongs] = useState<SongMeta[]>([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadSongs = async () => {
    try {
      const res = await fetch('/songs/index.json');
      const staticSongs = await res.json();
      
      const customSongs = JSON.parse(localStorage.getItem('customSongs') || '[]');
      
      setSongs([...staticSongs, ...customSongs]);
    } catch (error) {
      console.error("Failed to load songs", error);
    }
  };

  useEffect(() => {
    loadSongs();
  }, []);

  const filteredSongs = songs.filter(s => {
    const q = search.toLowerCase();
    return s.title.toLowerCase().includes(q) || 
           s.artist.toLowerCase().includes(q) || 
           s.tags?.some(t => t.toLowerCase().includes(q));
  });

  return (
    <main className="flex-1 max-w-3xl w-full mx-auto p-4 pb-32">
      <header className="py-8">
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">Chordly</h1>
        <p className="text-secondary text-lg">Your personal ukulele chord book.</p>
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
          placeholder="Search by title, artist, or tags..."
        />
      </div>

      <div className="flex flex-col gap-4">
        {filteredSongs.length > 0 ? (
          filteredSongs.map(song => (
            <SongCard
              key={song.id}
              id={song.id}
              title={song.title}
              artist={song.artist}
              songKey={song.key}
              tags={song.tags}
            />
          ))
        ) : (
          <div className="text-center py-12 text-secondary">
            <p>No songs found.</p>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-accent rounded-full flex items-center justify-center text-black shadow-[0_0_30px_rgba(245,197,99,0.3)] hover:shadow-[0_0_40px_rgba(245,197,99,0.5)] transition-shadow z-40"
      >
        <Plus size={32} />
      </motion.button>

      <AddSongModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={loadSongs}
      />
    </main>
  );
}
