/**
 * Utility functions for Live API data processing
 */

/**
 * Convert blob to JSON
 */
export async function blobToJSON(blob: Blob): Promise<any> {
	const text = await blob.text();
	return JSON.parse(text);
}

/**
 * Convert base64 string to ArrayBuffer
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
	const binaryString = atob(base64);
	const bytes = new Uint8Array(binaryString.length);
	for (let i = 0; i < binaryString.length; i++) {
		bytes[i] = binaryString.charCodeAt(i);
	}
	return bytes.buffer;
}

/**
 * Convert ArrayBuffer to base64 string
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
	const bytes = new Uint8Array(buffer);
	let binary = '';
	bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
	return btoa(binary);
}

/**
 * Format log messages for display
 */
export function formatLogMessage(message: any): string {
	if (typeof message === 'string') {
		return message;
	}

	if (typeof message === 'object') {
		return JSON.stringify(message, null, 2);
	}

	return String(message);
}

/**
 * Get log level color class
 */
export function getLogLevelColor(type: string): string {
	if (type.includes('error')) return 'text-red-600';
	if (type.includes('warn')) return 'text-yellow-600';
	if (type.includes('server')) return 'text-blue-600';
	if (type.includes('client')) return 'text-green-600';
	return 'text-gray-600';
}

/**
 * Debounce function for audio processing
 */
export function debounce<T extends (...args: any[]) => any>(
	func: T,
	wait: number,
): (...args: Parameters<T>) => void {
	let timeout: ReturnType<typeof setTimeout>;
	return function executedFunction(...args: Parameters<T>) {
		const later = () => {
			clearTimeout(timeout);
			func(...args);
		};
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
}
