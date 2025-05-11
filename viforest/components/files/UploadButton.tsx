'use client';

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DeviceConnection } from '@/types';
import { uploadFile } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Upload, X } from 'lucide-react';

interface UploadButtonProps {
  activeDevice: DeviceConnection | null;
  currentFolderId: string;
  onUploadComplete: () => void;
}

export function UploadButton({ 
  activeDevice, 
  appType,
  currentFolderId,
  onUploadComplete 
}: UploadButtonProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!activeDevice || !selectedFile) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        const newProgress = Math.min(prev + Math.random() * 10, 90);
        return newProgress;
      });
    }, 200);
    
    try {
      const success = await uploadFile(activeDevice.ip, selectedFile, appType, currentFolderId);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Small delay to show 100% before closing
      setTimeout(() => {
        if (success) {
          toast({
            title: 'Upload complete',
            description: `Successfully uploaded ${selectedFile.name}`,
          });
          setIsDialogOpen(false);
          setSelectedFile(null);
          onUploadComplete();
        } else {
          toast({
            title: 'Upload failed',
            description: `Failed to upload ${selectedFile.name}`,
            variant: 'destructive',
          });
        }
        setIsUploading(false);
      }, 500);
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: `An error occurred while uploading ${selectedFile.name}`,
        variant: 'destructive',
      });
      setIsUploading(false);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                disabled={!activeDevice?.isConnected}
              >
                <Upload className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload File</DialogTitle>
                <DialogDescription>
                  Upload a file to the current folder
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                {selectedFile ? (
                  <div className="flex items-center justify-between p-2 border rounded">
                    <div className="truncate">
                      <span className="text-sm font-medium">{selectedFile.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={clearSelectedFile}
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button onClick={handleBrowseClick} variant="outline" className="w-full h-24">
                    <div className="flex flex-col items-center">
                      <Upload className="h-6 w-6 mb-2" />
                      <span>Click to select a file</span>
                    </div>
                  </Button>
                )}
                
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress.toFixed(0)}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Upload'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TooltipTrigger>
        <TooltipContent>Upload File</TooltipContent>
      </Tooltip>
    </>
  );
}