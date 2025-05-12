'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {Button} from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import {
  Folder, ArrowUp, RefreshCw, Home, Loader2, Bookmark
} from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { motion, AnimatePresence } from 'framer-motion';
import { FileTable } from './FileTable';
import { UploadButton } from './UploadButton';
import { UploadDialog } from '@/components/UploadDialog';
import { useFileExplorer } from '@/hooks/useFileExplorer';
import { DeviceConnection } from '@/types';

interface FileExplorerProps {
  activeDevice: DeviceConnection | null;
}

type SavedPath = {
  name: string;
  path: string;
  folderId: string;
  appType?: string;
};

export function FileExplorer({ activeDevice }: FileExplorerProps) {
  const {
    files,
    loading,
    error,
    currentFolder,
    breadcrumbs,
    navigateToFolder,
    navigateToBreadcrumb,
    refreshCurrentFolder,
    navigateUp,
  } = useFileExplorer(activeDevice);

  const [savedPaths, setSavedPaths] = useState<SavedPath[]>([]);
  const [hoveredPathIndex, setHoveredPathIndex] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [targetFolderId, setTargetFolderId] = useState<string>('');
  const [targetAppType, setTargetAppType] = useState<string | undefined>();

  // Load saved paths from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('savedPaths');
    if (stored) setSavedPaths(JSON.parse(stored));
  }, []);

  // Save to localStorage on update
  useEffect(() => {
    localStorage.setItem('savedPaths', JSON.stringify(savedPaths));
  }, [savedPaths]);

const handleSavePath = () => {
  const newPath = {
    name: currentFolder.name,
    path: breadcrumbs.map(b => b.name).join('/'),
    folderId: currentFolder.id,
    appType: currentFolder.appType,
  };
  setSavedPaths(prev => [...prev, newPath]);
};

const handleDropOnPath = (e: React.DragEvent, path: SavedPath) => {
  e.preventDefault();
  const files = Array.from(e.dataTransfer.files);
  setFilesToUpload(files);
  setTargetFolderId(path.folderId);
  setTargetAppType(path.appType);
  setIsDialogOpen(true);
};

  return (
    <div className="space-y-4">
      <Card className="shadow-md flex flex-col h-[calc(100vh-280px)]">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              Files
            </div>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={refreshCurrentFolder}
                    disabled={!activeDevice?.isConnected || loading}
                    className="transition-all hover:scale-105"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refresh</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={navigateUp}
                    disabled={!activeDevice?.isConnected || breadcrumbs.length <= 1 || loading}
                    className="transition-all hover:scale-105"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Go Up</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigateToBreadcrumb(breadcrumbs[0])}
                    disabled={!activeDevice?.isConnected || currentFolder.id === '' || loading}
                    className="transition-all hover:scale-105"
                  >
                    <Home className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Home</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleSavePath}
                    disabled={!activeDevice?.isConnected || loading}
                    className="transition-all hover:scale-105"
                  >
                    <Bookmark className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Save Path</TooltipContent>
              </Tooltip>

              <UploadButton
                activeDevice={activeDevice}
                currentFolderId={currentFolder.id}
                appType={currentFolder.appType}
                onUploadComplete={refreshCurrentFolder}
              />
            </div>
          </CardTitle>
          <CardDescription>
            {activeDevice?.isConnected
              ? `Browsing files on ${activeDevice.name}`
              : 'Connect to a device to browse files'}
          </CardDescription>
        </CardHeader>

        <div className="px-6 py-1">
          <Breadcrumb>
            <BreadcrumbList>
              <AnimatePresence mode="popLayout">
                {breadcrumbs.map((breadcrumb, index) => (
                  <motion.div
                    key={breadcrumb.id || 'root'}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {index > 0 && <BreadcrumbSeparator />}
                    {index === breadcrumbs.length - 1 ? (
                      <BreadcrumbPage>{breadcrumb.name}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbItem>
                        <BreadcrumbLink
                          onClick={() => navigateToBreadcrumb(breadcrumb)}
                          className="cursor-pointer hover:text-primary transition-colors"
                        >
                          {breadcrumb.name}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <CardContent className="flex-1 p-3 overflow-hidden">
          <AnimatePresence mode="wait">
            {!activeDevice?.isConnected ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center h-full text-muted-foreground"
              >
                <Folder className="h-12 w-12 mb-2 opacity-50" />
                <p>Connect to a device to browse files</p>
              </motion.div>
            ) : loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full text-muted-foreground"
              >
                <Loader2 className="h-8 w-8 mb-2 animate-spin" />
                <p>Loading files...</p>
              </motion.div>
            ) : error ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full text-destructive"
              >
                <p>{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshCurrentFolder}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </motion.div>
            ) : files.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full text-muted-foreground"
              >
                <p>No files found in this folder</p>
              </motion.div>
            ) : (
              <ScrollArea className="h-full pr-4">
                <FileTable
                  files={files}
                  onFileClick={navigateToFolder}
                  activeDevice={activeDevice}
                  onFileActionComplete={refreshCurrentFolder}
                />
              </ScrollArea>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {savedPaths.length > 0 && (
        <Card className="transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-sm">Saved Paths</CardTitle>
            <CardDescription>Drag and drop files onto a path below to upload</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {savedPaths.map((path, index) => (
                <div
                  key={index}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDropOnPath(e, path)}
                  // onDragOver={(e) => {
                  //   e.preventDefault();
                  //   setHoveredPathIndex(index);
                  // }}
                  onDragLeave={() => setHoveredPathIndex(null)}
                  // onDrop={(e) => {
                  //   setHoveredPathIndex(null);
                  //   handleDropOnPath(e, path.folderId);
                  // }}
                >
                  <Button
                    variant="outline"
                    className={`h-auto py-4 flex flex-col items-center gap-2 w-full transition ${
                      hoveredPathIndex === index ? 'border-primary border-2 bg-primary/10' : ''
                    }`}
                  >
                    <Folder className="h-6 w-6" />
                    <span className="text-sm font-normal">{path.name}</span>
                    <span className="text-xs text-muted-foreground truncate w-full text-center">
                      {path.path}
                    </span>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <UploadDialog
        files={filesToUpload}
        folderId={targetFolderId}
        activeDevice={activeDevice}
        appType={targetAppType || currentFolder.appType}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onUploadComplete={() => {
          refreshCurrentFolder();
          setFilesToUpload([]);
        }}
      />
    </div>
  );
}
