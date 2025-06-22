from fastapi import FastAPI, File, UploadFile
from pydantic import BaseModel
from datetime import datetime
import shutil

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Travel Planner API is running"}

class Plan(BaseModel):
    title: str
    description: str
    latitude: float
    longitude: float
    start: datetime
    end: datetime
    cost: float

@app.post("/plan", response_model=Plan)
async def create_plan(voice_input: UploadFile = File(...)):
    """
    This endpoint takes a voice input file and will eventually generate a travel plan.
    For now, it saves the file locally and returns a dummy plan.
    """
    # This saves the uploaded file.
    # In the future, you would send this file to a transcription service.
    with open(f"temp_{voice_input.filename}", "wb") as buffer:
        shutil.copyfileobj(voice_input.file, buffer)

    dummy_plan = {
        "title": "Trip to Paris",
        "description": "A wonderful week in the city of lights.",
        "latitude": 48.8566,
        "longitude": 2.3522,
        "start": "2024-08-01T09:00:00",
        "end": "2024-08-08T18:00:00",
        "cost": 2500.00
    }
    return dummy_plan 