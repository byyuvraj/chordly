import { useState, useEffect, useRef, useCallback } from 'react';

export function useMetronome(tempo?: number) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const isPlayingRef = useRef(false);
  const nextNoteTimeRef = useRef(0);
  const currentBeatInBarRef = useRef(0);
  const timerIDRef = useRef<NodeJS.Timeout | null>(null);

  const scheduleAheadTime = 0.1; // seconds
  const lookahead = 25.0; // ms

  const nextNote = useCallback(() => {
    const secondsPerBeat = 60.0 / (tempo || 120);
    nextNoteTimeRef.current += secondsPerBeat;
    currentBeatInBarRef.current = (currentBeatInBarRef.current + 1) % 4;
  }, [tempo]);

  const scheduleNote = useCallback((beatNumber: number, time: number) => {
    if (!audioContextRef.current) return;
    
    // Sync visual beat indicator
    const timeToBeat = time - audioContextRef.current.currentTime;
    setTimeout(() => {
      if (isPlayingRef.current) {
        setCurrentBeat(beatNumber);
      }
    }, Math.max(0, timeToBeat * 1000));

    // Play click sound using an oscillator
    const osc = audioContextRef.current.createOscillator();
    const envelope = audioContextRef.current.createGain();

    osc.connect(envelope);
    envelope.connect(audioContextRef.current.destination);

    // Higher pitch for the downbeat (beat 0)
    if (beatNumber === 0) {
      osc.frequency.value = 1000.0;
    } else {
      osc.frequency.value = 800.0;
    }

    // Quick attack and decay for a sharp "click" sound
    envelope.gain.value = 1;
    envelope.gain.exponentialRampToValueAtTime(1, time + 0.001);
    envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.02);

    osc.start(time);
    osc.stop(time + 0.03);
  }, []);

  const scheduler = useCallback(() => {
    if (!audioContextRef.current) return;

    while (nextNoteTimeRef.current < audioContextRef.current.currentTime + scheduleAheadTime) {
      scheduleNote(currentBeatInBarRef.current, nextNoteTimeRef.current);
      nextNote();
    }
    timerIDRef.current = setTimeout(scheduler, lookahead);
  }, [nextNote, scheduleNote]);

  useEffect(() => {
    if (isPlaying) {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }

      isPlayingRef.current = true;
      currentBeatInBarRef.current = 0;
      nextNoteTimeRef.current = audioContextRef.current.currentTime + 0.05;
      scheduler();
    } else {
      isPlayingRef.current = false;
      if (timerIDRef.current) clearTimeout(timerIDRef.current);
      setCurrentBeat(0);
    }

    return () => {
      if (timerIDRef.current) clearTimeout(timerIDRef.current);
    };
  }, [isPlaying, scheduler]);

  const toggle = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  return { isPlaying, toggle, currentBeat };
}
