export function getFileIcon(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  
  switch (extension) {
    case 'pdf':
      return 'file-text';
    case 'doc':
    case 'docx':
      return 'file-text';
    case 'xls':
    case 'xlsx':
      return 'file-spreadsheet';
    case 'ppt':
    case 'pptx':
      return 'file-presentation';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
      return 'image';
    case 'mp3':
    case 'wav':
    case 'aac':
    case 'flac':
      return 'file-audio';
    case 'mp4':
    case 'avi':
    case 'mov':
    case 'wmv':
      return 'file-video';
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
    case 'gz':
      return 'file-archive';
    case 'html':
    case 'css':
    case 'js':
    case 'ts':
    case 'jsx':
    case 'tsx':
      return 'file-code';
    default:
      return 'file';
  }
}