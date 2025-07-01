from pydantic import BaseModel, Field
from typing import List
from datetime import datetime

class Preferences(BaseModel):
    age: str
    gymLevel: str = Field(..., alias="gymLevel")  # Using alias for camelCase
    height: str
    weight: str
    workoutGoal: str = Field(..., alias="workoutGoal")

class User(BaseModel):
    email: str
    fullName: str = Field(..., alias="fullName")
    phoneNumber: str
    preferences: Preferences
    sports: List[str]
    surveyCompleted: bool = Field(..., alias="surveyCompleted")
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True  # Allows alias usage
        json_encoders = {
            datetime: lambda v: v.strftime("%B %d,%Y at %I:%M:%S %p UTC%z")
        }