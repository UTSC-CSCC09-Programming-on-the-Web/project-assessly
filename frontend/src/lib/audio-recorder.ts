import { EventEmitter } from "eventemitter3";

// Audio Processing Worklet
const AudioRecordingWorklet = `
class AudioProcessingWorklet extends AudioWorkletProcessor {
  // send and clear buffer every 2048 samples, 
  // which at 16khz is about 8 times a second
  buffer = new Int16Array(2048);

  // current write index
  bufferWriteIndex = 0;

  constructor() {
    super();
    this.hasAudio = false;
  }

  /**
   * @param inputs Float32Array[][] [input#][channel#][sample#] so to access first inputs 1st channel inputs[0][0]
   * @param outputs Float32Array[][]
   */
  process(inputs) {
    if (inputs[0].length) {
      const channel0 = inputs[0][0];
      this.processChunk(channel0);
    }
    return true;
  }

  sendAndClearBuffer(){
    this.port.postMessage({
      event: "chunk",
      data: {
        int16arrayBuffer: this.buffer.slice(0, this.bufferWriteIndex).buffer,
      },
    });
    this.bufferWriteIndex = 0;
  }

  processChunk(float32Array) {
    const l = float32Array.length;
    
    for (let i = 0; i < l; i++) {
      // convert float32 -1 to 1 to int16 -32768 to 32767
      const int16Value = float32Array[i] * 32768;
      this.buffer[this.bufferWriteIndex++] = int16Value;
      if(this.bufferWriteIndex >= this.buffer.length) {
        this.sendAndClearBuffer();
      }
    }

    if(this.bufferWriteIndex >= this.buffer.length) {
      this.sendAndClearBuffer();
    }
  }
}

registerProcessor('audio-recorder-worklet', AudioProcessingWorklet);
`;

// Volume Meter Worklet
const VolMeterWorklet = `
class VolMeterProcessor extends AudioWorkletProcessor {
  bufferSize = 1024;
  bufferWriteIndex = 0;
  buffer = new Float32Array(this.bufferSize);

  constructor() {
    super();
  }

  process(inputs) {
    if (inputs[0].length) {
      const channel0 = inputs[0][0];
      this.processAudio(channel0);
    }
    return true;
  }

  processAudio(audioData) {
    let sum = 0;
    for (let i = 0; i < audioData.length; i++) {
      sum += audioData[i] * audioData[i];
    }
    const volume = Math.sqrt(sum / audioData.length);
    
    this.port.postMessage({ volume });
  }
}

registerProcessor('vol-meter', VolMeterProcessor);
`;

function createWorkletFromSrc(_workletName: string, workletSrc: string): string {
  const blob = new Blob([workletSrc], { type: 'application/javascript' });
  return URL.createObjectURL(blob);
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export class AudioRecorder extends EventEmitter {
  stream: MediaStream | undefined;
  audioContext: AudioContext | undefined;
  source: MediaStreamAudioSourceNode | undefined;
  recording: boolean = false;
  recordingWorklet: AudioWorkletNode | undefined;
  vuWorklet: AudioWorkletNode | undefined;

  private starting: Promise<void> | null = null;

  constructor(public sampleRate = 16000) {
    super();
  }

  async start() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Could not request user media");
    }

    this.starting = new Promise(async (resolve, reject) => {
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            sampleRate: this.sampleRate,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
        
        this.audioContext = new AudioContext({ sampleRate: this.sampleRate });
        await this.audioContext.resume();
        
        this.source = this.audioContext.createMediaStreamSource(this.stream);

        const workletName = "audio-recorder-worklet";
        const src = createWorkletFromSrc(workletName, AudioRecordingWorklet);

        await this.audioContext.audioWorklet.addModule(src);
        this.recordingWorklet = new AudioWorkletNode(
          this.audioContext,
          workletName,
        );

        this.recordingWorklet.port.onmessage = async (ev: MessageEvent) => {
          // worklet processes recording floats and messages converted buffer
          const arrayBuffer = ev.data.data.int16arrayBuffer;

          if (arrayBuffer) {
            const arrayBufferString = arrayBufferToBase64(arrayBuffer);
            this.emit("data", arrayBufferString);
          }
        };
        this.source.connect(this.recordingWorklet);

        // vu meter worklet
        const vuWorkletName = "vol-meter";
        const vuSrc = createWorkletFromSrc(vuWorkletName, VolMeterWorklet);
        await this.audioContext.audioWorklet.addModule(vuSrc);
        
        this.vuWorklet = new AudioWorkletNode(this.audioContext, vuWorkletName);
        this.vuWorklet.port.onmessage = (ev: MessageEvent) => {
          this.emit("volume", ev.data.volume);
        };

        this.source.connect(this.vuWorklet);
        this.recording = true;
        resolve();
        this.starting = null;
      } catch (error) {
        reject(error);
        this.starting = null;
      }
    });

    return this.starting;
  }

  stop() {
    // its plausible that stop would be called before start completes
    // such as if the websocket immediately hangs up
    const handleStop = () => {
      this.recording = false;
      this.source?.disconnect();
      this.stream?.getTracks().forEach((track) => track.stop());
      this.stream = undefined;
      this.recordingWorklet = undefined;
      this.vuWorklet = undefined;
      if (this.audioContext) {
        this.audioContext.close();
        this.audioContext = undefined;
      }
    };
    
    if (this.starting) {
      this.starting.then(handleStop).catch(handleStop);
      return;
    }
    handleStop();
  }
} 