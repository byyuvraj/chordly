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
}

export function SongCard({ id, title, artist, songKey }: SongCardProps) {
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
      </motion.div>
    </Link>
  );
}
