#!/usr/bin/env python3
"""
Test script to verify voice file upload functionality
"""

import requests
import json
from pathlib import Path

# API base URL
BASE_URL = "http://localhost:8000"

def create_test_audio_file():
    """Create a dummy MP4 audio file for testing"""
    test_file = Path("test_audio.mp4")
    
    # Create a minimal MP4 container with AAC audio
    # This is a very basic MP4 structure for testing
    mp4_header = (
        b'\x00\x00\x00\x20ftypmp42\x00\x00\x00\x00mp42isom'  # ftyp box
        b'\x00\x00\x00\x08free'  # free box
    )
    
    # Add some dummy audio data
    dummy_audio_data = b'\x00\x01' * 1000  # 2000 bytes of dummy data
    
    with open(test_file, 'wb') as f:
        f.write(mp4_header)
        f.write(dummy_audio_data)
    
    return test_file

def test_voice_upload():
    """Test the voice file upload endpoint"""
    print("Creating test audio file...")
    test_file = create_test_audio_file()
    
    try:
        print(f"Uploading {test_file.name} to {BASE_URL}/trips...")
        
        with open(test_file, 'rb') as f:
            files = {'voice_input': (test_file.name, f, 'audio/mp4')}
            response = requests.post(f"{BASE_URL}/trips", files=files)
        
        if response.status_code == 200:
            trip_data = response.json()
            print("✅ Upload successful!")
            print(f"Trip ID: {trip_data['id']}")
            print(f"Voice file: {trip_data.get('voiceFileName', 'Not saved')}")
            print(f"Destination: {trip_data['destination']}")
            print(f"Cost: ${trip_data['cost']}")
            
            # Test retrieving the voice file
            print(f"\nTesting voice file retrieval...")
            voice_response = requests.get(f"{BASE_URL}/trips/{trip_data['id']}/voice")
            
            if voice_response.status_code == 200:
                print("✅ Voice file retrieval successful!")
                print(f"Retrieved file size: {len(voice_response.content)} bytes")
            else:
                print(f"❌ Voice file retrieval failed: {voice_response.status_code}")
            
            return trip_data
            
        else:
            print(f"❌ Upload failed: {response.status_code}")
            print(f"Error: {response.text}")
            return None
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to API. Make sure the server is running on http://localhost:8000")
        return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None
    finally:
        # Clean up test file
        if test_file.exists():
            test_file.unlink()
            print(f"Cleaned up {test_file.name}")

def test_list_voice_files():
    """Test the voice files listing endpoint"""
    try:
        print(f"\nTesting voice files listing...")
        response = requests.get(f"{BASE_URL}/voice-files")
        
        if response.status_code == 200:
            data = response.json()
            voice_files = data.get('voice_files', [])
            print(f"✅ Found {len(voice_files)} voice files:")
            
            for file_info in voice_files:
                print(f"  📁 {file_info['filename']} ({file_info['size']} bytes)")
                print(f"      Created: {file_info['created']}")
        else:
            print(f"❌ Failed to list voice files: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error listing voice files: {e}")

if __name__ == "__main__":
    print("🎙️  Testing voice file upload functionality")
    print("=" * 50)
    
    # Test upload
    trip = test_voice_upload()
    
    # Test listing
    test_list_voice_files()
    
    print("\n✨ Test complete!")