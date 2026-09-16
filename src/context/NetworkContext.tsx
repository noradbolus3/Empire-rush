import NetInfo from '@react-native-community/netinfo';
import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

type NetworkState = { isOnline: boolean; clockTampered: boolean; serverOffsetMs: number };
const NetworkContext = createContext<NetworkState>({ isOnline: true, clockTampered: false, serverOffsetMs: 0 });

export function NetworkProvider({ children }: PropsWithChildren) {
  const [isOnline, setOnline] = useState(true);
  const [clockTampered, setClockTampered] = useState(false);
  const [serverOffsetMs, setServerOffsetMs] = useState(0);
  useEffect(() => { const unsubscribe = NetInfo.addEventListener(state => setOnline(Boolean(state.isConnected && state.isInternetReachable !== false))); return unsubscribe; }, []);
  useEffect(() => { if (!isOnline) return; const serverNow = Date.now(); const localNow = Date.now(); const offset = serverNow - localNow; setServerOffsetMs(offset); setClockTampered(Math.abs(offset) > 60 * 60 * 1000); }, [isOnline]);
  return <NetworkContext.Provider value={useMemo(() => ({ isOnline, clockTampered, serverOffsetMs }), [isOnline, clockTampered, serverOffsetMs])}>{children}</NetworkContext.Provider>;
}
export const useNetwork = () => useContext(NetworkContext);
