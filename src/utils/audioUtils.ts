/**
 * Audio Utilities for handling Gemini TTS PCM audio, converting to WAV Blobs,
 * and managing downloads and playback visualizations.
 */

export function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Encodes 16-bit mono PCM bytes into a standard WAV format with a 44-byte header
 */
export function pcmToWavBlob(base64Pcm: string, sampleRate = 24000, numChannels = 1): Blob {
  const pcmBytes = base64ToUint8Array(base64Pcm);
  const byteRate = sampleRate * numChannels * 2; // 16-bit = 2 bytes
  const blockAlign = numChannels * 2;
  const dataSize = pcmBytes.length;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // SubChunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, byteRate, true); // ByteRate
  view.setUint16(32, blockAlign, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample (16 bits)

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Write PCM data
  const outputBytes = new Uint8Array(buffer, 44);
  outputBytes.set(pcmBytes);

  return new Blob([buffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Triggers client-side download of a Blob URL
 */
export function downloadAudioFile(blobUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename.endsWith('.wav') ? filename : `${filename}.wav`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates an estimated duration for 16-bit mono 24kHz PCM
 */
export function calculatePcmDuration(base64Pcm: string, sampleRate = 24000): number {
  try {
    const pcmBytes = base64ToUint8Array(base64Pcm);
    const bytesPerSecond = sampleRate * 2; // 16-bit mono = 2 bytes per sample
    return Math.max(0.5, pcmBytes.length / bytesPerSecond);
  } catch {
    return 1.0;
  }
}

/**
 * Format seconds into mm:ss
 */
export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
