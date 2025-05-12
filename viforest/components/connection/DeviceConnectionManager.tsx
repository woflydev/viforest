'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useDeviceConnections } from '@/hooks/useDeviceConnections';
import { Plus, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { DeviceCard } from './DeviceCard';

export function DeviceConnectionManager({ minimalist }: { minimalist?: boolean }) {
  const { toast } = useToast();
  const {
    connections,
    activeDevice,
    loading,
    addConnection,
    removeConnection,
    connectToDevice,
    disconnectDevice,
  } = useDeviceConnections();

  const [newIp, setNewIp] = useState('');
  const [newName, setNewName] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleAddConnection = async () => {
    if (!newIp) {
      toast({
        title: 'IP address required',
        description: 'Please enter a valid IP address',
        variant: 'destructive',
      });
      return;
    }
    setIsConnecting(true);
    const deviceName = newName || `Device (${newIp})`;
    const success = await addConnection(newIp, deviceName);
    setIsConnecting(false);

    if (success) {
      toast({
        title: 'Device added',
        description: `${deviceName} was successfully added`,
      });
      setNewIp('');
      setNewName('');
      setIsAddDialogOpen(false);
    } else {
      toast({
        title: 'Failed to add device',
        description: 'Device with this IP already exists or is not reachable',
        variant: 'destructive',
      });
    }
  };

  const handleConnectDevice = async (ip: string) => {
    setIsConnecting(true);
    const success = await connectToDevice(ip);
    setIsConnecting(false);

    if (success) {
      toast({
        title: 'Connected',
        description: `Successfully connected to device at ${ip}`,
      });
    } else {
      toast({
        title: 'Connection failed',
        description: `Could not connect to device at ${ip}`,
        variant: 'destructive',
      });
    }
  };

  const handleDisconnectDevice = () => {
    disconnectDevice();
    toast({
      title: 'Disconnected',
      description: 'Successfully disconnected from device',
    });
  };

  const handleRemoveConnection = (ip: string, name: string) => {
    removeConnection(ip);
    toast({
      title: 'Device removed',
      description: `${name} was removed from your devices`,
    });
  };

  return (
    <div className={minimalist ? "space-y-2" : "space-y-4"}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-base font-semibold">
          {activeDevice?.isConnected ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-muted-foreground" />
          )}
          Devices
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xs w-full">
            <DialogHeader>
              <DialogTitle>Add Device</DialogTitle>
              <DialogDescription>
                Enter the IP address and (optionally) a name.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-2">
              <Input
                id="ip-address"
                placeholder="192.168.1.1"
                value={newIp}
                onChange={(e) => setNewIp(e.target.value)}
                className="text-sm"
              />
              <Input
                id="device-name"
                placeholder="Name (optional)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="text-sm"
              />
            </div>
            <DialogFooter>
              <Button onClick={handleAddConnection} disabled={isConnecting} className="w-full">
                {isConnecting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Add Device'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="text-xs text-muted-foreground mb-2">
        {activeDevice?.isConnected
          ? `Connected to ${activeDevice.name} (${activeDevice.ip})`
          : 'Not connected'}
      </div>
      <div className="space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : connections.length > 0 ? (
          connections.map((connection) => (
            <DeviceCard
              key={connection.ip}
              connection={connection}
              isActive={activeDevice?.ip === connection.ip}
              onConnect={() => handleConnectDevice(connection.ip)}
              onDisconnect={handleDisconnectDevice}
              onRemove={() => handleRemoveConnection(connection.ip, connection.name)}
              isConnecting={isConnecting}
            />
          ))
        ) : (
          <div className="text-center py-4 text-muted-foreground text-xs">
            No devices added yet.
          </div>
        )}
      </div>
    </div>
  );
}