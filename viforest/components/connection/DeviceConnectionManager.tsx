'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { useDeviceConnections } from '@/hooks/useDeviceConnections';
import { Plus, Trash2, RefreshCw, Check, X, Settings, Wifi, WifiOff } from 'lucide-react';
import { DeviceCard } from './DeviceCard';

export function DeviceConnectionManager() {
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
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {activeDevice?.isConnected ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-muted-foreground" />
            )}
            Devices
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" /> Add IP
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Device</DialogTitle>
                <DialogDescription>
                  Enter the IP address of your device to connect.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="ip-address" className="text-sm font-medium">
                    IP Address
                  </label>
                  <Input
                    id="ip-address"
                    placeholder="192.168.1.1"
                    value={newIp}
                    onChange={(e) => setNewIp(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="device-name" className="text-sm font-medium">
                    Network Name (Optional)
                  </label>
                  <Input
                    id="device-name"
                    placeholder="Used to identify device's IP on different networks."
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddConnection} disabled={isConnecting}>
                  {isConnecting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    'Confirm'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardTitle>
        <CardDescription>
          {activeDevice?.isConnected 
            ? `Connected to ${activeDevice.name} (${activeDevice.ip})`
            : 'Not connected to any device'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
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
          <div className="text-center py-4 text-muted-foreground">
            No devices added yet. Add a device to get started.
          </div>
        )}
      </CardContent>
    </Card>
  );
}