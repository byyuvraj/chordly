import ChordSheetJS from 'chordsheetjs';

export interface ParsedSong {
  title: string;
  key: string;
  tempo?: string;
  strumming?: string;
  time?: string;
  lines: ParsedLine[];
  uniqueChords: string[];
}

export interface ParsedLine {
  items: ParsedItem[];
  type: 'lyric' | 'chord' | 'empty' | 'tab';
  tabLabel?: string;
}

export interface ParsedItem {
  lyrics: string;
  chords: string;
}

export function parseChordPro(chordProString: string, transposeStep: number = 0): ParsedSong {
  const parser = new ChordSheetJS.ChordProParser();
  let song = parser.parse(chordProString);

  if (transposeStep !== 0) {
    song = song.transpose(transposeStep);
  }

  const uniqueChords = new Set<string>();
  const meta = song.metadata as any;
  const title = (Array.isArray(meta.title) ? meta.title[0] : meta.title) || "Untitled Song";
  const songKey = (Array.isArray(meta.key) ? meta.key[0] : meta.key) || "C";
  const tempo = (Array.isArray(meta.tempo) ? meta.tempo[0] : meta.tempo) || "120";
  const strumming = (Array.isArray(meta.strumming) ? meta.strumming[0] : meta.strumming) || "D D U U D U";
  const time = (Array.isArray(meta.time) ? meta.time[0] : meta.time) || "4/4";

  let inTabBlock = false;
  let currentTabLabel = "Tablature";

  let cleanedLines = song.lines.map(line => {
    let lineIsEot = false;
    let labelForThisLine = currentTabLabel;

    line.items.forEach((item: any) => {
      if (item.name === 'start_of_tab' || item.name === 'sot' || (item.lyrics && item.lyrics.includes('{sot}'))) {
        inTabBlock = true;
        if (item.value) {
          currentTabLabel = item.value;
        } else {
          currentTabLabel = "Tablature";
        }
        labelForThisLine = currentTabLabel;
      }
      if (item.name === 'end_of_tab' || item.name === 'eot' || (item.lyrics && item.lyrics.includes('{eot}'))) {
        lineIsEot = true;
      }
    });

    const items: ParsedItem[] = line.items.map(item => {
      let chordName = '';
      if (item instanceof ChordSheetJS.ChordLyricsPair) {
        chordName = item.chords || '';
        if (chordName) uniqueChords.add(chordName);
        return {
          chords: chordName,
          lyrics: item.lyrics || ''
        };
      }
      
      if (item instanceof ChordSheetJS.Tag || item instanceof ChordSheetJS.Comment) {
        return null;
      }

      return { chords: '', lyrics: (item as any).string || item.toString() || '' };
    }).filter(i => i !== null && !i.lyrics.includes('{sot}') && !i.lyrics.includes('{eot}')) as ParsedItem[];

    let type: 'lyric' | 'chord' | 'empty' | 'tab' = 'lyric';
    if (line.isEmpty() && items.length === 0) {
      type = 'empty';
    } else if (inTabBlock && !lineIsEot) {
      type = 'tab';
    } else if (line.items.some((item: any) => item.chords)) {
      type = 'chord';
    } else if (items.every(i => i.lyrics.trim() === '')) {
      type = 'empty';
    }

    if (lineIsEot) inTabBlock = false;

    return {
      items,
      type,
      tabLabel: type === 'tab' ? labelForThisLine : undefined
    };
  }) as ParsedLine[];

  // Remove leading empty lines
  const firstNonEmptyIndex = cleanedLines.findIndex(line => line.type !== 'empty');
  if (firstNonEmptyIndex > 0) {
    cleanedLines = cleanedLines.slice(firstNonEmptyIndex);
  }

  // Collapse consecutive empty lines
  cleanedLines = cleanedLines.filter((line, index, arr) => {
    if (line.type === 'empty' && index > 0 && arr[index - 1].type === 'empty') {
      return false;
    }
    return true;
  });

  // Group consecutive tab lines into single tab blocks
  const groupedLines: ParsedLine[] = [];
  let currentTabBlock: ParsedLine | null = null;

  cleanedLines.forEach(line => {
    if (line.type === 'tab') {
      if (!currentTabBlock) {
        currentTabBlock = { type: 'tab', items: [...line.items], tabLabel: line.tabLabel };
      } else {
        // Add a newline item and then the next items
        currentTabBlock.items.push({ chords: '', lyrics: '\n' });
        currentTabBlock.items.push(...line.items);
      }
    } else {
      if (currentTabBlock) {
        groupedLines.push(currentTabBlock);
        currentTabBlock = null;
      }
      groupedLines.push(line);
    }
  });
  if (currentTabBlock) groupedLines.push(currentTabBlock);

  return {
    title,
    key: songKey,
    tempo,
    strumming,
    time,
    lines: groupedLines,
    uniqueChords: Array.from(uniqueChords)
  };
}
