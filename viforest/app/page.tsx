'use client';

import { useEffect, useState } from 'react';
import { DeviceConnectionManager } from '@/components/connection/DeviceConnectionManager';
import { FileExplorer } from '@/components/files/FileExplorer';
import { StorageIndicator } from '@/components/storage/StorageIndicator';
import { useDeviceConnections } from '@/hooks/useDeviceConnections';

export default function Home() {
  const { activeDevice } = useDeviceConnections();
  
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-3 flex items-center">
          <h1 className="text-xl font-semibold">viforest</h1>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-6">
            <DeviceConnectionManager />
            <StorageIndicator activeDevice={activeDevice} />
          </div>
          
          <div className="md:col-span-2 h-[calc(100vh-180px)]">
            <FileExplorer activeDevice={activeDevice} />
          </div>
        </div>
      </main>
    </div>
  );
}