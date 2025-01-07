export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const uint8Array = new Uint8Array(buffer);
  let binary = '';
  uint8Array.forEach(byte => binary += String.fromCharCode(byte));
  return window.btoa(binary);
}
