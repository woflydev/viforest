import { useState, useEffect } from 'react';
import { DeviceConnection } from '@/types';
import { testConnection } from '@/lib/api';

// Local storage key for saved connections
const STORAGE_KEY = 'device-connections';

export function useDeviceConnections() {
  const [connections, setConnections] = useState<DeviceConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDevice, setActiveDevice] = useState<DeviceConnection | null>(null);
  
  // Load saved connections from localStorage and attempt to connect
  useEffect(() => {
    const loadAndConnect = async () => {
      try {
        const savedConnections = localStorage.getItem(STORAGE_KEY);
        if (savedConnections) {
          const parsed = JSON.parse(savedConnections) as DeviceConnection[];
          setConnections(parsed.map(c => ({ ...c, isConnected: false })));
          
          // Try to connect to each device
          for (const connection of parsed) {
            const isConnected = await testConnection(connection.ip);
            if (isConnected) {
              setConnections(prev => 
                prev.map(c => ({
                  ...c,
                  isConnected: c.ip === connection.ip ? true : c.isConnected,
                  lastConnected: c.ip === connection.ip ? new Date() : c.lastConnected,
                }))
              );
              setActiveDevice({ 
                ...connection, 
                isConnected: true, 
                lastConnected: new Date() 
              });
              break; // Connect to first available device
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
    }
    
    return true;
  };

  // Remove a connection
  const removeConnection = (ip: string) => {
    setConnections(prev => prev.filter(c => c.ip !== ip));
    
    if (activeDevice?.ip === ip) {
      setActiveDevice(null);
    }
  };

  // Connect to a device
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
      }
      return true;
    } else {
      if (activeDevice?.ip === ip) {
        setActiveDevice(null);
      }
      return false;
    }
  };

  // Disconnect from active device
  const disconnectDevice = () => {
    setConnections(prev => 
      prev.map(c => ({
        ...c,
        isConnected: false,
      }))
    );
    setActiveDevice(null);
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