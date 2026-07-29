"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { parseChordPro } from '@/lib/chordParser';

interface AddSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function AddSongModal({ isOpen, onClose, onSave }: AddSongModalProps) {
  const [chordProText, setChordProText] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSave = () => {
    try {
      const parsed = parseChordPro(chordProText);
      const newSong = {
        id: parsed.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        title: parsed.title,
        artist: parsed.artist,
        key: parsed.key,
        tags: ["Custom"],
        content: chordProText,
      };

      const existingSongs = JSON.parse(localStorage.getItem('customSongs') || '[]');
      existingSongs.push(newSong);
      localStorage.setItem('customSongs', JSON.stringify(existingSongs));
      
      onSave();
      onClose();
      setChordProText("");
    } catch (error) {
      alert("Invalid ChordPro format or missing title metadata.");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(chordProText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 h-[90vh] bg-[#121214] border-t border-glass-border rounded-t-3xl z-50 flex flex-col"
          >
            <div className="flex justify-between items-center p-4 border-b border-white/10">
              <h2 className="text-xl font-semibold">Add Custom Song</h2>
              <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-secondary hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="mb-4">
                <p className="text-secondary text-sm mb-2">Paste your ChordPro text below:</p>
                <textarea
                  value={chordProText}
                  onChange={(e) => setChordProText(e.target.value)}
                  className="w-full h-64 bg-black/50 border border-white/10 rounded-2xl p-4 text-sm font-mono text-foreground focus:outline-none focus:border-accent/50 resize-none"
                  placeholder={"{title: My Song}\\n{artist: My Name}\\n{key: C}\\n\\n[C]Verse line 1\\n[G]Verse line 2"}
                />
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleSave}
                  disabled={!chordProText.trim()}
                  className="w-full py-4 rounded-2xl bg-accent text-black font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                >
                  <Save size={20} />
                  Save to Local Storage
                </button>
                
                <button
                  onClick={handleCopy}
                  disabled={!chordProText.trim()}
                  className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-white/10 transition-colors"
                >
                  {copied ? <Check size={20} className="text-green-400" /> : <Copy size={20} />}
                  {copied ? "Copied!" : "Copy for GitHub Repository"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
