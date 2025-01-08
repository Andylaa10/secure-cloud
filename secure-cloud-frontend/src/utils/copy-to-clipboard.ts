export async function copyToClipboard(valueToCopy: string) {
  try {
    await navigator.clipboard.writeText(valueToCopy);
  } catch (err) {
    console.error('Failed to copy private key:', err);
  }
}