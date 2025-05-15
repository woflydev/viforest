'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
  const [baseNames, setBaseNames] = useState<string[]>([]);

  const splitName = (filename: string) => {
    const lastDot = filename.lastIndexOf('.');
    if (lastDot === -1) return { base: filename, ext: '' };
    return {
      base: filename.slice(0, lastDot),
      ext: filename.slice(lastDot),
    };
  };

  useEffect(() => {
    setProgress(0);
    setBaseNames(files.map((file) => splitName(file.name).base));
  }, [files]);

  const handleBaseNameChange = (index: number, newBase: string) => {
    setBaseNames((prev) => {
      const updated = [...prev];
      updated[index] = newBase;
      return updated;
    });
  };

  const handleUpload = async () => {
    if (!activeDevice || files.length === 0) return;

    setIsUploading(true);
    let completed = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const { ext } = splitName(file.name);
      const newName = baseNames[i] + ext;

      const uploadFileObj =
        newName && newName !== file.name
          ? new File([file], newName, { type: file.type })
          : file;

      const success = await uploadFile(activeDevice.ip, uploadFileObj, appType as string, folderId);

      completed++;
      setProgress(Math.round((completed / files.length) * 100));

      if (!success) {
        toast({
          title: 'Upload failed',
          description: `Failed to upload ${newName}`,
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
      <DialogContent aria-describedby="Dialog for information">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
          <DialogDescription>
            Upload {files.length} file{files.length > 1 ? 's' : ''} to the selected folder
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4 max-h-64 overflow-y-auto">
          {files.map((file, i) => {
            const { base, ext } = splitName(file.name);
            return (
              <div
                key={i}
                className="flex items-center justify-between p-2 border rounded"
              >
                <div className="flex items-center gap-2 w-full">
                  {/* shadcn Input for base name */}
                  <input
                    type="text"
                    value={baseNames[i] || ''}
                    onChange={(e) => handleBaseNameChange(i, e.target.value)}
                    disabled={isUploading}
                    className="w-full text-sm font-medium border rounded px-2 py-1 flex-1 focus:outline-none focus:ring-0"
                    aria-label={`Base filename for ${file.name}`}
                  />
                  <span className="text-sm select-none">{ext}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              </div>
            );
          })}
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