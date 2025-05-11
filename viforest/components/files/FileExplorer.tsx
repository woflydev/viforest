'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileTable } from './FileTable';
import { UploadButton } from './UploadButton';
import { DeviceConnection } from '@/types';
import { useFileExplorer } from '@/hooks/useFileExplorer';
import { Folder, ArrowUp, RefreshCw, Home, Loader2 } from 'lucide-react';

interface FileExplorerProps {
  activeDevice: DeviceConnection | null;
}

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

  return (
    <Card className="shadow-md flex flex-col h-full">
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
                >
                  <Home className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Home</TooltipContent>
            </Tooltip>
            
            <UploadButton
              activeDevice={activeDevice}
              appType={currentFolder.appType}
              currentFolderId={currentFolder.id as string}
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
            {breadcrumbs.map((breadcrumb, index) => (
              <React.Fragment key={breadcrumb.id || "keyx"}>
                {index > 0 && <BreadcrumbSeparator />}
                {index === breadcrumbs.length - 1 ? (
                  <BreadcrumbPage>{breadcrumb.name}</BreadcrumbPage>
                ) : (
                  <BreadcrumbItem>
                    <BreadcrumbLink 
                      onClick={() => navigateToBreadcrumb(breadcrumb)}
                      className="cursor-pointer"
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
      
      <CardContent className="flex-1 p-3 overflow-hidden">
        {!activeDevice?.isConnected ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Folder className="h-12 w-12 mb-2 opacity-50" />
            <p>Connect to a device to browse files</p>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Loader2 className="h-8 w-8 mb-2 animate-spin" />
            <p>Loading files...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-destructive">
            <p>{error}</p>
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
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <p>No files found in this folder</p>
          </div>
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
      </CardContent>
    </Card>
  );
}