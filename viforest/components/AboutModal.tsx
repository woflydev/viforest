'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Github, Twitter, Globe } from "lucide-react";
import React from "react";
import Link from "next/link";

export function AboutModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>About</DialogTitle>
          <DialogDescription>
            <div className="mt-4 text-base text-foreground">
              <p>
                <b><i>viforest</i></b> is an open-source, intuitive UI for managing files on the Viwoods AIPaper.
              </p>
              <p className="mt-4">
                Found a bug or want to request a feature? Please let me know on <a target="_blank" href="https://github.com/woflydev/viforest" className="font-semibold text-indigo-500 hover:text-indigo-700 transition-colors">GitHub</a>.
              </p>
              <p className="mt-4">
              <span><span className="text-xs">p.s. I'm not affiliated with Viwoods!</span></span>
              </p>
              
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-4 mt-4 justify-center">
          <Button asChild variant="outline" size="icon" aria-label="GitHub">
            <a href="https://github.com/woflydev/viforest" target="_blank" rel="noopener noreferrer">
              <Github className="h-5 w-5" />
            </a>
          </Button>
          <Button asChild variant="outline" size="icon" aria-label="Twitter">
            <a href="https://large-type.com/#I%20avoid%20drama%20by%20not%20using%20twitter" target="_blank" rel="noopener noreferrer">
              <Twitter className="h-5 w-5" />
            </a>
          </Button>
          <Button asChild variant="outline" size="icon" aria-label="Website">
            <a href="https://woflydev.com" target="_blank" rel="noopener noreferrer">
              <Globe className="h-5 w-5" />
            </a>
          </Button>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="w-full mt-4">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}