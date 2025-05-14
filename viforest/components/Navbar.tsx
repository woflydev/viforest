'use client';

import React, { useState, useEffect } from "react";
import { Dock, DockIcon } from '@/components/magicui/dock';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { buttonVariants } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { CircleHelp, Info, RefreshCcw, Settings2Icon } from 'lucide-react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DeviceConnectionManager } from '@/components/connection/DeviceConnectionManager';
import { StorageIndicator } from '@/components/storage/StorageIndicator';
import { useDeviceConnections } from '@/hooks/useDeviceConnections';
import { Skeleton } from "./ui/skeleton";
import { AboutModal } from "./AboutModal";
import { HelpModal } from "./HelpModal";
import { DialogTitle } from "@radix-ui/react-dialog";

export function Navbar() {
  const [showModal, setShowModal] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const { activeDevice } = useDeviceConnections();

  return (
    <TooltipProvider>
      <Dock 
        className=""
        iconMagnification={60} 
        direction="middle"
      >
        <DockIcon>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                aria-label="Home"
                className={buttonVariants({ variant: "ghost", size: "icon" }) + " size-12 rounded-full"}
                onClick={() => window.location.href = "/"}
                type="button"
              >
                <RefreshCcw className="size-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Files</p>
            </TooltipContent>
          </Tooltip>
        </DockIcon>
        <DockIcon>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                aria-label="Settings"
                className={buttonVariants({ variant: "ghost", size: "icon" }) + " size-12 rounded-full"}
                onClick={() => setShowModal(true)}
                type="button"
              >
                <Settings2Icon className="size-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>
        </DockIcon>
        <DockIcon>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                aria-label="About"
                className={buttonVariants({ variant: "ghost", size: "icon" }) + " size-12 rounded-full"}
                onClick={() => setShowAbout(true)}
                type="button"
              >
                <Info className="size-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>About</p>
            </TooltipContent>
          </Tooltip>
        </DockIcon>
        <DockIcon>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                aria-label="About"
                className={buttonVariants({ variant: "ghost", size: "icon" }) + " size-12 rounded-full"}
                onClick={() => setShowHelp(true)}
                type="button"
              >
                <CircleHelp className="size-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Help</p>
            </TooltipContent>
          </Tooltip>
        </DockIcon>
        <DockIcon>
          <Tooltip>
            <TooltipTrigger asChild>
              <ModeToggle />
            </TooltipTrigger>
            <TooltipContent>
              <p>Theme</p>
            </TooltipContent>
          </Tooltip>
        </DockIcon>
      </Dock>

      {/* unified settings - devices then storage */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent aria-describedby="Dialog for settings and device management" className="max-w-lg w-full p-0 overflow-hidden [&>button:last-child]:hidden">
         <DialogTitle></DialogTitle>
          <div className="p-4 space-y-6">
            <div>
              <React.Suspense fallback={<Skeleton className="h-24 w-full rounded" />}>
                <DeviceConnectionManager minimalist  />
              </React.Suspense>
            </div>
            <div>
              <React.Suspense fallback={<Skeleton className="h-24 w-full rounded" />}>
                <StorageIndicator activeDevice={activeDevice} minimalist />
              </React.Suspense>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AboutModal open={showAbout} onOpenChange={setShowAbout} />
      <HelpModal open={showHelp} onOpenChange={setShowHelp} />
    </TooltipProvider>
  );
}