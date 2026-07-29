"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

export function useAutoScroll() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.0); // 1.0 is default speed
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const fractionalScrollRef = useRef<number>(0);

  const scroll = useCallback((time: number) => {
    if (lastTimeRef.current != null) {
      const deltaTime = time - lastTimeRef.current;
      // Scroll amount depends on time elapsed and speed
      // Baseline: 0.08 pixels per ms at 1.0x speed
      const scrollAmount = deltaTime * 0.08 * speed;
      
      fractionalScrollRef.current += scrollAmount;
      
      if (fractionalScrollRef.current >= 1) {
        const intScroll = Math.floor(fractionalScrollRef.current);
        window.scrollBy(0, intScroll);
        fractionalScrollRef.current -= intScroll;
      }
    }
    lastTimeRef.current = time;
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(scroll);
    }
  }, [isPlaying, speed]);

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(scroll);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      lastTimeRef.current = null;
      fractionalScrollRef.current = 0;
    }
    
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, scroll]);

  const togglePlay = () => setIsPlaying(p => !p);
  const increaseSpeed = () => setSpeed(s => Math.min(s + 0.25, 2.0));
  const decreaseSpeed = () => setSpeed(s => Math.max(s - 0.25, 0.25));

  return { isPlaying, togglePlay, speed, increaseSpeed, decreaseSpeed, setSpeed, setIsPlaying };
}
