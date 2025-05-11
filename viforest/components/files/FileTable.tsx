import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FileItem, DeviceConnection } from '@/types';
import { downloadFile } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Download, Folder, File } from 'lucide-react';
import { formatFileSize, formatDate } from '@/lib/formatters';

interface FileTableProps {
  files: FileItem[];
  onFileClick: (file: FileItem) => void;
  activeDevice: DeviceConnection | null;
  onFileActionComplete: () => void;
}

export function FileTable({ 
  files, 
  onFileClick, 
  activeDevice,
  onFileActionComplete
}: FileTableProps) {
  const { toast } = useToast();
  const [downloadingFileId, setDownloadingFileId] = React.useState<string | null>(null);

  const handleDownload = async (file: FileItem, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!activeDevice) return;
    
    setDownloadingFileId(file.id);
    
    try {
      const success = await downloadFile(activeDevice.ip, file);
      
      if (success) {
        toast({
          title: 'Download complete',
          description: `Successfully downloaded ${file.name}`,
        });
        onFileActionComplete();
      } else {
        toast({
          title: 'Download failed',
          description: `Failed to download ${file.name}`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Download failed',
        description: `An error occurred while downloading ${file.name}`,
        variant: 'destructive',
      });
    } finally {
      setDownloadingFileId(null);
    }
  };

  // Sort files: directories first, then alphabetically
  const sortedFiles = [...files].sort((a, b) => {
    if (a.isDirectory && !b.isDirectory) return -1;
    if (!a.isDirectory && b.isDirectory) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[300px]">Name</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Modified</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedFiles.map((file) => (
          <TableRow 
            key={file.id}
            onClick={() => onFileClick(file)}
            className={file.isDirectory ? 'cursor-pointer hover:bg-muted/50' : 'hover:bg-muted/20'}
          >
            <TableCell className="font-medium flex items-center space-x-2">
              {file.isDirectory ? (
                <Folder className="h-5 w-5 text-blue-500" />
              ) : (
                <File className="h-5 w-5 text-muted-foreground" />
              )}
              <span>{file.name}</span>
            </TableCell>
            <TableCell>
              {file.isDirectory ? (
                <span className="text-muted-foreground">Folder</span>
              ) : (
                formatFileSize(file.size || 0)
              )}
            </TableCell>
            <TableCell>
              {file.modifiedDate ? formatDate(file.modifiedDate) : '-'}
            </TableCell>
            <TableCell className="text-right">
              {!file.isDirectory && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => handleDownload(file, e)}
                  disabled={downloadingFileId === file.id}
                >
                  <Download className={`h-4 w-4 ${downloadingFileId === file.id ? 'animate-pulse' : ''}`} />
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}