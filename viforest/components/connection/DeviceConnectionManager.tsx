'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useDeviceConnections } from '@/hooks/useDeviceConnections';
import { HelpCircle, Plus, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { DeviceCard } from './DeviceCard';
import { Skeleton } from '../ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

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
  const [showTooltip, setShowTooltip] = useState(false);

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
        <div className="flex items-center gap-2 text-base font-semibold text-lg">
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
  <div className="flex items-center gap-2.5">
    <DialogTitle>Add an IP</DialogTitle>
    <Tooltip open={showTooltip} onOpenChange={setShowTooltip}>
      <TooltipTrigger asChild>
        <div className='flex items-center'>
        <span
          className="underline underline-offset-2 text-xs text-muted-foreground cursor-pointer hover:text-primary transition-colors"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            setShowTooltip((v) => !v);
          }}          
          onMouseEnter={() => {}}
          onFocus={() => {}}
        >
          how?
        </span>
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-sm text-left">
        <div className="font-semibold mb-1">On each network, your device's IP will be different. With viforest, you have the ability to give each network a name so that you'll remember which IP corresponds to which network. viforest automatically attempts to connect to </div>
        <ol className="list-decimal list-inside space-y-1">
          <li>On your device, open <b>Quick Access</b> &rarr; <b>WLAN Transfer</b>.</li>
          <li>Look for an address like <code>http://192.168.1.123:8090</code>.</li>
          <li>Enter only the IP part (e.g. <b>192.168.1.123</b>) in the field below.</li>
          <li>Do <b>not</b> include the port (<b>:8090</b>).</li>
          <li>Optionally, give your device a name for easy reference.</li>
        </ol>
        <div className="mt-2 text-muted-foreground">
          Still stuck? Check your Wi-Fi connection or consult the documentation.
        </div>
      </TooltipContent>
    </Tooltip>
  </div>
</DialogHeader>
            <div className="space-y-3 py-1">
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
      <div className="space-y-2 min-h-[96px]"> {/* Reserve space for at least 2 device cards */}
        {loading ? (
          <>
            <Skeleton className="h-12 w-full rounded" />
            <Skeleton className="h-12 w-full rounded" />
          </>
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