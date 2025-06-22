# Audio Format Configuration

## Overview
The app now saves audio files in **MP4 format** instead of WAV for better compatibility and smaller file sizes.

## Changes Made

### Frontend (React Native)
- **Recording Settings**: Updated to use MP4/AAC format
- **File Upload**: Changed MIME type to `audio/mp4`
- **File Extensions**: Updated all references from `.wav` to `.mp4`

### Backend (FastAPI)
- **File Handling**: Supports multiple audio formats (MP4, M4A, AAC, WAV, MP3)
- **Default Format**: Uses `.mp4` as default extension
- **Media Type Detection**: Automatically detects correct MIME type
- **File Validation**: Added size limits (50MB max) and audio type validation

## Audio Recording Configuration

### iOS Settings
```typescript
ios: {
  extension: '.mp4',
  outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
  audioQuality: Audio.IOSAudioQuality.MAX,
  sampleRate: 44100,
  numberOfChannels: 2,
  bitRate: 128000,
}
```

### Android Settings
```typescript
android: {
  extension: '.mp4',
  outputFormat: MPEG_4,
  audioEncoder: AAC,
  sampleRate: 44100,
  numberOfChannels: 2,
  bitRate: 128000,
}
```

## File Naming Convention
```
YYYYMMDD_HHMMSS_{trip_id}.mp4
```

Example: `20231222_143052_f47ac10b-58cc-4372-a567-0e02b2c3d479.mp4`

## Supported Audio Formats

### Upload
- **MP4** (default)
- **M4A** 
- **AAC**
- **WAV**
- **MP3**

### Download
- Files are served with correct MIME types:
  - `.mp4` → `audio/mp4`
  - `.m4a`, `.aac` → `audio/aac`
  - `.wav` → `audio/wav`
  - `.mp3` → `audio/mpeg`

## File Storage Structure
```
backend/
└── travel_planner_api/
    └── uploads/
        └── voice_files/
            ├── 20231222_143052_abc123.mp4
            ├── 20231222_143158_def456.mp4
            └── ...
```

## API Endpoints

### Upload Audio
```
POST /trips
Content-Type: multipart/form-data
File: voice_input (audio file)
```

### Download Audio
```
GET /trips/{trip_id}/voice
Returns: Audio file with correct MIME type
```

### List All Audio Files
```
GET /voice-files
Returns: List of all saved audio files with metadata
```

## Testing

### Test Script
```bash
cd backend
python test_voice_upload.py
```

This creates a test MP4 file and uploads it to verify the functionality.

### File Validation
- **Type**: Must be audio file (validated by MIME type)
- **Size**: Maximum 50MB
- **Format**: Automatically detected from file extension

## Benefits of MP4 Format

1. **Smaller File Size**: Better compression than WAV
2. **Better Compatibility**: Widely supported across platforms
3. **Quality**: AAC encoding provides good quality at lower bitrates
4. **Streaming**: Better suited for web streaming and playback
5. **Metadata**: Can contain additional metadata

## Backward Compatibility

The system still accepts WAV files for backward compatibility, but new recordings default to MP4 format.