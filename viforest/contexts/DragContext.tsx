'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';

interface DragContextState {
  isDraggingFilesOverSite: boolean;
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
  // Ref to count active file drag operations that have entered the window.
  // This helps ensure setIsDraggingFilesOverSite(true) is called reliably
  // on the first entry and not toggled off prematurely by internal dragleave events.
  const activeFileDragEntryRef = useRef(0);

  useEffect(() => {
    const handleWindowDragOver = (e: DragEvent) => {
      // Prevent default to allow dropping and to ensure dataTransfer is populated.
      // Check if files are being dragged.
      const isFileDrag = e.dataTransfer?.types.includes('Files');
      if (isFileDrag) {
        e.preventDefault();
        // You could set e.dataTransfer.dropEffect here if needed, e.g., 'copy'
      }
    };

    const handleWindowDragEnter = (e: DragEvent) => {
      const isFileDrag = e.dataTransfer?.types.includes('Files');
      if (isFileDrag) {
        activeFileDragEntryRef.current++;
        // If this is the first entry event for an active file drag, update the state.
        if (activeFileDragEntryRef.current === 1) {
          setIsDraggingFilesOverSite(true);
        }
      }
    };

    const handleWindowDragLeave = (e: DragEvent) => {
      // This event fires when the mouse leaves an element.
      // We are interested if it's leaving the *entire window viewport*.
      // e.relatedTarget will be null if leaving the window.
      if (e.relatedTarget === null) {
        // If we thought a file drag was active and it's now leaving the window.
        if (activeFileDragEntryRef.current > 0) {
          activeFileDragEntryRef.current = 0; // Reset counter
          setIsDraggingFilesOverSite(false);
        }
      }
      // If e.relatedTarget is not null, the drag is moving to another element within the window.
      // In this case, we don't change isDraggingFilesOverSite; it remains true until
      // 'dragend' or 'drop', or until the drag truly leaves the window.
    };

    const handleWindowDropOrDragEnd = () => {
      // These events signify the definitive end of a drag operation.
      activeFileDragEntryRef.current = 0; // Reset counter
      setIsDraggingFilesOverSite(false);
    };

    // Attach event listeners to the window
    window.addEventListener('dragover', handleWindowDragOver);
    window.addEventListener('dragenter', handleWindowDragEnter);
    window.addEventListener('dragleave', handleWindowDragLeave);
    window.addEventListener('drop', handleWindowDropOrDragEnd);
    window.addEventListener('dragend', handleWindowDropOrDragEnd);

    return () => {
      // Cleanup: remove event listeners when the component unmounts
      window.removeEventListener('dragover', handleWindowDragOver);
      window.removeEventListener('dragenter', handleWindowDragEnter);
      window.removeEventListener('dragleave', handleWindowDragLeave);
      window.removeEventListener('drop', handleWindowDropOrDragEnd);
      window.removeEventListener('dragend', handleWindowDropOrDragEnd);
    };
  }, []); // Empty dependency array: effect runs once on mount, cleans up on unmount.

  return (
    <DragContext.Provider value={{ isDraggingFilesOverSite }}>
      {children}
    </DragContext.Provider>
  );
};