"use client";

import { useState, useEffect, use, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { parseChordPro } from '@/lib/chordParser';
import { UkeChordDiagram } from '@/components/UkeChordDiagram';
import { Save, ExternalLink, Loader2, RefreshCw } from 'lucide-react';

export default function AdminEditPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const isNew = unwrappedParams.id === 'new';
  const router = useRouter();

  const defaultTemplate = `{key: C}
{tempo: 90}
{time: 4/4}
{strumming: D D U U D U}

# --- TABS ---
# Add your tabs between the {sot} and {eot} tags
# You can name a tab block by adding a colon and name like this: {sot: Intro Riff}
{sot: Intro Riff}
A|----------------------|
E|----------------------|
C|----------------------|
G|----------------------|
{eot}

# --- LYRICS & CHORDS ---
# Add your chords in brackets, like [C] or [G]
[C]Your lyrics go [G]here...
`;

  const [id, setId] = useState(isNew ? '' : unwrappedParams.id);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [content, setContent] = useState(isNew ? defaultTemplate : '');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isNew) {
      fetch(`/songs/${unwrappedParams.id}.txt`)
        .then(res => {
          if (!res.ok) throw new Error("Song not found locally");
          return res.text();
        })
        .then(text => {
          let cleanText = text;
          const titleMatch = text.match(/{title:\s*(.*?)}/i);
          const artistMatch = text.match(/{artist:\s*(.*?)}/i);

          if (titleMatch) {
            setTitle(titleMatch[1]);
            cleanText = cleanText.replace(/{title:\s*(.*?)}\n?/i, '');
          }
          if (artistMatch) {
            setArtist(artistMatch[1]);
            cleanText = cleanText.replace(/{artist:\s*(.*?)}\n?/i, '');
          }

          setContent(cleanText.trimStart());
          setLoading(false);
        })
        .catch(err => {
          setError('Failed to load song from local files.');
          setLoading(false);
        });
    }
  }, [unwrappedParams.id, isNew]);

  // Inject metadata for parser preview and safely parse
  const parsedSong = useMemo(() => {
    try {
      const fullContentForPreview = `{title: ${title || 'Untitled'}}\n{artist: ${artist || 'Unknown Artist'}}\n${content}`;
      return parseChordPro(fullContentForPreview, 0);
    } catch (e) {
      // If parsing fails (e.g. user is actively typing an unclosed bracket '[C'), just return null
      return null;
    }
  }, [title, artist, content]);

  const handleSave = async () => {
    if (!id || !title || !artist || !content) {
      setError("Please fill out ID, Title, Artist, and the ChordPro content.");
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const fullContentToSave = `{title: ${title}}\n{artist: ${artist}}\n${content}`;

      const res = await fetch('/api/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, title, artist, content: fullContentToSave })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(`Successfully pushed to GitHub! Vercel is now building it.`);
        if (isNew) {
          router.replace(`/admin/edit/${id}`);
        }
      } else {
        setError(data.error || 'Failed to save to GitHub');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // We no longer need syncDirectives as they are decoupled
  // and dynamically injected on save/preview.

  if (loading) {
    return <div className="p-8 text-secondary">Loading editor...</div>;
  }

  return (
    <div className="flex flex-col min-h-[100dvh] lg:h-screen lg:overflow-hidden">
      {/* Header bar */}
      <header className="h-auto lg:h-16 py-4 lg:py-0 border-b border-white/5 bg-black/40 flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 shrink-0 gap-4">
        <h1 className="font-bold text-lg">{isNew ? 'Create New Song' : `Editing: ${title || id}`}</h1>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {error && <span className="text-red-400 text-sm hidden sm:inline">{error}</span>}
          {success && <span className="text-green-400 text-sm hidden sm:flex items-center gap-2">{success}</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-accent text-black font-semibold px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-accent/90 transition-colors disabled:opacity-50 w-full sm:w-auto"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span>Publish to GitHub</span>
          </button>
        </div>
        {/* Mobile only status messages */}
        {(error || success) && (
          <div className="w-full sm:hidden text-center text-sm">
            {error && <span className="text-red-400">{error}</span>}
            {success && <span className="text-green-400">{success}</span>}
          </div>
        )}
      </header>

      {/* Split Pane */}
      <div className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden">

        {/* Left: Editor */}
        <div className="w-full lg:w-1/2 border-r border-white/5 flex flex-col bg-background min-h-[500px] lg:min-h-0 lg:overflow-hidden">
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 shrink-0 bg-black/20 border-b border-white/5">
            <div>
              <label className="block text-xs text-secondary mb-1 uppercase tracking-wider">URL Slug (ID)</label>
              <input
                type="text"
                value={id}
                onChange={e => setId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                placeholder="e.g. dil-ko-tumse"
                disabled={!isNew}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-accent disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs text-secondary mb-1 uppercase tracking-wider">Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Song Title"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-accent"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-secondary mb-1 uppercase tracking-wider">Artist</label>
              <input
                type="text"
                value={artist}
                onChange={e => setArtist(e.target.value)}
                placeholder="Artist Name"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-accent"
              />
            </div>
          </div>
          <div className="flex-1 p-4 flex flex-col">
            <label className="flex items-center justify-between text-xs text-secondary mb-2 uppercase tracking-wider">
              <span>Add Chords & Tabs Content</span>
            </label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg p-4 font-mono text-sm outline-none focus:border-accent resize-none w-full"
              placeholder="{title: Song Name}\n\n[C]Lyrics go here..."
            />
          </div>
        </div>

        {/* Right: Preview */}
        <div className="w-full lg:w-1/2 bg-black/40 lg:overflow-y-auto p-4 sm:p-8 relative min-h-[500px]">
          <div className="hidden lg:block absolute top-4 right-4 px-3 py-1 rounded-full bg-white/10 text-xs text-white/50 border border-white/5">
            Live Preview
          </div>

          {/* Render the preview exactly like the main app */}
          {parsedSong ? (
            <div className="max-w-xl mx-auto pb-20">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">{parsedSong.title || 'Untitled'}</h1>
                <p className="text-secondary text-lg">{parsedSong.artist || 'Unknown Artist'}</p>

                {(parsedSong.key || parsedSong.tempo || parsedSong.time || parsedSong.strumming) && (
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    {parsedSong.key && <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm">Key: {parsedSong.key}</span>}
                    {parsedSong.tempo && <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm">Tempo: {parsedSong.tempo}</span>}
                    {parsedSong.time && <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm">{parsedSong.time}</span>}
                    {parsedSong.strumming && <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-mono tracking-widest">{parsedSong.strumming}</span>}
                  </div>
                )}
              </div>

              {parsedSong.uniqueChords.length > 0 && (
                <div className="mb-10 flex flex-wrap justify-center gap-4">
                  {parsedSong.uniqueChords.map(chord => (
                    <div key={chord} className="flex flex-col items-center">
                      <UkeChordDiagram chord={chord} />
                      <span className="mt-2 text-xs font-medium text-secondary">{chord}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-1">
                {parsedSong.lines.map((line, lineIndex) => {
                  if (line.type === 'empty') {
                    return <div key={lineIndex} className="h-6" />;
                  }

                  if (line.type === 'tab') {
                    return (
                      <div key={lineIndex} className="my-6 text-left">
                        <div className="text-xs text-secondary mb-2 opacity-60 uppercase tracking-wider font-bold">
                          {line.tabLabel || "Tablature"}
                        </div>
                        <div className="bg-black/30 border border-white/5 rounded-xl p-4 overflow-x-auto scrollbar-hide shadow-inner">
                          <pre className="font-mono text-[0.85em] leading-relaxed text-foreground/90">
                            {line.items.map(item => item.lyrics).join('')}
                          </pre>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={lineIndex} className="flex flex-wrap leading-tight">
                      {line.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex flex-col mr-1 mb-2">
                          {item.chords ? (
                            <span className="font-bold text-accent h-6 text-sm sm:text-base">
                              {item.chords}
                            </span>
                          ) : (
                            <span className="h-6"></span>
                          )}
                          {item.lyrics ? (
                            <span className="text-foreground/90 text-sm sm:text-base whitespace-pre">
                              {item.lyrics}
                            </span>
                          ) : (
                            <span className="text-foreground/90 text-sm sm:text-base whitespace-pre"> </span>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="max-w-xl mx-auto pt-20 text-center text-secondary">
              <p>Keep typing... (Fix any unclosed brackets or syntax errors)</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
