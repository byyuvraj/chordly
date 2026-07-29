"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Edit2, Trash2, Search } from 'lucide-react';
import { Tooltip } from '@/components/Tooltip';
import { ConfirmModal } from '@/components/ConfirmModal';

interface SongEntry {
  id: string;
  title: string;
  artist: string;
  file: string;
  content?: string;
}

export default function AdminDashboard() {
  const [songs, setSongs] = useState<SongEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [songToDelete, setSongToDelete] = useState<SongEntry | null>(null);

  const q = search.toLowerCase().trim();

  const filteredSongs = songs.filter(song => {
    if (!q) return true;
    return song.title.toLowerCase().includes(q) || 
           song.artist.toLowerCase().includes(q) ||
           (song.content && song.content.toLowerCase().includes(q));
  });

  useEffect(() => {
    const loadSongs = async () => {
      try {
        const res = await fetch('/songs/index.json');
        let staticSongs = await res.json();
        
        // Filter out recently deleted songs that Vercel hasn't removed yet
        try {
          const deleted = JSON.parse(localStorage.getItem('chordly_deleted_songs') || '[]');
          if (deleted.length > 0) {
            // Clean up: only keep deleted IDs that are STILL incorrectly showing up in staticSongs
            const stillPresentDeleted = deleted.filter((id: string) => staticSongs.some((s: SongEntry) => s.id === id));
            localStorage.setItem('chordly_deleted_songs', JSON.stringify(stillPresentDeleted));
            
            staticSongs = staticSongs.filter((s: SongEntry) => !deleted.includes(s.id));
          }
        } catch (e) {}

        const populatedSongs = await Promise.all(
          staticSongs.map(async (song: SongEntry) => {
            if (song.file) {
              try {
                const textRes = await fetch(`/songs/${song.file}`);
                if (textRes.ok) {
                  song.content = await textRes.text();
                }
              } catch (e) {
                // Ignore failure
              }
            }
            return song;
          })
        );
        
        setSongs(populatedSongs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadSongs();
  }, []);

  const handleDelete = async () => {
    if (!songToDelete) return;
    
    const id = songToDelete.id;
    // Optimistic UI update
    setSongs(songs.filter(s => s.id !== id));
    setSongToDelete(null);

    // Track deleted song in localStorage to prevent it from reappearing on refresh before Vercel builds
    try {
      const deleted = JSON.parse(localStorage.getItem('chordly_deleted_songs') || '[]');
      if (!deleted.includes(id)) {
        deleted.push(id);
        localStorage.setItem('chordly_deleted_songs', JSON.stringify(deleted));
      }
    } catch(e) {}

    try {
      const res = await fetch('/api/github', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (!res.ok) {
        console.error('Failed to delete on GitHub');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 sm:p-8">
      <ConfirmModal 
        isOpen={!!songToDelete}
        title="Delete Song"
        message={`Are you sure you want to delete "${songToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        isDanger={true}
        onConfirm={handleDelete}
        onCancel={() => setSongToDelete(null)}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Songs Library</h1>
          <p className="text-secondary text-sm sm:text-base">Manage your Ukulele song collection.</p>
        </div>
        <Link 
          href="/admin/edit/new"
          className="bg-accent text-black font-semibold px-6 py-2.5 rounded-full hover:bg-accent/90 transition-colors w-full sm:w-auto text-center"
        >
          Add New Song
        </Link>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="text-secondary" size={20} />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-foreground placeholder-secondary focus:outline-none focus:border-accent transition-all"
          placeholder="Search songs by title or artist..."
        />
      </div>

      {loading ? (
        <div className="text-secondary">Loading songs...</div>
      ) : (
        <div className="bg-black/20 border border-white/5 rounded-2xl overflow-x-auto">
          <table className="w-full text-left sm:min-w-[600px]">
            <thead className="bg-black/40 text-secondary text-sm uppercase tracking-wider">
              <tr>
                <th className="px-4 sm:px-6 py-4 font-medium">Song</th>
                <th className="hidden sm:table-cell px-6 py-4 font-medium">Artist</th>
                <th className="px-4 sm:px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredSongs.map((song) => (
                <tr key={song.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 shrink-0 rounded-xl bg-white/5 flex items-center justify-center text-accent">
                        <FileText size={18} />
                      </div>
                      <span className="font-medium text-base sm:text-lg truncate max-w-[150px] sm:max-w-xs">{song.title}</span>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 text-secondary">
                    {song.artist}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 transition-opacity">
                      <Tooltip content="Edit Song">
                        <Link 
                          href={`/admin/edit/${song.id}`}
                          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 text-secondary hover:text-white transition-colors"
                        >
                          <Edit2 size={16} />
                        </Link>
                      </Tooltip>
                      <Tooltip content="Delete Song" align="right">
                        <button 
                          onClick={() => setSongToDelete(song)}
                          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-secondary hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSongs.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-secondary">
                    No songs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
