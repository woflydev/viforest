'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useDeviceConnections } from '@/hooks/useDeviceConnections';
import { Plus, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { DeviceCard } from './DeviceCard';
import { Skeleton } from '../ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { useFileExplorer } from '@/hooks/useFileExplorer';

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
  
  const { refreshCurrentFolder } = useFileExplorer(activeDevice);

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
        title: 'IP added',
        description: `${deviceName} was successfully added`,
      });
      setNewIp('');
      setNewName('');
      refreshCurrentFolder();
      setIsAddDialogOpen(false);
      window.location.href = '/';
    } else {
      toast({
        title: 'Failed to add device',
        description: 'IP already exists or is not reachable.',
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
        description: `Device connected at ${ip}.`,
      });
      refreshCurrentFolder();
      window.location.href = '/';
    } else {
      toast({
        title: 'Connection failed',
        description: `Couldn't reach device at ${ip}.`,
        variant: 'destructive',
      });
    }
  };

  const handleDisconnectDevice = () => {
    disconnectDevice();
    toast({
      title: 'Disconnected',
      description: 'Device disconnected.',
    });
    refreshCurrentFolder();
  };

  const handleRemoveConnection = (ip: string, name: string) => {
    removeConnection(ip);
    toast({
      title: 'IP removed',
      description: `${name} removed successfully.`,
    });
  };

  return (
    <div className={minimalist ? "space-y-2" : "space-y-4"}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 font-semibold text-lg">
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
          <DialogContent className="max-w-xs w-full" aria-describedby={"Dialog for information"}>
            <DialogTitle></DialogTitle>
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
                    <div className="mb-1">Open <b>Help</b> in the <b>Dock</b>.</div>
                  </TooltipContent>
                </Tooltip>
              </div>
            </DialogHeader>
            <div className="space-y-3 py-1">
              <Input
                id="ip-address"
                placeholder="192.168.0.117"
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
                  'Add IP'
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
          <div className="text-center py-4 text-muted-foreground">
            <p className="text-xs">No devices added yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}