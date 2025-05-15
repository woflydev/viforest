'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import React from "react";

export function HelpModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={"Dialog for information"} className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Help</DialogTitle>
          <DialogDescription>
            <div className="mt-2 text-base text-foreground">
              <p>
                Get started by connecting your device through the settings menu (accessible via the <b>Dock</b>). Once connected, you can view and manage files on your device.
              </p>
              <br></br>
              <p>
                Find your device&apos;s IP by swiping down from the top right edge of the screen to access <b>Quick Settings</b>. Long-press <b>WLAN Transfer</b> to view the IP address. Add this IP address to <b><i>viforest</i></b> by accessing the <b>Settings</b> page on the dock.
              </p>
              <br></br>
              <p>
                Note that your device&apos;s IP will change based on the network you&apos;re connected to. On startup, <b><i>viforest</i></b> will automatically attempt to restore previous connections.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="w-full mt-4">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}