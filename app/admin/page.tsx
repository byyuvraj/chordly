"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Edit2, Trash2 } from 'lucide-react';

interface SongEntry {
  id: string;
  title: string;
  artist: string;
  file: string;
}

export default function AdminDashboard() {
  const [songs, setSongs] = useState<SongEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/songs/index.json')
      .then(res => res.json())
      .then(data => {
        setSongs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Songs Library</h1>
          <p className="text-secondary">Manage your Ukulele song collection.</p>
        </div>
        <Link 
          href="/admin/edit/new"
          className="bg-accent text-black font-semibold px-6 py-2.5 rounded-full hover:bg-accent/90 transition-colors"
        >
          Add New Song
        </Link>
      </div>

      {loading ? (
        <div className="text-secondary">Loading songs...</div>
      ) : (
        <div className="bg-black/20 border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-black/40 text-secondary text-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Song</th>
                <th className="px-6 py-4 font-medium">Artist</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {songs.map((song) => (
                <tr key={song.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-accent">
                        <FileText size={18} />
                      </div>
                      <span className="font-medium text-lg">{song.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-secondary">
                    {song.artist}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link 
                        href={`/admin/edit/${song.id}`}
                        className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 text-secondary hover:text-white transition-colors"
                      >
                        <Edit2 size={16} />
                      </Link>
                      <button className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-secondary hover:text-red-400 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {songs.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-secondary">
                    No songs found. Add your first song to get started!
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
