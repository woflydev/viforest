import { DeviceConnection, CapacityResponse, FileListResponse, FileItem } from '@/types';
import SparkMD5 from 'spark-md5';

export const API_PORT = 8090;

export async function testConnection(ip: string): Promise<boolean> {
  try {
    const response = await fetch(`http://${ip}:${API_PORT}/getCurrentCapacity`, { 
      signal: AbortSignal.timeout(2000)
    });
    const data = await response.json();
    return data.code === 200;
  } catch (error) {
    console.error(`Connection test failed for ${ip}:`, error);
    return false;
  }
}

export async function getStorageCapacity(ip: string): Promise<CapacityResponse | null> {
  try {
    const response = await fetch(`http://${ip}:${API_PORT}/getCurrentCapacity`);
    const data = await response.json();
    return data as CapacityResponse;
  } catch (error) {
    console.error('Failed to get storage capacity:', error);
    return null;
  }
}

export async function getFileList(
  ip: string, 
  folderId: string = '', 
  appType: string = 'root'
): Promise<FileItem[]> {
  try {
    let url = `http://${ip}:${API_PORT}/getChildFolderList?appType=${appType}&language=en`;
    
    if (folderId && appType !== 'root') {
      url += `&folderId=${encodeURIComponent(folderId)}`;
    }
    
    const response = await fetch(url);
    const data = await response.json() as FileListResponse;
    
    if (data.code !== 200) {
      throw new Error(data.msg || 'Failed to get file list');
    }
    
    return data.data.map(item => ({
      ...item,
      id: item.noteId || `${item.appType}-${item.fileName}`,
      name: item.fileName,
      isDirectory: item.isFolder,
      parentId: item.notePId || '',
      modifiedDate: item.updateTime ? new Date(item.updateTime).toISOString() : undefined,
    }));
  } catch (error) {
    console.error('Failed to get file list:', error);
    return [];
  }
}

async function packageFile(ip: string, file: FileItem): Promise<string | null> {
  try {
    const url = `http://${ip}:${API_PORT}/packageFile`;
    const params = new URLSearchParams({
      appType: file.appType,
      fileUrl: file.noteId || file.id,
      fileFormat: file.fileFormat || 'pdf',
      fileName: file.fileName,
      folderId: file.notePId || '',
      isFolder: String(file.isFolder || false),
      childFileFormat: file.fileFormat || 'pdf'
    });

    const response = await fetch(`${url}?${params}`);
    const data = await response.json();
    
    if (data.code !== 200 || !data.data) {
      throw new Error(data.msg || 'Failed to package file');
    }

    return data.data;
  } catch (error) {
    console.error('Package file failed:', error);
    return null;
  }
}

async function checkDownloadReady(ip: string, filePath: string): Promise<boolean> {
  try {
    const url = `http://${ip}:${API_PORT}/checkDownloadFile`;
    const params = new URLSearchParams({
      filePath: filePath
    });

    const response = await fetch(`${url}?${params}`);
    const data = await response.json();
    
    return data.code === 200;
  } catch (error) {
    console.error('Check download failed:', error);
    return false;
  }
}

export async function downloadFile(ip: string, file: FileItem): Promise<boolean> {
  try {
    const filePath = await packageFile(ip, file);
    if (!filePath) {
      throw new Error('Failed to package file');
    }

    const isReady = await checkDownloadReady(ip, filePath);
    if (!isReady) {
      throw new Error('File not ready for download');
    }

    const url = `http://${ip}:${API_PORT}/download`;
    const params = new URLSearchParams({
      filePath: filePath
    });

    const response = await fetch(`${url}?${params}`);
    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = file.fileName;
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(objectUrl);
    
    return true;
  } catch (error) {
    console.error('Download failed:', error);
    return false;
  }
}

async function calculateMD5(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const spark = new SparkMD5.ArrayBuffer();
    
    reader.onload = (e) => {
      if (e.target?.result instanceof ArrayBuffer) {
        spark.append(e.target.result);
        resolve(spark.end());
      } else {
        reject(new Error('Failed to read file as ArrayBuffer'));
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export async function uploadFile(
  ip: string, 
  file: File,   
  appType: string, 
  folderId: string
): Promise<boolean> {
  try {
    console.log("Uploading file:", file);
    const fileMd5 = await calculateMD5(file);
    const fileId = `${fileMd5}${Date.now()}`;
    const chunkSize = 1024 * 1024; // 1MB chunks
    const totalChunks = Math.ceil(file.size / chunkSize);

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append('chunkIndex', chunkIndex.toString());
      formData.append('totalChunks', totalChunks.toString());
      formData.append('fileMd5', fileMd5);
      formData.append('fileId', fileId);
      formData.append('fileName', file.name);
      formData.append('file', chunk);
      formData.append('appType', appType);
      formData.append('folderId', folderId);

      const response = await fetch(`http://${ip}:${API_PORT}/upload_chunk`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      console.log("the result", result);
      if (result.code !== 200) {
        throw new Error(`Chunk upload failed: ${result.msg}`);
      }
    }

    return true;
  } catch (error) {
    console.error('Upload failed:', error);
    return false;
  }
}