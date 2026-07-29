export type UkeChordFingering = {
  frets: number[]; // G, C, E, A strings. 0 = open, -1 = muted. e.g. [0,0,0,3] for C
  baseFret?: number; // if the chord is played higher up the neck
};

export const ukeChords: Record<string, UkeChordFingering> = {
  // Major
  "C": { frets: [0, 0, 0, 3] },
  "C#": { frets: [1, 1, 1, 4] },
  "Db": { frets: [1, 1, 1, 4] },
  "D": { frets: [2, 2, 2, 0] },
  "D#": { frets: [3, 3, 3, 1] },
  "Eb": { frets: [0, 3, 3, 1] },
  "E": { frets: [4, 4, 4, 2] },
  "F": { frets: [2, 0, 1, 0] },
  "F#": { frets: [3, 1, 2, 1] },
  "Gb": { frets: [3, 1, 2, 1] },
  "G": { frets: [0, 2, 3, 2] },
  "G#": { frets: [5, 3, 4, 3] },
  "Ab": { frets: [5, 3, 4, 3] },
  "A": { frets: [2, 1, 0, 0] },
  "A#": { frets: [3, 2, 1, 1] },
  "Bb": { frets: [3, 2, 1, 1] },
  "B": { frets: [4, 3, 2, 2] },

  // Minor
  "Cm": { frets: [0, 3, 3, 3] },
  "C#m": { frets: [1, 4, 4, 4] },
  "Dbm": { frets: [1, 4, 4, 4] },
  "Dm": { frets: [2, 2, 1, 0] },
  "D#m": { frets: [3, 3, 2, 1] },
  "Ebm": { frets: [3, 3, 2, 1] },
  "Em": { frets: [0, 4, 3, 2] },
  "Fm": { frets: [1, 0, 1, 3] },
  "F#m": { frets: [2, 1, 2, 0] },
  "Gbm": { frets: [2, 1, 2, 0] },
  "Gm": { frets: [0, 2, 3, 1] },
  "G#m": { frets: [4, 3, 4, 2] },
  "Abm": { frets: [4, 3, 4, 2] },
  "Am": { frets: [2, 0, 0, 0] },
  "A#m": { frets: [3, 1, 1, 1] },
  "Bbm": { frets: [3, 1, 1, 1] },
  "Bm": { frets: [4, 2, 2, 2] },

  // Dominant 7th
  "C7": { frets: [0, 0, 0, 1] },
  "D7": { frets: [2, 2, 2, 3] },
  "E7": { frets: [1, 2, 0, 2] },
  "F7": { frets: [2, 3, 1, 3] },
  "G7": { frets: [0, 2, 1, 2] },
  "A7": { frets: [0, 1, 0, 0] },
  "B7": { frets: [2, 3, 2, 2] },
  
  // Major 7th
  "Cmaj7": { frets: [0, 0, 0, 2] },
  "Fmaj7": { frets: [2, 4, 1, 3] }, // or 2 0 1 0 actually is F, wait Fmaj7 is 2413 or 5557, let's use common 2-4-1-3
  
  // Sus 4
  "Csus4": { frets: [0, 0, 1, 3] },
  "Dsus4": { frets: [2, 2, 3, 0] },
  "Esus4": { frets: [2, 4, 5, 2] },
};

export function getUkeFingering(chordName: string): UkeChordFingering | null {
  if (!chordName) return null;
  // Try to find exact match
  if (ukeChords[chordName]) return ukeChords[chordName];
  
  // Fallback cleanup (e.g. sometimes people write Cmaj instead of C)
  if (chordName.endsWith('maj')) return ukeChords[chordName.replace('maj', '')] || null;
  
  return null;
}
