export async function downloadFile(content: Uint8Array, name: string): Promise<void> {
  try {
    const contentToDownload = new Blob([content], {type: 'application/octet-stream'});

    const url = URL.createObjectURL(contentToDownload);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('File download error:', error);
  }
}  