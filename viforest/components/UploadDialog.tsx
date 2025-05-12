// components/UploadDialog.tsx
'use client';

import React, { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, Upload } from 'lucide-react';
import { uploadFile } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { DeviceConnection } from '@/types';

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeDevice: DeviceConnection | null;
  appType: string;
  folderId: string;
  files: File[];
  onUploadComplete: () => void;
  resetFiles: () => void;
}

export function UploadDialog({
  open,
  onOpenChange,
  activeDevice,
  appType,
  folderId,
  files,
  onUploadComplete,
  resetFiles
}: UploadDialogProps) {
  const { toast } = useToast();
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!activeDevice || files.length === 0) return;

    setUploading(true);
    const newProgress: Record<string, number> = {};

    for (const file of files) {
      newProgress[file.name] = 0;

      const interval = setInterval(() => {
        setProgressMap((prev) => ({
          ...prev,
          [file.name]: Math.min((prev[file.name] || 0) + Math.random() * 10, 90),
        }));
      }, 200);

      try {
        const success = await uploadFile(activeDevice.ip, file, appType, folderId);
        clearInterval(interval);
        setProgressMap((prev) => ({ ...prev, [file.name]: 100 }));

        if (success) {
          toast({
            title: 'Upload complete',
            description: `Uploaded ${file.name}`,
          });
        } else {
          toast({
            title: 'Upload failed',
            description: `Failed to upload ${file.name}`,
            variant: 'destructive',
          });
        }
      } catch (err) {
        clearInterval(interval);
        toast({
          title: 'Upload failed',
          description: `Error uploading ${file.name}`,
          variant: 'destructive',
        });
      }
    }

    setTimeout(() => {
      setUploading(false);
      onOpenChange(false);
      onUploadComplete();
      resetFiles();
      setProgressMap({});
    }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
          <DialogDescription>Upload selected files to the current directory.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {files.map((file) => (
            <div
              key={file.name}
              className="border p-2 rounded flex justify-between items-center"
            >
              <div className="truncate">
                <div className="font-medium text-sm">{file.name}</div>
                <div className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
              <Progress value={progressMap[file.name] || 0} className="w-1/2 h-2" />
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button disabled={uploading || files.length === 0} onClick={handleUpload}>
            {uploading ? 'Uploading...' : 'Start Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
