import { Audio } from 'expo-av';

export interface VoiceRecordingResult {
  uri: string;
  duration: number;
  size: number;
}

export class VoiceRecordingService {
  private recording: Audio.Recording | null = null;
  private isRecording = false;

  async startRecording(): Promise<void> {
    try {
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Audio recording permission not granted');
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Create recording
      this.recording = new Audio.Recording();
      await this.recording.prepareToRecordAsync({
        android: {
          extension: '.wav',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_DEFAULT,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_DEFAULT,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      });

      await this.recording.startAsync();
      this.isRecording = true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }

  async stopRecording(): Promise<VoiceRecordingResult> {
    try {
      if (!this.recording || !this.isRecording) {
        throw new Error('No active recording');
      }

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      
      if (!uri) {
        throw new Error('Recording failed - no URI');
      }

      // Get file info
      const info = await this.recording.getStatusAsync();
      
      this.isRecording = false;
      this.recording = null;

      return {
        uri,
        duration: info.durationMillis || 0,
        size: 0, // File size would need additional calculation
      };
    } catch (error) {
      console.error('Failed to stop recording:', error);
      throw error;
    }
  }

  getIsRecording(): boolean {
    return this.isRecording;
  }
}