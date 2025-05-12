'use client';

import React, { useEffect, useRef, useState } from 'react';
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
  Folder, ArrowUp, RefreshCw, Home, Loader2, Bookmark, X, Pin
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

// Skeleton component for loading states
function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`bg-muted-foreground/10 rounded animate-pulse ${className || ''}`} />
  );
}

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

  const savedPathFileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSavedPathFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFilesToUpload(Array.from(e.target.files));
      setIsDialogOpen(true);
    }
  };

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

  // Fixed width for explorer and table
  const explorerWidth = "w-[800px] max-w-lg";

  return (
    <div className={`items-center justify-center w-full ${explorerWidth}`}>
      <Card className={`${explorerWidth} h-[80vh] max-h-[600px] flex flex-col shadow-xl border rounded-xl bg-background`}>
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
        <div className="px-4 py-2 border-b min-h-[48px]">
          {!hydrated ? (
            <div className="flex gap-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-7 w-[140px]" />
              ))}
            </div>
          ) : mergedSavedPaths.length > 0 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent transition-opacity duration-300 opacity-100">
              {mergedSavedPaths.map((path, index) => {
                const isUserPath = index >= defaultSavedPaths.length;
                const userPathIndex = userSavedPaths.findIndex(p => p.folderId === path.folderId);

                return (
                  <Tooltip key={index}>
                    <TooltipTrigger asChild>
                      <div
                        className={`relative flex-shrink-0 transition-all ${
                          hoveredPathIndex === index
                            ? 'ring-2 ring-primary bg-primary/10'
                            : 'bg-background'
                        }`}
                        style={{ minWidth: 128, maxWidth: 160 }}
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
                          className={`group flex items-center gap-1 px-2 py-1 text-xs rounded w-full justify-start pr-7 transition-all ${
                            hoveredPathIndex === index ? 'border-primary border-2 bg-primary/10' : ''
                          }`}
                          style={{ width: "100%" }}
                          onClick={() => {
                            setTargetFolderId(path.folderId);
                            setTargetAppType(path.appType);
                            // Trigger file picker for this saved path
                            savedPathFileInputRef.current?.click();
                          }}
                        >
                          <Pin className="h-3 w-3 text-primary mr-1" />
                          <Folder className="h-4 w-4 mr-1" />
                          <span className="truncate flex-1 text-left">{path.name}</span>
                        </Button>
                        {isUserPath && userPathIndex !== -1 && (
                          <span
                            className="absolute top-1 right-1 z-10 flex items-center justify-center"
                            style={{ width: 18, height: 18 }}
                          >
                            <X
                              className="h-3 w-3 cursor-pointer opacity-60 hover:opacity-100 transition-opacity bg-background rounded-full p-0.5 shadow"
                              onClick={e => {
                                e.stopPropagation();
                                deleteSavedPath(userPathIndex);
                              }}
                              aria-label="Remove saved path"
                              tabIndex={0}
                            />
                          </span>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      📌 Pinned folder.<br />
                      Click to upload files here.<br />
                      Drag files here to upload.
                    </TooltipContent>
                  </Tooltip>
                );
              })}
              {/* Hidden file input for saved path uploads */}
              <input
                type="file"
                ref={savedPathFileInputRef}
                onChange={handleSavedPathFileChange}
                className="hidden"
                multiple
              />
            </div>
          )}
        </div>

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
            <div className="flex flex-col gap-2 px-4 py-8">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
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