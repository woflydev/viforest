'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DeviceConnection } from '@/types';
import { RefreshCw, Trash2, WifiOff, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeviceCardProps {
  connection: DeviceConnection;
  isActive: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onRemove: () => void;
  isConnecting: boolean;
}

export function DeviceCard({
  connection,
  isActive,
  onConnect,
  onDisconnect,
  onRemove,
  isConnecting,
}: DeviceCardProps) {
  const { ip, name, isConnected } = connection;

  return (
    <Card className={cn(
      "flex items-center justify-between px-3 py-2 mb-2 border rounded transition-all",
      isActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
    )}>
      <div className="flex items-center gap-2 min-w-0">
        {isConnected
          ? <Wifi className="h-4 w-4 text-green-500" />
          : <WifiOff className="h-4 w-4 text-muted-foreground" />}
        <span className="truncate font-medium text-sm">{name}</span>
        <span className="text-xs text-muted-foreground ml-2 truncate">{ip}</span>
      </div>
      <div className="flex items-center gap-1">
        {isConnected ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onDisconnect}
            disabled={isConnecting}
          >
            Disconnect
          </Button>
        ) : (
          <Button
            variant="default"
            size="sm"
            onClick={onConnect}
            disabled={isConnecting}
          >
            {isConnecting ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Connect'}
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}