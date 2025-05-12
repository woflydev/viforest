'use client';

import React from "react";
import { FileExplorer } from '@/components/files/FileExplorer';
import { useDeviceConnections } from '@/hooks/useDeviceConnections';

export default function Home() {
  const { activeDevice } = useDeviceConnections();

  return (
    <div className="min-h-screen min-w-screen items-center">
      <main className="flex-1 flex flex-col items-center">
        <div className="flex flex-col items-center py-8 bg-background">
          <span className="mt-10 pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-center text-6xl md:text-7xl lg:text-8xl font-extrabold leading-none text-transparent dark:from-white dark:to-slate-900/10 drop-shadow">
            viforest
          </span>
          <span className="mt-2 text-muted-foreground text-sm tracking-wide">
            An open-source, intuitive UI for managing files on the Viwoods AIPaper.
          </span>
        </div>
        <FileExplorer activeDevice={activeDevice} />
      </main>
    </div>
  );
}