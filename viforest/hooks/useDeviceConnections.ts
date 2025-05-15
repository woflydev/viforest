import { useState, useEffect, useRef } from 'react';
import { DeviceConnection } from '@/types';
import { testConnection } from '@/lib/api';

const STORAGE_KEY = 'device-connections';
const LAST_CONNECTED_KEY = 'last-connected-device-ip';

export function useDeviceConnections() {
  const [connections, setConnections] = useState<DeviceConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDevice, setActiveDevice] = useState<DeviceConnection | null>(null);

  // Only try auto-connect once per session
  const autoConnectTried = useRef(false);

  useEffect(() => {
    const loadAndConnect = async () => {
      try {
        const savedConnections = localStorage.getItem(STORAGE_KEY);
        let parsed: DeviceConnection[] = [];
        if (savedConnections) {
          parsed = JSON.parse(savedConnections) as DeviceConnection[];
          setConnections(parsed.map(c => ({ ...c, isConnected: false })));
        }

        // Try to auto-connect to last connected device (once per session)
        if (!autoConnectTried.current && parsed.length > 0) {
          autoConnectTried.current = true;
          const lastConnectedIp = localStorage.getItem(LAST_CONNECTED_KEY);

          let targetConnection: DeviceConnection | undefined;
          if (lastConnectedIp) {
            targetConnection = parsed.find(c => c.ip === lastConnectedIp);
          }
          if (!targetConnection) {
            targetConnection = parsed[0];
          }

          if (targetConnection) {
            const isConnected = await testConnection(targetConnection.ip);
            if (isConnected) {
              setConnections(prev =>
                prev.map(c => ({
                  ...c,
                  isConnected: c.ip === targetConnection!.ip,
                  lastConnected: c.ip === targetConnection!.ip ? new Date() : c.lastConnected,
                }))
              );
              setActiveDevice({
                ...targetConnection,
                isConnected: true,
                lastConnected: new Date(),
              });
              localStorage.setItem(LAST_CONNECTED_KEY, targetConnection.ip);
              setLoading(false);
              return;
            }
          }
        }
      } catch (error) {
        console.error('Failed to load connections:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAndConnect();
  }, []);

  // Save connections to localStorage
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(connections));
    }
  }, [connections, loading]);

  // Add a new connection
  const addConnection = async (ip: string, name: string) => {
    if (connections.some(c => c.ip === ip)) {
      return false;
    }

    const isConnected = await testConnection(ip);
    const newConnection: DeviceConnection = {
      ip,
      name,
      isConnected,
      lastConnected: isConnected ? new Date() : undefined,
    };

    setConnections(prev => [...prev, newConnection]);

    if (isConnected) {
      setActiveDevice(newConnection);
      localStorage.setItem(LAST_CONNECTED_KEY, ip);
    }

    return true;
  };

  // Remove a connection
  const removeConnection = (ip: string) => {
    setConnections(prev => prev.filter(c => c.ip !== ip));
    if (activeDevice?.ip === ip) {
      setActiveDevice(null);
      localStorage.removeItem(LAST_CONNECTED_KEY);
    }
  };

  const connectToDevice = async (ip: string) => {
    const isConnected = await testConnection(ip);

    setConnections(prev =>
      prev.map(c => ({
        ...c,
        isConnected: c.ip === ip ? isConnected : false,
        lastConnected: c.ip === ip && isConnected ? new Date() : c.lastConnected,
      }))
    );

    if (isConnected) {
      const device = connections.find(c => c.ip === ip);
      if (device) {
        setActiveDevice({ ...device, isConnected: true, lastConnected: new Date() });
        localStorage.setItem(LAST_CONNECTED_KEY, ip);
      }
      return true;
    } else {
      if (activeDevice?.ip === ip) {
        setActiveDevice(null);
        localStorage.removeItem(LAST_CONNECTED_KEY);
      }
      return false;
    }
  };

  const disconnectDevice = () => {
    setConnections(prev =>
      prev.map(c => ({
        ...c,
        isConnected: false,
      }))
    );
    setActiveDevice(null);
    localStorage.removeItem(LAST_CONNECTED_KEY);
  };

  return {
    connections,
    activeDevice,
    loading,
    addConnection,
    removeConnection,
    connectToDevice,
    disconnectDevice,
  };
}