// AWS Transcribe Service for Voice-to-Text
export interface TranscribeConfig {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
}

export interface TranscribeResult {
  transcript: string;
  confidence: number;
  language: string;
}

export class AWSTranscribeService {
  private config: TranscribeConfig;

  constructor(config: TranscribeConfig) {
    this.config = config;
  }

  /**
   * Upload audio file to S3 and transcribe using AWS Transcribe
   */
  async transcribeAudio(audioUri: string, language: string = 'en-US'): Promise<TranscribeResult> {
    try {
      // Step 1: Upload audio to S3
      const s3Key = await this.uploadToS3(audioUri);
      
      // Step 2: Start transcription job
      const jobName = `transcribe-${Date.now()}`;
      await this.startTranscriptionJob(jobName, s3Key, language);
      
      // Step 3: Poll for completion
      const result = await this.pollTranscriptionJob(jobName);
      
      // Step 4: Clean up S3 file
      await this.deleteFromS3(s3Key);
      
      return result;
    } catch (error) {
      console.error('Transcription failed:', error);
      throw error;
    }
  }

  private async uploadToS3(audioUri: string): Promise<string> {
    const fileName = `audio-${Date.now()}.wav`;
    
    // Create form data for S3 upload
    const formData = new FormData();
    formData.append('file', {
      uri: audioUri,
      type: 'audio/wav',
      name: fileName,
    } as any);

    const response = await fetch(`https://${this.config.bucketName}.s3.${this.config.region}.amazonaws.com/${fileName}`, {
      method: 'PUT',
      headers: {
        'Authorization': this.getS3Authorization('PUT', fileName),
        'Content-Type': 'audio/wav',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`S3 upload failed: ${response.statusText}`);
    }

    return fileName;
  }

  private async startTranscriptionJob(jobName: string, s3Key: string, language: string): Promise<void> {
    const payload = {
      TranscriptionJobName: jobName,
      LanguageCode: language,
      MediaFormat: 'wav',
      Media: {
        MediaFileUri: `s3://${this.config.bucketName}/${s3Key}`
      },
      Settings: {
        ShowSpeakerLabels: false,
        MaxSpeakerLabels: 1,
      }
    };

    const response = await fetch(`https://transcribe.${this.config.region}.amazonaws.com/`, {
      method: 'POST',
      headers: {
        'Authorization': this.getAWSAuthorization('POST', 'transcribe'),
        'Content-Type': 'application/x-amz-json-1.1',
        'X-Amz-Target': 'Transcribe.StartTranscriptionJob',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Transcription job start failed: ${response.statusText}`);
    }
  }

  private async pollTranscriptionJob(jobName: string): Promise<TranscribeResult> {
    const maxAttempts = 30; // 5 minutes max
    let attempts = 0;

    while (attempts < maxAttempts) {
      const response = await fetch(`https://transcribe.${this.config.region}.amazonaws.com/`, {
        method: 'POST',
        headers: {
          'Authorization': this.getAWSAuthorization('POST', 'transcribe'),
          'Content-Type': 'application/x-amz-json-1.1',
          'X-Amz-Target': 'Transcribe.GetTranscriptionJob',
        },
        body: JSON.stringify({ TranscriptionJobName: jobName }),
      });

      const data = await response.json();
      const status = data.TranscriptionJob?.TranscriptionJobStatus;

      if (status === 'COMPLETED') {
        // Download and parse transcript
        const transcriptUri = data.TranscriptionJob.Transcript.TranscriptFileUri;
        return await this.parseTranscript(transcriptUri);
      } else if (status === 'FAILED') {
        throw new Error('Transcription job failed');
      }

      // Wait 10 seconds before next poll
      await new Promise(resolve => setTimeout(resolve, 10000));
      attempts++;
    }

    throw new Error('Transcription job timeout');
  }

  private async parseTranscript(transcriptUri: string): Promise<TranscribeResult> {
    const response = await fetch(transcriptUri);
    const data = await response.json();
    
    const transcript = data.results?.transcripts?.[0]?.transcript || '';
    const confidence = data.results?.items?.[0]?.alternatives?.[0]?.confidence || 0;

    return {
      transcript,
      confidence: parseFloat(confidence),
      language: 'en-US',
    };
  }

  private async deleteFromS3(s3Key: string): Promise<void> {
    await fetch(`https://${this.config.bucketName}.s3.${this.config.region}.amazonaws.com/${s3Key}`, {
      method: 'DELETE',
      headers: {
        'Authorization': this.getS3Authorization('DELETE', s3Key),
      },
    });
  }

  private getS3Authorization(method: string, key: string): string {
    // Simplified AWS Signature V4 - In production, use proper AWS SDK
    const timestamp = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '');
    const date = timestamp.substr(0, 8);
    
    return `AWS4-HMAC-SHA256 Credential=${this.config.accessKeyId}/${date}/${this.config.region}/s3/aws4_request, SignedHeaders=host;x-amz-date, Signature=PLACEHOLDER`;
  }

  private getAWSAuthorization(method: string, service: string): string {
    // Simplified AWS Signature V4 - In production, use proper AWS SDK
    const timestamp = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '');
    const date = timestamp.substr(0, 8);
    
    return `AWS4-HMAC-SHA256 Credential=${this.config.accessKeyId}/${date}/${this.config.region}/${service}/aws4_request, SignedHeaders=host;x-amz-date, Signature=PLACEHOLDER`;
  }
}

// Alternative: OpenAI Whisper API (Simpler Implementation)
export class OpenAIWhisperService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async transcribeAudio(audioUri: string): Promise<TranscribeResult> {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: audioUri,
        type: 'audio/wav',
        name: 'audio.wav',
      } as any);
      formData.append('model', 'whisper-1');
      formData.append('language', 'en');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        transcript: data.text || '',
        confidence: 0.95, // OpenAI doesn't provide confidence scores
        language: 'en',
      };
    } catch (error) {
      console.error('OpenAI Whisper transcription failed:', error);
      throw error;
    }
  }
}