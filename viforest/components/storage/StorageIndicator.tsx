'use client';

import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DeviceConnection, DeviceCapacity } from '@/types';
import { getStorageCapacity } from '@/lib/api';
import { RefreshCw, HardDrive } from 'lucide-react';

interface StorageIndicatorProps {
  activeDevice: DeviceConnection | null;
}

export function StorageIndicator({ activeDevice }: StorageIndicatorProps) {
  const [capacity, setCapacity] = useState<DeviceCapacity | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeDevice?.isConnected) {
      setCapacity(null);
      return;
    }

    const fetchCapacity = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await getStorageCapacity(activeDevice.ip);
        if (result && result.code === 200) {
          setCapacity(result.data);
        } else {
          setError('Failed to fetch storage capacity');
        }
      } catch (err) {
        console.error('Failed to fetch storage capacity:', err);
        setError('Failed to fetch storage capacity');
      } finally {
        setLoading(false);
      }
    };

    fetchCapacity();
    
    const intervalId = setInterval(fetchCapacity, 30000);
    return () => clearInterval(intervalId);
  }, [activeDevice]);

  const usagePercent = capacity 
    ? Math.round((capacity.current / capacity.total) * 100) 
    : 0;

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="h-5 w-5" />
          Storage
        </CardTitle>
        <CardDescription>
          {activeDevice?.isConnected
            ? 'Device storage capacity and usage'
            : 'Connect to a device to view storage information'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-4 text-destructive">
            {error}
          </div>
        ) : capacity ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{capacity.currentStr} used ({usagePercent}%)</span>
                <span>{capacity.freeStr} free</span>
              </div>
              <Progress 
                value={usagePercent}
                className="h-3"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center pt-2">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Total</span>
                <span className="font-medium">{capacity.totalStr}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Used</span>
                <span className="font-medium">{capacity.currentStr}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Free</span>
                <span className="font-medium">{capacity.freeStr}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No storage information available
          </div>
        )}
      </CardContent>
    </Card>
  );
}