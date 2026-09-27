import { FileType } from '../types';

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function detectFileType(file: File): FileType {
  const mime = file.type.toLowerCase();
  const ext = file.name.split('.').pop()?.toLowerCase() || '';

  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';

  const docExts = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'csv', 'rtf', 'md'];
  if (docExts.includes(ext) || mime.includes('pdf') || mime.includes('document') || mime.includes('sheet') || mime.includes('presentation')) {
    return 'document';
  }

  const archiveExts = ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'];
  if (archiveExts.includes(ext) || mime.includes('zip') || mime.includes('compressed')) {
    return 'archive';
  }

  return 'other';
}

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toUpperCase() : 'FILE';
}

export function getFileTypeBadgeColor(type: FileType, ext: string): { bg: string; text: string; border: string } {
  const upper = ext.toUpperCase();
  if (upper === 'PDF') {
    return { bg: 'bg-rose-500/10 dark:bg-rose-500/20', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-500/30' };
  }
  if (['ZIP', 'RAR', '7Z', 'TAR'].includes(upper)) {
    return { bg: 'bg-amber-500/10 dark:bg-amber-500/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/30' };
  }
  if (['DOC', 'DOCX'].includes(upper)) {
    return { bg: 'bg-blue-500/10 dark:bg-blue-500/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/30' };
  }
  if (['XLS', 'XLSX', 'CSV'].includes(upper)) {
    return { bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/30' };
  }
  if (['PPT', 'PPTX'].includes(upper)) {
    return { bg: 'bg-orange-500/10 dark:bg-orange-500/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-500/30' };
  }
  if (type === 'image') {
    return { bg: 'bg-purple-500/10 dark:bg-purple-500/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/30' };
  }
  if (type === 'video') {
    return { bg: 'bg-indigo-500/10 dark:bg-indigo-500/20', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-500/30' };
  }
  if (type === 'audio') {
    return { bg: 'bg-teal-500/10 dark:bg-teal-500/20', text: 'text-teal-600 dark:text-teal-400', border: 'border-teal-500/30' };
  }
  return { bg: 'bg-slate-500/10 dark:bg-slate-500/20', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-500/30' };
}

export function downloadFile(url: string, filename: string): void {
  // If simulated url
  if (url === '#' || !url.startsWith('http') && !url.startsWith('blob:') && !url.startsWith('data:')) {
    const dummyBlob = new Blob([`Sample content for file ${filename} generated securely on SYED.`], { type: 'text/plain' });
    const blobUrl = URL.createObjectURL(dummyBlob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    return;
  }

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Compress image via Canvas if quality === 'compressed'
export async function processImageFile(file: File, compress = true): Promise<{ url: string; size: number }> {
  return new Promise((resolve) => {
    if (!compress || !file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => resolve({ url: reader.result as string, size: file.size });
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
        // Estimate size from dataUrl
        const approxSize = Math.round((dataUrl.length * 3) / 4);
        resolve({ url: dataUrl, size: approxSize });
      };
      img.onerror = () => {
        resolve({ url: e.target?.result as string, size: file.size });
      };
    };
    reader.readAsDataURL(file);
  });
}
