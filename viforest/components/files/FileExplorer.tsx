'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import {
  Folder, ArrowUp, RefreshCw, Home, Loader2, Bookmark, X,
  Pin
} from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { FileTable } from './FileTable';
import { UploadButton } from './UploadButton';
import { UploadDialog } from '@/components/UploadDialog';
import { useFileExplorer } from '@/hooks/useFileExplorer';
import { DeviceConnection } from '@/types';
import { defaultSavedPaths } from '@/config/savedPaths.config';

interface FileExplorerProps {
  activeDevice: DeviceConnection | null;
}

export type SavedPath = {
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

  const [hoveredPathIndex, setHoveredPathIndex] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [targetFolderId, setTargetFolderId] = useState<string>('');
  const [targetAppType, setTargetAppType] = useState<string | undefined>();

  const [userSavedPaths, setUserSavedPaths] = useState<SavedPath[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('savedPaths');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setUserSavedPaths(parsed);
      }
    } catch (error) {
      console.error('Error loading saved paths:', error);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem('savedPaths', JSON.stringify(userSavedPaths));
    } catch (error) {
      console.error('Error saving paths to localStorage:', error);
    }
  }, [userSavedPaths, hydrated]);

  // Merge config and user paths, avoiding duplicates by folderId
  const mergedSavedPaths = [
    ...defaultSavedPaths,
    ...userSavedPaths.filter(
      userPath => !defaultSavedPaths.some(defaultPath => defaultPath.folderId === userPath.folderId)
    ),
  ];

  const handleSavePath = () => {
    const newPath = {
      name: currentFolder.name,
      path: breadcrumbs.map(b => b.name).join('/'),
      folderId: currentFolder.id,
      appType: currentFolder.appType,
    };
    setUserSavedPaths(prev => [...prev, newPath]);
  };

  const deleteSavedPath = (index: number) => {
    setUserSavedPaths(prev => prev.filter((_, i) => i !== index));
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
    <div className="flex flex-col h-full min-h-0 bg-background">
      <Card className="flex flex-col h-full min-h-0 border-none shadow-none">
        <CardHeader className="pb-2 border-b">
          <CardTitle className="flex items-center justify-between text-base font-semibold">
            <span className="flex items-center gap-2">
              <Folder className="h-4 w-4" />
              Files
            </span>
            <span className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={refreshCurrentFolder}
                    disabled={!activeDevice?.isConnected || loading}
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refresh</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={navigateUp}
                    disabled={!activeDevice?.isConnected || breadcrumbs.length <= 1 || loading}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Go Up</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateToBreadcrumb(breadcrumbs[0])}
                    disabled={!activeDevice?.isConnected || currentFolder.id === '' || loading}
                  >
                    <Home className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Home</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSavePath}
                    disabled={!activeDevice?.isConnected || loading}
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
            </span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            {activeDevice?.isConnected
              ? `Browsing files on ${activeDevice.name}`
              : 'Connect to a device to browse files'}
          </CardDescription>
        </CardHeader>

        {/* Saved Paths Bar */}
        {hydrated && mergedSavedPaths.length > 0 && (
        <div className="px-4 py-2 border-b bg-muted">
          <div className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent">
            {mergedSavedPaths.map((path, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <div
                    className={`flex-shrink-0 rounded transition-all ${
                      hoveredPathIndex === index
                        ? 'ring-2 ring-primary bg-primary/10'
                        : 'bg-background'
                    }`}
                    onDragOver={e => { e.preventDefault(); setHoveredPathIndex(index); }}
                    onDragEnter={e => { e.preventDefault(); setHoveredPathIndex(index); }}
                    onDragLeave={() => setHoveredPathIndex(null)}
                    onDrop={e => {
                      e.preventDefault();
                      setHoveredPathIndex(null);
                      handleDropOnPath(e, path);
                    }}
                  >
                    <Button
                      variant="secondary"
                      size="sm"
                      className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-all relative w-32 justify-start ${
                        hoveredPathIndex === index ? 'border-primary border-2 bg-primary/10' : ''
                      }`}
                      onClick={() => {
                        // Instead of navigateToFolder, use navigateToBreadcrumb or a custom handler
                        // that can handle folderId/appType directly
                        navigateToFolder({ id: path.folderId, isDirectory: true, name: path.name, appType: path.appType });
                      }}
                    >
                      <Pin className="h-3 w-3 text-primary mr-1" />
                      <Folder className="h-4 w-4 mr-1" />
                      <span className="truncate">{path.name}</span>
                      {index >= defaultSavedPaths.length && (
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer opacity-60 hover:opacity-100"
                          onClick={e => {
                            e.stopPropagation();
                            deleteSavedPath(index - defaultSavedPaths.length);
                          }}
                        />
                      )}
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  📌 Pinned folder.<br />
                  Click to open.<br />
                  Drag files here to upload.
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      )}

        {/* Breadcrumbs */}
        <div className="px-4 py-2 bg-background border-b">
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((breadcrumb, index) => (
                <React.Fragment key={breadcrumb.id || 'root'}>
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
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* File List */}
        <CardContent className="flex-1 min-h-0 p-0 overflow-y-auto bg-background">
          {!activeDevice?.isConnected ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
              <Folder className="h-10 w-10 mb-2 opacity-50" />
              <p className="text-xs">Connect to a device to browse files</p>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
              <Loader2 className="h-7 w-7 mb-2 animate-spin" />
              <p className="text-xs">Loading files...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-destructive py-8">
              <p className="text-xs">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshCurrentFolder}
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          ) : files.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
              <p className="text-xs">No files found in this folder</p>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <FileTable
                files={files}
                onFileClick={navigateToFolder}
                activeDevice={activeDevice}
                onFileActionComplete={refreshCurrentFolder}
              />
            </ScrollArea>
          )}
        </CardContent>
      </Card>

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