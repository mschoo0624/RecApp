from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class Preferences(BaseModel):
    age: str
    gymLevel: str = Field(..., alias="gymLevel")
    height: str
    weight: str
    workoutGoal: str = Field(..., alias="workoutGoal")

class User(BaseModel):
    email: str
    fullName: str = Field(..., alias="fullName")
    phoneNumber: str
    preferences: Preferences
    sports: Optional[List[str]] = Field(default_factory=list)  # <-- FIXED LINE
    surveyCompleted: bool = Field(..., alias="surveyCompleted")
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        validate_by_name = True
        json_encoders = {
            datetime: lambda v: v.strftime("%B %d,%Y at %I:%M:%S %p UTC%z")
        }