import { fetch as tauriFetch } from '@tauri-apps/plugin-http';
import type { DeviceCapacity, FileItem } from '@/types';
import SparkMD5 from 'spark-md5';

export const API_PORT = 8090;

const getDeviceApiUrl = (ip: string, path: string): string =>
  `http://${ip}:${API_PORT}${path}`;

export async function testConnection(ip: string): Promise<boolean> {
  const url = getDeviceApiUrl(ip, '/getCurrentCapacity');
  try {
    const response = await tfetch(url);
    const data = await response.json();
    console.log('[handshake]', data.code);
    return !!(response.ok && data && data.code === 200);
  } catch (error) {
    console.error(`[handshake] failed for ${ip}:`, error);
    return false;
  }
}

export async function getStorageCapacity(ip: string): Promise<DeviceCapacity | null> {
  const url = getDeviceApiUrl(ip, '/getCurrentCapacity');
  try {
    const response = await tfetch(url);
    const data = await response.json();
    if (response.ok && data && data.code === 200) {
      return data;
    }
    return null;
  } catch (error) {
    console.error(`[storage] Error fetching storage capacity for ${ip}:`, error);
    return null;
  }
}

export async function getFileList(
  ip: string,
  folderId: string = '',
  appType: string = 'root'
): Promise<FileItem[]> {
  let path = `/getChildFolderList?appType=${appType}&language=en`;
  if (folderId && appType !== 'root') {
    path += `&folderId=${encodeURIComponent(folderId)}`;
  }
  const url = getDeviceApiUrl(ip, path);

  try {
    const response = await tfetch(url, { method: 'GET' });
    const data = await response.json();
    if (response.ok && data && data.code === 200) {
      return data.data.map((item: any) => ({
        ...item,
        id: item.noteId || `${item.appType}-${item.fileName}`,
        name: item.fileName,
        isDirectory: item.isFolder,
        parentId: item.notePId || '',
        modifiedDate: item.updateTime ? new Date(item.updateTime).toISOString() : undefined,
      }));
    }
    return [];
  } catch (error) {
    console.error(`[files] Error fetching file list for ${ip}:`, error);
    return [];
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
  const url = getDeviceApiUrl(ip, '/upload_chunk');
  const fileMd5 = await calculateMD5(file);
  const fileId = `${fileMd5}${Date.now()}`;
  const chunkSize = 1024 * 1024;
  const totalChunks = Math.ceil(file.size / chunkSize);

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunkBlob = file.slice(start, end);

    const form = new FormData();
    form.append('chunkIndex', chunkIndex.toString());
    form.append('totalChunks', totalChunks.toString());
    form.append('fileMd5', fileMd5);
    form.append('fileId', fileId);
    form.append('fileName', file.name);
    form.append('appType', appType);
    form.append('folderId', folderId);
    form.append('file', chunkBlob, `chunk_${chunkIndex}_${file.name}`);

    try {
      const response = await tfetch(url, {
        method: 'POST',
        body: form,
      });
      const data = await response.json();
      if (!response.ok || !data || data.code !== 200) {
        console.error(
          `[upload] Chunk ${chunkIndex} upload failed for ${file.name}.`,
          'Status:',
          response.status,
          'Response:',
          data
        );
        return false;
      }
    } catch (error) {
      console.error(`[upload] Error uploading chunk ${chunkIndex} for ${file.name}:`, error);
      return false;
    }
  }
  return true;
}

export async function downloadFile(ip: string, fileItem: FileItem): Promise<boolean> {
  const url = getDeviceApiUrl(ip, `/download?filePath=${encodeURIComponent(fileItem.id)}`);
  try {
    const response = await tfetch(url, { method: 'GET' });
    const arrayBuffer = await response.arrayBuffer();
    const blob = new Blob([arrayBuffer], {
      type: fileItem.fileFormat || 'application/octet-stream',
    });
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = fileItem.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(objectUrl);
    return true;
  } catch (error) {
    console.error(`[download] Error downloading ${fileItem.fileName}:`, error);
    return false;
  }
}

async function tfetch(
  url: string,
  options: { timeout?: number; [key: string]: any } = {}
) {
  const { timeout = 2000 } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  console.log("[fetch] URL:", url);

  const response = await tauriFetch(url, {
    ...options,
    signal: controller.signal
  });
  clearTimeout(timer);

  return response;
}