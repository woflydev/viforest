import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FileItem, DeviceConnection } from '@/types';
import { downloadFile } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Download, Folder, File } from 'lucide-react';
import { formatDate } from '@/lib/formatters';

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
          description: `Successfully saved ${file.name} to your downloads folder!`,
        });
        onFileActionComplete();
      } else {
        toast({
          title: 'Download failed',
          description: `Failed to download ${file.name}.`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Download failed',
        description: `An unexpected error occurred while downloading ${file.name}.`,
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
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow className='h-[50px]'>
            <TableHead className="w-[140px]">Name</TableHead>
            <TableHead className="w-[120px]">Modified</TableHead>
            <TableHead className="text-center w-[90px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedFiles.map((file) => (
            <TableRow 
              key={file.id}
              onClick={() => file.isDirectory && onFileClick(file)}
              className={
                file.isDirectory
                  ? 'cursor-pointer hover:bg-muted/50'
                  : 'hover:bg-muted/40'
              }
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                    {file.isDirectory ? (
                      <Folder className="h-4 w-4 text-blue-500" />
                    ) : (
                      <File className="h-4 w-4 text-muted-foreground" />
                    )}
                  </span>
                  <span className="break-words whitespace-pre-line min-w-0">{file.name}</span>
                </div>
              </TableCell>
              {/* Removed Size cell */}
              <TableCell className='text-md'>
                {file.modifiedDate ? formatDate(file.modifiedDate) : '-'}
              </TableCell>
              <TableCell className="text-center">
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
    </div>
  );
}