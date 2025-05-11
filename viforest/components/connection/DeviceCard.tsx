'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  const { ip, name, isConnected, lastConnected } = connection;
  
  return (
    <Card className={cn(
      "transition-all duration-200",
      isActive ? "border-primary border-2" : "border-border hover:border-primary/50",
    )}>
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="font-medium">{name}</span>
            </div>
            <span className="text-xs text-muted-foreground mt-1">{ip}</span>
            {lastConnected && (
              <span className="text-xs text-muted-foreground mt-1">
                Last connected: {new Date(lastConnected).toLocaleString()}
              </span>
            )}
          </div>
          
          <div className="flex space-x-2">
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
                {isConnecting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  'Connect'
                )}
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
        </div>
      </CardContent>
    </Card>
  );
}