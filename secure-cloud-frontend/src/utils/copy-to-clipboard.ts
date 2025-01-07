export async function copyToClipboard(valueToCopy: string) {
  try {
    await navigator.clipboard.writeText(valueToCopy);
    console.log('Private key copied to clipboard');
  } catch (err) {
    console.error('Failed to copy private key:', err);
  }
}