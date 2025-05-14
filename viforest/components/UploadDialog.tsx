'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X } from 'lucide-react';
import { uploadFile } from '@/lib/api';
import { DeviceConnection } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  files: File[];
  folderId: string;
  activeDevice: DeviceConnection | null;
  appType?: string;
  onUploadComplete: () => void;
}

export function UploadDialog({
  open,
  onOpenChange,
  files,
  folderId,
  activeDevice,
  appType,
  onUploadComplete,
}: UploadDialogProps) {
  const { toast } = useToast();
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setProgress(0);
  }, [files]);

  const handleUpload = async () => {
    if (!activeDevice || files.length === 0) return;

    setIsUploading(true);
    let completed = 0;

    for (const file of files) {
      const success = await uploadFile(activeDevice.ip, file, appType as string, folderId);

      completed++;
      setProgress(Math.round((completed / files.length) * 100));

      if (!success) {
        toast({
          title: 'Upload failed',
          description: `Failed to upload ${file.name}`,
          variant: 'destructive',
        });
      }
    }

    toast({
      title: 'Upload complete',
      description: `Uploaded ${completed} file${completed > 1 ? 's' : ''}`,
    });

    setTimeout(() => {
      setIsUploading(false);
      onOpenChange(false);
      onUploadComplete();
    }, 400);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={"Dialog for information"}>
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
          <DialogDescription>
            Upload {files.length} file{files.length > 1 ? 's' : ''} to the selected folder
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4 max-h-64 overflow-y-auto">
          {files.map((file, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2 border rounded"
            >
              <div className="truncate">
                <span className="text-sm font-medium">{file.name}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            </div>
          ))}
        </div>

        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        <DialogFooter>
          <Button onClick={handleUpload} disabled={isUploading || files.length === 0}>
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
