'use client';

import { useState, useEffect } from 'react';
import { DeviceConnection } from '@/types';
import { testConnection } from '@/lib/api';

// Local storage key for saved connections
const STORAGE_KEY = 'device-connections';

export function useDeviceConnections() {
  const [connections, setConnections] = useState<DeviceConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDevice, setActiveDevice] = useState<DeviceConnection | null>(null);
  
  // Load saved connections from localStorage
  useEffect(() => {
    const loadConnections = () => {
      try {
        const savedConnections = localStorage.getItem(STORAGE_KEY);
        if (savedConnections) {
          const parsed = JSON.parse(savedConnections) as DeviceConnection[];
          setConnections(parsed);

          // Find the last connected device, if any
          const lastActive = parsed.find(c => c.isConnected);
          if (lastActive) {
            testConnection(lastActive.ip).then(isConnected => {
              if (isConnected) {
                setActiveDevice({...lastActive, isConnected: true});
              }
            });
          }
        }
      } catch (error) {
        console.error('Failed to load connections:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadConnections();
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
      return false; // Connection already exists
    }
    
    const isConnected = await testConnection(ip);
    const newConnection: DeviceConnection = {
      ip,
      name,
      isConnected,
      lastConnected: isConnected ? new Date() : undefined,
    };
    
    setConnections(prev => [...prev, newConnection]);
    
    if (isConnected && !activeDevice) {
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
    
    if (!isConnected) {
      return false;
    }
    
    // Update connections list
    setConnections(prev => 
      prev.map(c => ({
        ...c,
        isConnected: c.ip === ip,
        lastConnected: c.ip === ip ? new Date() : c.lastConnected,
      }))
    );
    
    // Set active device
    const device = connections.find(c => c.ip === ip);
    if (device) {
      setActiveDevice({ ...device, isConnected: true, lastConnected: new Date() });
    }
    
    return true;
  };

  // Disconnect from active device
  const disconnectDevice = () => {
    if (activeDevice) {
      setConnections(prev => 
        prev.map(c => ({
          ...c,
          isConnected: false,
        }))
      );
      setActiveDevice(null);
    }
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