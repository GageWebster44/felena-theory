export async function fileToBase64(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  // IMPORTANT: Alpaca expects *raw* base64 (no data:... prefix)
  return Buffer.from(buf).toString('base64');
}