export interface DeviceCapacity {
  data(data: any): unknown;
  code: number;
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
  fileFormat: string;
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

export interface ApiError {
  code: number;
  message: string;
}

export interface BreadcrumbItem {
  id?: string;
  name: string;
  path: string;
  appType: string;
}