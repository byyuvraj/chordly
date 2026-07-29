"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Music, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SongCardProps {
  id: string;
  title: string;
  artist: string;
  songKey: string;
  tags?: string[];
}

export function SongCard({ id, title, artist, songKey, tags = [] }: SongCardProps) {
  return (
    <Link href={`/song/${id}`}>
      <motion.div
        whileTap={{ scale: 0.98 }}
        className="group flex flex-col p-4 rounded-3xl bg-glass border border-glass-border backdrop-blur-xl transition-all hover:bg-white/10"
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-foreground font-semibold text-lg">{title}</h3>
            <p className="text-secondary text-sm flex items-center gap-1 mt-1">
              <Music size={14} />
              {artist}
            </p>
          </div>
          
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/10 border border-accent/20">
            <span className="text-accent font-bold text-sm">{songKey}</span>
          </div>
        </div>
        
        {tags.length > 0 && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {tags.map(tag => (
              <span 
                key={tag}
                className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-secondary text-xs flex items-center gap-1"
              >
                <Hash size={10} />
                {tag}
              </span>
            ))}
          </div>
        )}
      </motion.div>
    </Link>
  );
}
