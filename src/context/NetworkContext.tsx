import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useRef, useState } from 'react';

type NetworkState = { isOnline: boolean; clockTampered: boolean; serverOffsetMs: number };
const NetworkContext = createContext<NetworkState>({ isOnline: true, clockTampered: false, serverOffsetMs: 0 });
const LAST_WALL_CLOCK_KEY = 'empire-rush-last-wall-clock-v1';
const CLOCK_ROLLBACK_TOLERANCE_MS = 60 * 60 * 1000;

export function NetworkProvider({ children }: PropsWithChildren) {
  const [isOnline, setOnline] = useState(true);
  const [clockTampered, setClockTampered] = useState(false);
  const [serverOffsetMs, setServerOffsetMs] = useState(0);
  const lastObservedRef = useRef(0);

  useEffect(() => {
    let active = true;
    const observe = async () => {
      const now = Date.now();
      const storedRaw = await AsyncStorage.getItem(LAST_WALL_CLOCK_KEY).catch(() => null);
      const stored = storedRaw ? Number(storedRaw) : 0;
      const previous = Math.max(stored, lastObservedRef.current);
      const rolledBack = previous > 0 && now + CLOCK_ROLLBACK_TOLERANCE_MS < previous;
      if (active) {
        lastObservedRef.current = Math.max(previous, now);
        setClockTampered(rolledBack);
        setServerOffsetMs(rolledBack ? now - previous : 0);
      }
      await AsyncStorage.setItem(LAST_WALL_CLOCK_KEY, String(Math.max(previous, now))).catch(() => undefined);
    };
    void observe();
    const timer = setInterval(() => { void observe(); }, 60_000);
    return () => { active = false; clearInterval(timer); };
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => setOnline(Boolean(state.isConnected && state.isInternetReachable !== false)));
    return unsubscribe;
  }, []);

  return <NetworkContext.Provider value={useMemo(() => ({ isOnline, clockTampered, serverOffsetMs }), [isOnline, clockTampered, serverOffsetMs])}>{children}</NetworkContext.Provider>;
}

export const useNetwork = () => useContext(NetworkContext);
