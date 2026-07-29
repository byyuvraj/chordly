"use client";

import React from 'react';
import { getUkeFingering } from '@/lib/ukeChords';
import { cn } from '@/lib/utils';

interface UkeChordDiagramProps {
  chord: string;
  className?: string;
  width?: number;
}

export function UkeChordDiagram({ chord, className, width = 64 }: UkeChordDiagramProps) {
  const fingering = getUkeFingering(chord);
  const height = width * 1.4;
  const padding = width * 0.15;
  const topMargin = padding + 10; // Extra space for open strings or fret numbers
  const bottomMargin = padding;
  
  const innerWidth = width - 2 * padding;
  const innerHeight = height - topMargin - bottomMargin;
  
  const numStrings = 4;
  const numFrets = 4;
  
  const stringSpacing = innerWidth / (numStrings - 1);
  const fretSpacing = innerHeight / numFrets;

  if (!fingering) {
    return (
      <div 
        className={cn("flex flex-col items-center justify-center text-secondary rounded-lg border border-white/10 bg-white/5", className)}
        style={{ width, height }}
      >
        <span className="font-bold text-xs">{chord}</span>
        <span className="text-[8px] mt-1">?</span>
      </div>
    );
  }

  // Determine if we need to show a base fret (if the highest fret > 4)
  const maxFret = Math.max(...fingering.frets);
  const minFret = Math.min(...fingering.frets.filter(f => f > 0));
  
  let baseFret = 1;
  if (maxFret > 4) {
    baseFret = minFret;
  }

  // Adjust frets if we shifted the base fret
  const adjustedFrets = fingering.frets.map(f => {
    if (f === 0 || f === -1) return f;
    return baseFret > 1 ? f - baseFret + 1 : f;
  });

  return (
    <div className={cn("flex flex-col items-center", className)} style={{ width }}>
      <span className="font-bold text-sm mb-1 text-foreground">{chord}</span>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Nut or Top Fret Line */}
        <line 
          x1={padding} 
          y1={topMargin} 
          x2={width - padding} 
          y2={topMargin} 
          stroke="currentColor" 
          strokeWidth={baseFret === 1 ? 4 : 1}
          className="text-foreground"
        />

        {/* Frets */}
        {Array.from({ length: numFrets }).map((_, i) => (
          <line
            key={`fret-${i + 1}`}
            x1={padding}
            y1={topMargin + (i + 1) * fretSpacing}
            x2={width - padding}
            y2={topMargin + (i + 1) * fretSpacing}
            stroke="currentColor"
            strokeWidth={1}
            className="text-secondary opacity-50"
          />
        ))}

        {/* Strings */}
        {Array.from({ length: numStrings }).map((_, i) => (
          <line
            key={`string-${i}`}
            x1={padding + i * stringSpacing}
            y1={topMargin}
            x2={padding + i * stringSpacing}
            y2={height - bottomMargin}
            stroke="currentColor"
            strokeWidth={1.5}
            className="text-secondary opacity-80"
          />
        ))}

        {/* Open strings and muted strings indicators */}
        {adjustedFrets.map((fret, i) => {
          if (fret === 0) {
            return (
              <circle
                key={`open-${i}`}
                cx={padding + i * stringSpacing}
                cy={topMargin - 6}
                r={3}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                className="text-secondary"
              />
            );
          }
          if (fret === -1) {
            return (
              <text
                key={`muted-${i}`}
                x={padding + i * stringSpacing}
                y={topMargin - 4}
                fontSize="10"
                textAnchor="middle"
                className="text-secondary font-bold"
              >
                x
              </text>
            );
          }
          return null;
        })}

        {/* Base Fret Indicator */}
        {baseFret > 1 && (
          <text
            x={padding - 6}
            y={topMargin + fretSpacing / 2 + 4}
            fontSize="10"
            textAnchor="end"
            className="text-secondary"
          >
            {baseFret}
          </text>
        )}

        {/* Fingering Dots */}
        {adjustedFrets.map((fret, i) => {
          if (fret > 0) {
            return (
              <circle
                key={`dot-${i}`}
                cx={padding + i * stringSpacing}
                cy={topMargin + (fret - 0.5) * fretSpacing}
                r={4.5}
                fill="currentColor"
                className="text-accent"
              />
            );
          }
          return null;
        })}
      </svg>
    </div>
  );
}
