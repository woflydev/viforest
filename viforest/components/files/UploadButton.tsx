'use client';

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { UploadDialog } from '@/components/UploadDialog';
import { DeviceConnection } from '@/types';
import { Upload } from 'lucide-react';

interface UploadButtonProps {
  activeDevice: DeviceConnection | null;
  currentFolderId: string;
  appType?: string;
  onUploadComplete: () => void;
}

export function UploadButton({
  activeDevice,
  currentFolderId,
  appType,
  onUploadComplete,
}: UploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
      setDialogOpen(true);
    }
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            disabled={!activeDevice?.isConnected}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Upload File</TooltipContent>
      </Tooltip>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
      />

      <UploadDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        files={selectedFiles}
        folderId={currentFolderId}
        activeDevice={activeDevice}
        appType={appType}
        onUploadComplete={() => {
          setSelectedFiles([]);
          onUploadComplete();
        }}
      />
    </>
  );
}
