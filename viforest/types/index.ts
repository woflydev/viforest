// Device types
export interface DeviceCapacity {
  current: number;
  currentStr: string;
  free: number;
  freeStr: string;
  total: number;
  totalStr: string;
}

export interface CapacityResponse {
  code: number;
  data: DeviceCapacity;
  msg: string;
}

export interface DeviceConnection {
  ip: string;
  name: string;
  isConnected: boolean;
  lastConnected?: Date;
}

// File types
export interface FileParentFolder {
  appType: string;
  encryption: boolean;
  fileName: string;
  isFolder: boolean;
  isScreenshot: boolean;
  isSelect: boolean;
  noteId?: string;
  size: number;
  updateTime: number;
}

export interface FileItem {
  appType: string;
  encryption: boolean;
  fileName: string;
  isFolder: boolean;
  isScreenshot: boolean;
  isSelect: boolean;
  noteId?: string;
  notePId?: string;
  parentFolder?: FileParentFolder;
  showBitmapPath?: string;
  size: number;
  updateTime: number;
  // UI-specific fields
  id: string;
  name: string;
  isDirectory: boolean;
  parentId: string;
  modifiedDate?: string;
}

export interface FileListResponse {
  code: number;
  data: FileItem[];
  msg: string;
}

// API types
export interface ApiError {
  code: number;
  message: string;
}

// UI types
export interface BreadcrumbItem {
  id?: string;
  name: string;
  path: string;
  appType: string;
}