'use client';

import { useState, useEffect } from 'react';
import { FileItem, BreadcrumbItem, DeviceConnection } from '@/types';
import { getFileList } from '@/lib/api';

export function useFileExplorer(activeDevice: DeviceConnection | null) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFolder, setCurrentFolder] = useState<BreadcrumbItem>({
    id: '',
    name: 'Home',
    path: '/',
    appType: 'root'
  });
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { id: '', name: 'Home', path: '/', appType: 'root' }
  ]);

  useEffect(() => {
    if (!activeDevice) {
      setFiles([]);
      return;
    }

    fetchFiles(currentFolder.id, currentFolder.appType);
  }, [activeDevice, currentFolder]);

  const fetchFiles = async (folderId: string | undefined, appType: string) => {
    if (!activeDevice) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const items = await getFileList(activeDevice.ip, folderId, appType);
      setFiles(items);
    } catch (err) {
      console.error('Failed to fetch files:', err);
      setError('Failed to fetch files from device');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const navigateToFolder = (folder: FileItem) => {
    if (!folder.isDirectory) return;
    
    // For APP_ folders, use the noteId as the ID for navigation
    const folderId = folder.noteId;
    
    const newBreadcrumb: BreadcrumbItem = {
      id: folderId,
      name: folder.name,
      path: `${currentFolder.path}${folder.name}/`,
      appType: folder.appType
    };
    
    setCurrentFolder(newBreadcrumb);
    setBreadcrumbs(prev => [...prev, newBreadcrumb]);
  };

  const navigateToBreadcrumb = (breadcrumb: BreadcrumbItem) => {
    setCurrentFolder(breadcrumb);
    
    const index = breadcrumbs.findIndex(b => b.id === breadcrumb.id);
    if (index >= 0) {
      setBreadcrumbs(breadcrumbs.slice(0, index + 1));
    }
  };

  const refreshCurrentFolder = () => {
    fetchFiles(currentFolder.id, currentFolder.appType);
  };

  const navigateUp = () => {
    if (breadcrumbs.length > 1) {
      const parentBreadcrumb = breadcrumbs[breadcrumbs.length - 2];
      navigateToBreadcrumb(parentBreadcrumb);
    }
  };

  return {
    files,
    loading,
    error,
    currentFolder,
    breadcrumbs,
    navigateToFolder,
    navigateToBreadcrumb,
    refreshCurrentFolder,
    navigateUp,
  };
}