'use client';

import React from "react";
import { FileExplorer } from '@/components/files/FileExplorer';
import { useDeviceConnections } from '@/hooks/useDeviceConnections';
import { DotPattern } from "@/components/magicui/dot-pattern";
import { cn } from "@/lib/utils";

export default function Home() {
  const { activeDevice } = useDeviceConnections();

  return (
    <div className="relative min-h-screen min-w-screen flex flex-col items-center justify-center bg-background overflow-hidden">
      {/* Dot Pattern Background */}
      <DotPattern
        className={cn(
          "pointer-events-none absolute inset-0 z-0 dot-fade-in",
          "[mask-image:radial-gradient(800px_circle_at_center,white,transparent)]"
        )}
      />
      <main className="relative z-10 flex-1 flex flex-col items-center">
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