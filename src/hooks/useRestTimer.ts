import { useState, useEffect, useRef, useCallback } from 'react';
import { playRestCompleteAlarm } from '../lib/utils';

export function useRestTimer(defaultDuration: number = 90) {
  const [totalSeconds, setTotalSeconds] = useState(defaultDuration);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const targetTimeRef = useRef<number | null>(null);

  const stopInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback((duration: number = totalSeconds) => {
    stopInterval();
    setTotalSeconds(duration);
    setRemainingSeconds(duration);
    setIsRunning(true);
    targetTimeRef.current = Date.now() + duration * 1000;

    intervalRef.current = window.setInterval(() => {
      if (!targetTimeRef.current) return;
      const diff = Math.ceil((targetTimeRef.current - Date.now()) / 1000);

      if (diff <= 0) {
        stopInterval();
        setRemainingSeconds(0);
        setIsRunning(false);
        targetTimeRef.current = null;
        playRestCompleteAlarm();
      } else {
        setRemainingSeconds(diff);
      }
    }, 250);
  }, [stopInterval, totalSeconds]);

  const pauseTimer = useCallback(() => {
    stopInterval();
    setIsRunning(false);
    targetTimeRef.current = null;
  }, [stopInterval]);

  const resumeTimer = useCallback(() => {
    if (remainingSeconds <= 0) return;
    stopInterval();
    setIsRunning(true);
    targetTimeRef.current = Date.now() + remainingSeconds * 1000;

    intervalRef.current = window.setInterval(() => {
      if (!targetTimeRef.current) return;
      const diff = Math.ceil((targetTimeRef.current - Date.now()) / 1000);

      if (diff <= 0) {
        stopInterval();
        setRemainingSeconds(0);
        setIsRunning(false);
        targetTimeRef.current = null;
        playRestCompleteAlarm();
      } else {
        setRemainingSeconds(diff);
      }
    }, 250);
  }, [remainingSeconds, stopInterval]);

  const resetTimer = useCallback(() => {
    stopInterval();
    setIsRunning(false);
    setRemainingSeconds(0);
    targetTimeRef.current = null;
  }, [stopInterval]);

  const addSeconds = useCallback((delta: number) => {
    setRemainingSeconds((prev) => {
      const next = Math.max(0, prev + delta);
      if (targetTimeRef.current) {
        targetTimeRef.current += delta * 1000;
      }
      return next;
    });
    setTotalSeconds((prev) => Math.max(0, prev + delta));
  }, []);

  useEffect(() => {
    return () => {
      stopInterval();
    };
  }, [stopInterval]);

  return {
    remainingSeconds,
    totalSeconds,
    isRunning,
    isActive: remainingSeconds > 0,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    addSeconds,
  };
}
