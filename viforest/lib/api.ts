import { fetch as tauriFetch } from '@tauri-apps/plugin-http';
import { writeFile } from '@tauri-apps/plugin-fs';
import { downloadDir, join } from '@tauri-apps/api/path'; // <-- Import path functions
import type { DeviceCapacity, FileItem } from '@/types';
import SparkMD5 from 'spark-md5';
import { revealItemInDir } from '@tauri-apps/plugin-opener';

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

async function packageFile(ip: string, file: FileItem): Promise<string | null> {
  const apiUrl = getDeviceApiUrl(ip, '/packageFile');
  const params = new URLSearchParams({
    appType: file.appType || 'unknown',
    fileUrl: file.noteId || file.id, // Use noteId if available (normally this is the correct one), otherwise id
    fileFormat: file.fileFormat || 'pdf',
    fileName: file.name,
    folderId: file.parentId || '',
    isFolder: String(file.isDirectory || false),
    childFileFormat: file.fileFormat || 'pdf'
  });

  const fullUrl = `${apiUrl}?${params.toString()}`;
  console.log(`[download] requesting package...`);

  try {
    const response = await tfetch(fullUrl, { method: 'GET' });
    const data = await response.json();

    if (response.ok && data && data.code === 200 && data.data) {
      return data.data; // This is the filePath string
    }
    console.error(`[download] packaging failed. Status: ${response.status}, Message: ${data?.msg}, Data:`, data);
    return null;
  } catch (error) {
    console.error(`[download ] unexpected error for ${file.name}:`, error);
    return null;
  }
}

async function checkDownloadFileReady(ip: string, filePath: string): Promise<boolean> {
  const apiUrl = getDeviceApiUrl(ip, '/checkDownloadFile');
  const params = new URLSearchParams({ filePath });
  const fullUrl = `${apiUrl}?${params.toString()}`;
  try {
    const response = await tfetch(fullUrl, { method: 'GET' });
    const data = await response.json();
    const isReady = response.ok && data && data.code === 200;
    return isReady;
  } catch (error) {
    console.error(`[download] error when checking file readiness ${filePath}:`, error);
    return false;
  }
}

export async function downloadFile(ip: string, fileItem: FileItem): Promise<boolean> {
  console.log(`[download] starting download for ${fileItem.name}`);
  try {
    // 1. Package the file
    const packagedFilePath = await packageFile(ip, fileItem);
    if (!packagedFilePath) {
      console.error(`[download] packaging failed for ${fileItem.name}.`);
      return false;
    }
    console.log(`[download] file packaged!`);

    let isReady = false;
    const maxRetries = 15;
    const retryDelay = 2000; // 2 seconds delay
    for (let i = 0; i < maxRetries; i++) {
      isReady = await checkDownloadFileReady(ip, packagedFilePath);
      if (isReady) {
        console.log(`[download] file ready!`);
        break;
      }
      console.log(`[download] waiting for package... (attempt ${i + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }

    if (!isReady) {
      console.error(`[download] packaging failed after ${maxRetries} retries!`);
      return false;
    }

    // 3. Download the actual file from the device
    const downloadUrlParams = new URLSearchParams({ filePath: packagedFilePath });
    const actualDeviceDownloadUrl = getDeviceApiUrl(ip, `/download?${downloadUrlParams.toString()}`);

    const response = await tfetch(actualDeviceDownloadUrl, { method: 'GET' }); // Using current tfetch
    if (!response.ok) {
      console.error(`[download] no data for ${fileItem.name}! status: ${response.status}`);
      return false;
    }
    const arrayBuffer = await response.arrayBuffer();
    console.log(`[download] data fetched successfully (${arrayBuffer.byteLength} bytes).`);

    // 4. Save the file to user's downloads directory
    const userDownloadsPath = await downloadDir();
    const fileNameOnly = fileItem.name.replace(/[\/\\]/g, '_');
    const destinationPath = await join(userDownloadsPath, fileNameOnly);

    await writeFile(destinationPath, new Uint8Array(arrayBuffer));
    await revealItemInDir(destinationPath);

    console.log(`[download] File ${fileItem.name} saved to ${destinationPath}.`);
    return true;
  } catch (error) {
    console.error(`[download] Unexpected error during download process for ${fileItem.name}:`, error);
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

  const response = await tauriFetch(url, {
    ...options,
    signal: controller.signal
  });
  clearTimeout(timer);

  return response;
}