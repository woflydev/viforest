import { fetch as tauriFetch } from '@tauri-apps/plugin-http';
import { writeFile } from '@tauri-apps/plugin-fs';
import { downloadDir, join } from '@tauri-apps/api/path'; // <-- Import path functions
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

async function packageFile(ip: string, file: FileItem): Promise<string | null> {
  const apiUrl = getDeviceApiUrl(ip, '/packageFile');
  // Ensure all properties used here exist on your FileItem type
  const params = new URLSearchParams({
    appType: file.appType || 'unknown', // Provide a fallback if appType can be undefined
    fileUrl: file.noteId || file.id,    // Use noteId if available, otherwise id
    fileFormat: file.fileFormat || 'pdf', // Default if not specified
    fileName: file.name,
    folderId: file.parentId || '',
    isFolder: String(file.isDirectory || false),
    childFileFormat: file.fileFormat || 'pdf' // Assuming this is still needed
  });

  const fullUrl = `${apiUrl}?${params.toString()}`;
  console.log(`[download - packageFile] Requesting: ${fullUrl}`);

  try {
    const response = await tfetch(fullUrl, { method: 'GET' }); // Using current tfetch
    const data = await response.json();

    if (response.ok && data && data.code === 200 && data.data) {
      console.log(`[download - packageFile] Success, filePath: ${data.data}`);
      return data.data; // This is the filePath string
    }
    console.error(`[download - packageFile] Failed. Status: ${response.status}, Message: ${data?.msg}, Data:`, data);
    return null;
  } catch (error) {
    console.error(`[download - packageFile] Error for ${file.name}:`, error);
    return null;
  }
}

async function checkDownloadFileReady(ip: string, filePath: string): Promise<boolean> {
  const apiUrl = getDeviceApiUrl(ip, '/checkDownloadFile');
  const params = new URLSearchParams({ filePath });
  const fullUrl = `${apiUrl}?${params.toString()}`;
  // console.log(`[download - checkDownloadFileReady] Requesting: ${fullUrl}`); // Can be verbose

  try {
    const response = await tfetch(fullUrl, { method: 'GET' }); // Using current tfetch
    const data = await response.json();
    const isReady = response.ok && data && data.code === 200;
    // console.log(`[download - checkDownloadFileReady] FilePath: ${filePath}, IsReady: ${isReady}, Response Code: ${data?.code}`);
    return isReady;
  } catch (error) {
    console.error(`[download - checkDownloadFileReady] Error for filePath ${filePath}:`, error);
    return false;
  }
}

// --- Updated downloadFile function ---
export async function downloadFile(ip: string, fileItem: FileItem): Promise<boolean> {
  console.log(`[Tauri Download] Starting download process for ${fileItem.name}`);
  try {
    // 1. Package the file
    const packagedFilePath = await packageFile(ip, fileItem);
    if (!packagedFilePath) {
      console.error(`[Tauri Download] Failed to package file ${fileItem.name}.`);
      return false;
    }
    console.log(`[Tauri Download] File ${fileItem.name} packaged. Device Path: ${packagedFilePath}`);

    // 2. Check if the file is ready for download (with polling and timeout)
    let isReady = false;
    const maxRetries = 15; // Increased retries
    const retryDelay = 2000; // 2 seconds delay
    for (let i = 0; i < maxRetries; i++) {
      isReady = await checkDownloadFileReady(ip, packagedFilePath);
      if (isReady) {
        console.log(`[Tauri Download] File ${fileItem.name} is ready for download.`);
        break;
      }
      console.log(`[Tauri Download] File ${fileItem.name} not ready (attempt ${i + 1}/${maxRetries}). Retrying in ${retryDelay / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }

    if (!isReady) {
      console.error(`[Tauri Download] File ${fileItem.name} was not ready for download after ${maxRetries} retries.`);
      return false;
    }

    // 3. Download the actual file from the device
    const downloadUrlParams = new URLSearchParams({ filePath: packagedFilePath });
    const actualDeviceDownloadUrl = getDeviceApiUrl(ip, `/download?${downloadUrlParams.toString()}`);
    console.log(`[Tauri Download] Fetching actual file data from: ${actualDeviceDownloadUrl}`);

    const response = await tfetch(actualDeviceDownloadUrl, { method: 'GET' }); // Using current tfetch
    if (!response.ok) {
      console.error(`[Tauri Download] Failed to fetch file data for ${fileItem.name}. Status: ${response.status}`);
      return false;
    }
    const arrayBuffer = await response.arrayBuffer();
    console.log(`[Tauri Download] File ${fileItem.name} data fetched successfully (${arrayBuffer.byteLength} bytes).`);

    // 4. Save the file to user's downloads directory using Tauri FS
    const userDownloadsPath = await downloadDir();
    // Sanitize filename just in case, though fileItem.name should be fine
    const fileNameOnly = fileItem.name.replace(/[\/\\]/g, '_'); // Replace slashes with underscores
    const destinationPath = await join(userDownloadsPath, fileNameOnly);
    console.log(`[Tauri Download] Saving file to: ${destinationPath}`);

    await writeFile(destinationPath, new Uint8Array(arrayBuffer));

    console.log(`[Tauri Download] File ${fileItem.name} downloaded and saved successfully to ${destinationPath}.`);
    return true;
  } catch (error) {
    console.error(`[Tauri Download] Overall error during download process for ${fileItem.name}:`, error);
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