'use client';

import clipboard from "tauri-plugin-clipboard-api";
import { generatePdfFromHtml } from '@/lib/pdfUtils';
import { motion } from "framer-motion";
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
  Folder, RefreshCw, Bookmark, X, Pin
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
import { DeviceConnection, FileItem } from '@/types';
import { defaultSavedPaths } from '@/config/savedPaths.config';
import { useGlobalDragState } from '@/contexts/DragContext';
import { useToast } from "@/hooks/use-toast";

function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-muted-foreground/10 rounded animate-pulse ${className || ''}`} />;
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
  }: {
    files: FileItem[];
    loading: boolean;
    error: string | null;
    currentFolder: any;
    breadcrumbs: any[];
    navigateToFolder: (folder: FileItem) => void;
    navigateToBreadcrumb: (breadcrumb: any) => void;
    refreshCurrentFolder: () => void;
    navigateUp: () => void;
  } = useFileExplorer(activeDevice);

  const { toast } = useToast();

  const [hoveredPathIndex, setHoveredPathIndex] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [targetFolderId, setTargetFolderId] = useState<string>('');
  const [targetAppType, setTargetAppType] = useState<string | undefined>();

  const savedPathFileInputRef = useRef<HTMLInputElement>(null);
  const [userSavedPaths, setUserSavedPaths] = useState<SavedPath[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const [siteHovered, setSiteHovered] = useState(false);
  const explorerRef = useRef<HTMLDivElement>(null);
  const { isDraggingFilesOverSite, resetDragState } = useGlobalDragState();

  useEffect(() => {
    const currentExplorerRef = explorerRef.current;
    if (!currentExplorerRef) return;

    const handleExplorerDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleExplorerDrop = (e: DragEvent) => {
      e.preventDefault();
    };

    currentExplorerRef.addEventListener('dragover', handleExplorerDragOver);
    currentExplorerRef.addEventListener('drop', handleExplorerDrop);

    return () => {
      currentExplorerRef.removeEventListener('dragover', handleExplorerDragOver);
      currentExplorerRef.removeEventListener('drop', handleExplorerDrop);
    };
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('savedPaths');
      if (stored) setUserSavedPaths(JSON.parse(stored));
    } catch (err) { console.error('Error loading saved paths:', err); }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      try {
        localStorage.setItem('savedPaths', JSON.stringify(userSavedPaths));
      } catch (err) { console.error('Error saving paths:', err); }
    }
  }, [userSavedPaths, hydrated]);

  const mergedSavedPaths = [
    ...defaultSavedPaths,
    ...userSavedPaths.filter(up => !defaultSavedPaths.some(dp => dp.folderId === up.folderId)),
  ];

  const handleSavedPathFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setFilesToUpload(Array.from(e.target.files));
      setIsDialogOpen(true);
    }
    if (e.target) e.target.value = '';
  };

  const handleSavePath = () => {
    if (!currentFolder?.id) return;
    const newPath: SavedPath = {
      name: currentFolder.name || "Unnamed Folder",
      path: breadcrumbs.map(b => b.name).join('/') || '/',
      folderId: currentFolder.id,
      appType: currentFolder.appType,
    };
    if (!userSavedPaths.some(p => p.folderId === newPath.folderId)) {
      setUserSavedPaths(prev => [...prev, newPath]);
    }
  };

  const deleteSavedPath = (userPathIndex: number) => {
    setUserSavedPaths(prev => prev.filter((_, i) => i !== userPathIndex));
  };

  const handleDropOnPath = (e: React.DragEvent, path: SavedPath) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      setFilesToUpload(droppedFiles);
      setTargetFolderId(path.folderId);
      setTargetAppType(path.appType);
      setIsDialogOpen(true);
    }
    setHoveredPathIndex(null);
  };

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'v') {
        if (!activeDevice?.ip || !currentFolder?.id) {
          console.log('Paste ignored: No active device or current folder/folder ID.');
          return;
        }

        console.log('Paste shortcut detected. Attempting to read HTML content from clipboard.');
        try {
          const clipboardHtml = await clipboard.readHtml();

          if (clipboardHtml && clipboardHtml.trim() !== "") {
            console.log('[paste] clipboard HTML: ', clipboardHtml.substring(0, 500));
            const pdfFileName = `viforest_${Date.now()}.pdf`;
            const generatedPdfFile = await generatePdfFromHtml(clipboardHtml, pdfFileName);

            if (generatedPdfFile) {
              console.log(`[paste] PDF: ${generatedPdfFile.name}. folderID: ${currentFolder.id}, appType: ${currentFolder.appType}`);
              setFilesToUpload([generatedPdfFile]);
              setTargetFolderId(currentFolder.id);
              setTargetAppType(currentFolder.appType);
              setIsDialogOpen(true);
            } else {
              console.error('[paste] PDF generation failed.');
            }
          } else {
            console.log('[paste] No HTML found in clipboard.');
          }
        } catch (error) {
          console.error('[paste] Failed to read: ', error);
          toast({
            title: "Error",
            description: "Failed to read from clipboard or process pasted content.",
            variant: "destructive",
          })
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeDevice, currentFolder, refreshCurrentFolder, setFilesToUpload, setTargetFolderId, setTargetAppType, setIsDialogOpen]);

  const explorerWidth = "w-full max-w-lg";
  const shouldAnimateForDrag = isDraggingFilesOverSite;
  const explorerCardBgColor = siteHovered ? "rgba(0,0,0,0.02)" : "transparent";

  return (
    <div
      className={`items-center justify-center w-full ${explorerWidth} mx-20`}
      onMouseEnter={() => setSiteHovered(true)}
      onMouseLeave={() => {
        setSiteHovered(false);
        setHoveredPathIndex(null);
      }}
    >
      <Card ref={explorerRef} className={`${explorerWidth} h-[80vh] max-h-[600px] flex flex-col shadow-xl border rounded-xl bg-background overflow-hidden`}>
        <CardHeader className="pb-2 border-b shrink-0">
          <CardTitle className="flex items-center justify-between text-base font-semibold">
            <span className="flex items-center gap-2"><Folder className="h-4 w-4" />Files</span>
            <span className="flex items-center gap-1">
              <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={refreshCurrentFolder} disabled={!activeDevice?.isConnected || loading}><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></Button></TooltipTrigger><TooltipContent>Refresh</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={handleSavePath} disabled={!activeDevice?.isConnected || loading || !currentFolder?.id}><Bookmark className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Save Path</TooltipContent></Tooltip>
              <UploadButton activeDevice={activeDevice} currentFolderId={currentFolder.id as string} appType={currentFolder.appType} onUploadComplete={refreshCurrentFolder} />
            </span>
          </CardTitle>
          <CardDescription className="text-muted-foreground text-xs">
            <div className="mb-2">
            {activeDevice?.isConnected ? `Browsing: ${activeDevice.name || activeDevice.ip}` : 'Connect to your Viwoods AIPaper to browse its files.'}
              </div>
          </CardDescription>
        </CardHeader>

        <div className="px-4 border-b shrink-0"> {/* Saved Paths Bar Area */}
           <motion.div
            layout
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            animate={{
              paddingTop: shouldAnimateForDrag ? 20 : 8,
              paddingBottom: shouldAnimateForDrag ? 20 : 8,
              minHeight: shouldAnimateForDrag ? 100 : 48,
              backgroundColor: shouldAnimateForDrag ? "rgba(0,120,255,0.05)" : explorerCardBgColor,
            }}
            className="overflow-hidden"
          >
            {!hydrated ? (
              <div className="flex gap-2 py-2"><Skeleton className="h-8 w-32 rounded" /><Skeleton className="h-8 w-32 rounded" /><Skeleton className="h-8 w-32 rounded" /></div>
            ) : mergedSavedPaths.length > 0 ? (
              <div 
                className={`py-1 overflow-hidden ${
                  isDraggingFilesOverSite 
                    ? 'flex flex-col items-center gap-2' 
                    : 'flex flex-row flex-wrap justify-center gap-3 py-2' 
                }`}
              >
                {mergedSavedPaths.map((path, index) => {
                  const isUserPath = !defaultSavedPaths.some(dp => dp.folderId === path.folderId);
                  const userPathIndex = userSavedPaths.findIndex(p => p.folderId === path.folderId);
                  
                  const cardShouldExpand = isDraggingFilesOverSite;
                  const isCurrentlyHovered = hoveredPathIndex === index;

                  const nonExpandedWidth = isCurrentlyHovered ? 160 : 128;
                  
                  const currentBorderColor = (isCurrentlyHovered) 
                    ? "hsl(var(--primary))" 
                    : "hsl(var(--border))";
                    
                  const buttonVariant = "secondary";

                  const variants = {
                    collapsed: {
                      width: nonExpandedWidth,
                      minHeight: 36,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
                      borderRadius: 8,
                      borderWidth: 1.5,
                      borderColor: isCurrentlyHovered ? "hsl(var(--primary))" : "hsl(var(--border))",
                      transition: { type: "spring", stiffness: 300, damping: 26 }
                    },
                    expanded: {
                      width: "90%",
                      minHeight: 72,
                      boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: isCurrentlyHovered ? "hsl(var(--primary))" : "hsl(var(--border))",
                      transition: { 
                        type: "spring", 
                        stiffness: 300, 
                        damping: 26,
                        width: { type: "spring", stiffness: 100, damping: 20 }
                      }
                    }
                  };

                  return (
                    <motion.div
                      key={path.folderId || `default-${index}`}
                      variants={variants}
                      animate={cardShouldExpand ? "expanded" : "collapsed"}
                      layout="position"
                      transition={{ type: "spring", stiffness: 300, damping: 26 }}
                      className={`relative bg-background rounded-lg cursor-pointer flex-shrink-0 overflow-hidden`}
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); if(isDraggingFilesOverSite) setHoveredPathIndex(index); }}
                      onDragEnter={(e) => { e.preventDefault(); if(isDraggingFilesOverSite) setHoveredPathIndex(index); }}
                      onDragLeave={(e) => { setHoveredPathIndex(null); }}
                      onDrop={(e) => handleDropOnPath(e, path)}
                      initial={cardShouldExpand ? "expanded" : "collapsed"}
                    >
                      <Tooltip>
                          <Button
                            variant={buttonVariant}
                            size="sm"
                            className={`group flex items-center gap-1.5 px-2.5 text-xs rounded-md w-full h-full justify-start overflow-hidden ${cardShouldExpand ? 'py-3 text-sm' : 'py-1.5'}`}
                            onClick={() => { setTargetFolderId(path.folderId); setTargetAppType(path.appType); savedPathFileInputRef.current?.click(); }}
                          >
                            <Pin className={`h-3 w-3 text-primary ${cardShouldExpand ? 'h-3.5 w-3.5' : ''}`} />
                            <Folder className={`h-3.5 w-3.5 ${cardShouldExpand ? 'h-4 w-4' : ''}`} />
                            <span className="truncate flex-1 text-left">{path.name}</span>
                          </Button>
                      </Tooltip>
                      {isUserPath && userPathIndex !== -1 && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.5 }} 
                          animate={{ 
                            opacity: cardShouldExpand ? 1 : (siteHovered && isCurrentlyHovered ? 0.9 : 0.5),
                            scale: 1 
                          }} 
                          transition={{ delay: cardShouldExpand ? 0.1 : 0 }} 
                          className="absolute top-1 right-1 z-10"
                        >
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-5 w-5 rounded-full hover:bg-destructive/20" 
                            onClick={e => { e.stopPropagation(); deleteSavedPath(userPathIndex); }} 
                            aria-label="Remove saved path"
                          >
                            <X className="h-3 w-3 opacity-70 group-hover:opacity-100" />
                          </Button>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
                <input type="file" ref={savedPathFileInputRef} onChange={handleSavedPathFileChange} className="hidden" multiple />
              </div>
            ) : ( <div className="text-xs text-muted-foreground py-3 text-center">No saved paths. Pin a folder to add it here.</div> )}
          </motion.div>
        </div>

        <div className="px-4 py-2 bg-background border-b shrink-0">
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((breadcrumb, idx) => (
                <React.Fragment key={breadcrumb.id || `breadcrumb-${idx}`}>
                  {idx > 0 && <BreadcrumbSeparator />}
                  {idx === breadcrumbs.length - 1 ? <BreadcrumbPage className="truncate max-w-[200px]">{breadcrumb.name}</BreadcrumbPage> : <BreadcrumbItem><BreadcrumbLink onClick={() => navigateToBreadcrumb(breadcrumb)} className="cursor-pointer hover:text-primary truncate max-w-[150px]">{breadcrumb.name}</BreadcrumbLink></BreadcrumbItem>}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <CardContent className="flex-1 min-h-0 p-0 overflow-y-auto bg-background">
          {!activeDevice?.isConnected ? <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8"><Folder className="h-10 w-10 mb-2 opacity-50" /><p className="text-xs">Not Connected</p></div>
            : loading ? <div className="flex flex-col gap-1 p-2">{[...Array(10)].map((_, i) => <Skeleton key={i} className="h-9 w-full rounded" />)}</div>
            : error ? <div className="flex flex-col items-center justify-center h-full text-destructive py-8 px-4 text-center"><p className="text-sm font-medium">Error: {error}</p><Button variant="outline" size="sm" onClick={refreshCurrentFolder} className="mt-3">Try Again</Button></div>
            : files.length === 0 ? <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8"><Folder className="h-8 w-8 mb-2 opacity-50" /><p className="text-xs">Folder is empty</p></div>
            : <ScrollArea className="h-full"><FileTable files={files} onFileClick={navigateToFolder} activeDevice={activeDevice} onFileActionComplete={refreshCurrentFolder} /></ScrollArea>}
        </CardContent>
      </Card>

      <UploadDialog
        files={filesToUpload}
        folderId={targetFolderId}
        activeDevice={activeDevice}
        appType={targetAppType || currentFolder.appType}
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setHoveredPathIndex(null);
            resetDragState();
          }
        }}
        onUploadComplete={() => {
          refreshCurrentFolder();
          setFilesToUpload([]);
          resetDragState();
        }}
      />
    </div>
  );
}