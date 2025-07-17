import { ref, onUnmounted, readonly, type Ref } from 'vue';

export interface UseScreenCaptureResult {
	stream: Readonly<Ref<MediaStream | null>>;
	isStreaming: Readonly<Ref<boolean>>;
	start: () => Promise<MediaStream>;
	stop: () => void;
	error: Readonly<Ref<string | null>>;
}

export function useScreenCapture(): UseScreenCaptureResult {
	const stream = ref<MediaStream | null>(null);
	const isStreaming = ref(false);
	const error = ref<string | null>(null);

	const handleStreamEnded = () => {
		isStreaming.value = false;
		stream.value = null;
	};

	const start = async (): Promise<MediaStream> => {
		try {
			error.value = null;

			if (!navigator.mediaDevices?.getDisplayMedia) {
				throw new Error('Screen capture is not supported in this browser');
			}

			const mediaStream = await navigator.mediaDevices.getDisplayMedia({
				video: {
					width: { ideal: 1920, max: 1920 },
					height: { ideal: 1080, max: 1080 },
					frameRate: { ideal: 30, max: 30 },
				},
				audio: false,
			});

			// Listen for when user stops sharing via browser UI
			mediaStream.getTracks().forEach((track) => {
				track.addEventListener('ended', handleStreamEnded);
			});

			stream.value = mediaStream;
			isStreaming.value = true;
			return mediaStream;
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : 'Failed to start screen capture';
			error.value = errorMessage;
			throw new Error(errorMessage);
		}
	};

	const stop = () => {
		if (stream.value) {
			stream.value.getTracks().forEach((track) => {
				track.removeEventListener('ended', handleStreamEnded);
				track.stop();
			});
			stream.value = null;
			isStreaming.value = false;
		}
		error.value = null;
	};

	// Cleanup on unmount
	onUnmounted(() => {
		stop();
	});

	return {
		stream: readonly(stream),
		isStreaming: readonly(isStreaming),
		error: readonly(error),
		start,
		stop,
	};
}
