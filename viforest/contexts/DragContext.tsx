'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';

interface DragContextState {
  isDraggingFilesOverSite: boolean;
  resetDragState: () => void;
}

const DragContext = createContext<DragContextState | undefined>(undefined);

export const useGlobalDragState = () => {
  const context = useContext(DragContext);
  if (context === undefined) {
    throw new Error('useGlobalDragState must be used within a DragProvider');
  }
  return context;
};

interface DragProviderProps {
  children: ReactNode;
}

export const DragProvider: React.FC<DragProviderProps> = ({ children }) => {
  const [isDraggingFilesOverSite, setIsDraggingFilesOverSite] = useState(false);
  const activeFileDragEntryRef = useRef(0);

    const resetDragState = () => {
    activeFileDragEntryRef.current = 0;
    setIsDraggingFilesOverSite(false);
  };

  useEffect(() => {
    const handleWindowDragOver = (e: DragEvent) => {
      const isFileDrag = e.dataTransfer?.types.includes('Files');
      if (isFileDrag) {
        e.preventDefault();
      }
    };

    const handleWindowDragEnter = (e: DragEvent) => {
      const isFileDrag = e.dataTransfer?.types.includes('Files');
      if (isFileDrag) {
        activeFileDragEntryRef.current++;
        if (activeFileDragEntryRef.current === 1) {
          setIsDraggingFilesOverSite(true);
        }
      }
    };

    const handleWindowDragLeave = (e: DragEvent) => {
      if (e.relatedTarget === null) {
        if (activeFileDragEntryRef.current > 0) {
          activeFileDragEntryRef.current = 0;
          setIsDraggingFilesOverSite(false);
        }
      }
    };

    const handleWindowDropOrDragEnd = () => {
      activeFileDragEntryRef.current = 0;
      setIsDraggingFilesOverSite(false);
    };

    window.addEventListener('dragover', handleWindowDragOver);
    window.addEventListener('dragenter', handleWindowDragEnter);
    window.addEventListener('dragleave', handleWindowDragLeave);
    window.addEventListener('drop', handleWindowDropOrDragEnd);
    window.addEventListener('dragend', handleWindowDropOrDragEnd);

    return () => {
      window.removeEventListener('dragover', handleWindowDragOver);
      window.removeEventListener('dragenter', handleWindowDragEnter);
      window.removeEventListener('dragleave', handleWindowDragLeave);
      window.removeEventListener('drop', handleWindowDropOrDragEnd);
      window.removeEventListener('dragend', handleWindowDropOrDragEnd);
    };
  }, []);

  return (
    <DragContext.Provider value={{ isDraggingFilesOverSite, resetDragState }}>
      {children}
    </DragContext.Provider>
  );
};