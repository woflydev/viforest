'use client';

import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { DeviceConnection, DeviceCapacity } from '@/types';
import { getStorageCapacity } from '@/lib/api';
import { RefreshCw, HardDrive } from 'lucide-react';

interface StorageIndicatorProps {
  activeDevice: DeviceConnection | null;
  minimalist?: boolean;
}

export function StorageIndicator({ activeDevice, minimalist }: StorageIndicatorProps) {
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
        // @ts-ignore
        if (result && result.code === 200) {
          // @ts-ignore
          setCapacity(result.data as unknown as DeviceCapacity);
        } else {
          setError('Failed to fetch storage capacity');
        }
      } catch (err) {
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
    <div className={minimalist ? "space-y-2" : "space-y-4"}>
      <div className="flex items-center gap-2 mb-1">
        <HardDrive className="h-4 w-4" />
        <span className="font-medium text-lg">Storage</span>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-2">
          <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="text-center py-2 text-destructive text-sm">
          {error}
        </div>
      ) : capacity ? (
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>{capacity.currentStr} used ({usagePercent}%)</span>
            <span>{capacity.freeStr} free</span>
          </div>
          <Progress value={usagePercent} className="h-2" />
          <div className="grid grid-cols-3 gap-2 text-center pt-1">
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
        <div className="text-center py-2 text-muted-foreground text-sm">
          No storage information available.
        </div>
      )}
    </div>
  );
}