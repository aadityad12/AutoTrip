from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, validator
from datetime import datetime, date
from typing import List, Optional, Literal
import shutil
import uuid
import json
import os
from pathlib import Path

app = FastAPI(title="Travel Planner API", version="1.0.0")

# Add CORS middleware for mobile app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create directories for storing files
UPLOAD_DIR = Path("uploads")
VOICE_FILES_DIR = UPLOAD_DIR / "voice_files"
VOICE_FILES_DIR.mkdir(parents=True, exist_ok=True)

# In-memory storage (replace with database in production)
trips_db = {}
payments_db = {}

@app.get("/")
async def root():
    return {"message": "Travel Planner API is running", "version": "1.0.0"}

# Models
class TripEvent(BaseModel):
    id: int
    title: str
    startTime: str
    endTime: str
    description: str
    type: str
    cost: float
    location: str
    coordinates: dict

class TripRequest(BaseModel):
    destination: str
    budget: Optional[float] = None
    duration: Optional[str] = None

class Trip(BaseModel):
    id: str
    destination: str
    duration: str
    status: Literal['confirmed', 'draft']
    cost: float
    date: str
    tripData: List[TripEvent]
    bookingReference: Optional[str] = None
    voiceFileName: Optional[str] = None

class TripStatusUpdate(BaseModel):
    status: Literal['confirmed', 'draft']
    bookingReference: Optional[str] = None

class PaymentRequest(BaseModel):
    tripId: str
    amount: float
    paymentMethod: str
    cardDetails: Optional[dict] = None

class PaymentResponse(BaseModel):
    paymentId: str
    status: str
    bookingReference: str

# Dummy data generators
def generate_dummy_trip_data(destination: str, budget: float = 3000) -> List[TripEvent]:
    """Generate dummy trip events based on destination"""
    base_events = [
        {
            "id": 1,
            "title": f"Flight to {destination}",
            "startTime": "08:00 AM",
            "endTime": "02:00 PM",
            "description": f"Direct flight to {destination}",
            "type": "travel",
            "cost": min(800, budget * 0.3),
            "location": f"{destination} Airport",
            "coordinates": {"lat": 35.6762, "lng": 139.6503}
        },
        {
            "id": 2,
            "title": "Hotel Check-in",
            "startTime": "03:00 PM",
            "endTime": "04:00 PM",
            "description": f"Check into hotel in {destination}",
            "type": "accommodation",
            "cost": min(400, budget * 0.4),
            "location": f"Downtown {destination}",
            "coordinates": {"lat": 35.6895, "lng": 139.6917}
        },
        {
            "id": 3,
            "title": "City Tour",
            "startTime": "05:00 PM",
            "endTime": "07:00 PM",
            "description": f"Guided tour of {destination}",
            "type": "activity",
            "cost": 50,
            "location": f"{destination} City Center",
            "coordinates": {"lat": 35.6762, "lng": 139.6503}
        },
        {
            "id": 4,
            "title": "Local Cuisine Dinner",
            "startTime": "07:30 PM",
            "endTime": "09:00 PM",
            "description": f"Traditional {destination} dining experience",
            "type": "dining",
            "cost": 80,
            "location": f"Local Restaurant, {destination}",
            "coordinates": {"lat": 35.6812, "lng": 139.7671}
        }
    ]
    
    return [TripEvent(**event) for event in base_events]

# Endpoints
@app.post("/trips", response_model=Trip)
async def create_trip(voice_input: UploadFile = File(...)):
    """Create a new trip from voice input"""
    # Validate file type
    if voice_input.content_type and not voice_input.content_type.startswith('audio/'):
        raise HTTPException(status_code=400, detail="File must be an audio file")
    
    # Generate unique filename with timestamp and trip ID
    trip_id = str(uuid.uuid4())
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Get file extension from original filename or default to .mp4
    file_extension = ".mp4"
    if voice_input.filename and "." in voice_input.filename:
        original_extension = "." + voice_input.filename.split(".")[-1].lower()
        # Accept common audio formats
        if original_extension in [".mp4", ".m4a", ".aac", ".wav", ".mp3"]:
            file_extension = original_extension
    
    # Create unique filename
    voice_filename = f"{timestamp}_{trip_id}{file_extension}"
    voice_file_path = VOICE_FILES_DIR / voice_filename
    
    # Save the voice file
    try:
        with open(voice_file_path, "wb") as buffer:
            content = await voice_input.read()
            
            # Validate file size (max 50MB)
            if len(content) > 50 * 1024 * 1024:
                raise HTTPException(status_code=413, detail="File too large. Maximum size is 50MB")
            
            buffer.write(content)
        
        print(f"Voice file saved: {voice_file_path}")
        print(f"File size: {len(content)} bytes")
        print(f"File format: {file_extension}")
        
    except Exception as e:
        print(f"Error saving voice file: {e}")
        raise HTTPException(status_code=500, detail="Failed to save voice file")
    
    # Mock: Extract destination and budget from "transcription"
    # In a real implementation, you would:
    # 1. Send the voice file to a speech-to-text service
    # 2. Extract destination, budget, and preferences from the transcription
    # 3. Use AI to plan the actual trip
    destination = "Tokyo, Japan"
    budget = 3000.0
    
    # Generate trip data
    trip_data = generate_dummy_trip_data(destination, budget)
    total_cost = sum(event.cost for event in trip_data)
    
    trip = Trip(
        id=trip_id,
        destination=destination,
        duration="5 days",
        status="draft",
        cost=total_cost,
        date=date.today().isoformat(),
        tripData=trip_data,
        voiceFileName=voice_filename
    )
    
    trips_db[trip_id] = trip.dict()
    return trip

