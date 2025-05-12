'use client';

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Upload } from 'lucide-react';
import { DeviceConnection } from '@/types';
import { UploadDialog } from '@/components/UploadDialog';

interface UploadButtonProps {
  activeDevice: DeviceConnection | null;
  appType: string;
  currentFolderId: string;
  onUploadComplete: () => void;
}

export function UploadButton({
  activeDevice,
  appType,
  currentFolderId,
  onUploadComplete
}: UploadButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
      setIsDialogOpen(true);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const resetFiles = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
            onClick={handleBrowseClick}
          >
            <Upload className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Upload Files</TooltipContent>
      </Tooltip>

      <input
        type="file"
        ref={fileInputRef}
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      <UploadDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        activeDevice={activeDevice}
        appType={appType}
        folderId={currentFolderId}
        files={selectedFiles}
        resetFiles={resetFiles}
        onUploadComplete={onUploadComplete}
      />
    </>
  );
}