@app.get("/trips", response_model=List[Trip])
async def get_trips():
    """Get all trips"""
    return [Trip(**trip) for trip in trips_db.values()]

@app.get("/trips/{trip_id}", response_model=Trip)
async def get_trip(trip_id: str):
    """Get specific trip by ID"""
    if trip_id not in trips_db:
        raise HTTPException(status_code=404, detail="Trip not found")
    return Trip(**trips_db[trip_id])

@app.put("/trips/{trip_id}/status", response_model=Trip)
async def update_trip_status(trip_id: str, status_update: TripStatusUpdate):
    """Update trip status"""
    if trip_id not in trips_db:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    trip_data = trips_db[trip_id]
    trip_data["status"] = status_update.status
    if status_update.bookingReference:
        trip_data["bookingReference"] = status_update.bookingReference
    
    return Trip(**trip_data)

@app.post("/payments", response_model=PaymentResponse)
async def process_payment(payment_request: PaymentRequest):
    """Process payment for a trip"""
    if payment_request.tripId not in trips_db:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    # Mock payment processing
    payment_id = str(uuid.uuid4())
    booking_reference = f"TRV{uuid.uuid4().hex[:8].upper()}"
    
    payment_response = PaymentResponse(
        paymentId=payment_id,
        status="completed",
        bookingReference=booking_reference
    )
    
    payments_db[payment_id] = {
        **payment_request.dict(),
        "paymentId": payment_id,
        "status": "completed",
        "bookingReference": booking_reference,
        "processedAt": datetime.now().isoformat()
    }
    
    # Update trip status to confirmed
    trips_db[payment_request.tripId]["status"] = "confirmed"
    trips_db[payment_request.tripId]["bookingReference"] = booking_reference
    
    return payment_response

@app.get("/trips/{trip_id}/itinerary")
async def download_itinerary(trip_id: str):
    """Download trip itinerary"""
    if trip_id not in trips_db:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    trip = trips_db[trip_id]
    return {
        "message": "Itinerary download ready",
        "tripId": trip_id,
        "destination": trip["destination"],
        "downloadUrl": f"/downloads/itinerary_{trip_id}.pdf"
    }

@app.get("/trips/{trip_id}/voice")
async def get_voice_file(trip_id: str):
    """Download the original voice file for a trip"""
    if trip_id not in trips_db:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    trip = trips_db[trip_id]
    voice_filename = trip.get("voiceFileName")
    
    if not voice_filename:
        raise HTTPException(status_code=404, detail="Voice file not found for this trip")
    
    voice_file_path = VOICE_FILES_DIR / voice_filename
    
    if not voice_file_path.exists():
        raise HTTPException(status_code=404, detail="Voice file no longer exists")
    
    # Determine media type based on file extension
    media_type = "audio/mp4"
    if voice_filename.lower().endswith(('.wav')):
        media_type = "audio/wav"
    elif voice_filename.lower().endswith(('.mp3')):
        media_type = "audio/mpeg"
    elif voice_filename.lower().endswith(('.m4a', '.aac')):
        media_type = "audio/aac"
    
    return FileResponse(
        path=voice_file_path,
        filename=voice_filename,
        media_type=media_type
    )

@app.get("/voice-files")
async def list_voice_files():
    """List all saved voice files (for debugging)"""
    voice_files = []
    for filename in os.listdir(VOICE_FILES_DIR):
        file_path = VOICE_FILES_DIR / filename
        if file_path.is_file():
            stat = file_path.stat()
            voice_files.append({
                "filename": filename,
                "size": stat.st_size,
                "created": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                "modified": datetime.fromtimestamp(stat.st_mtime).isoformat()
            })
    return {"voice_files": voice_files} 