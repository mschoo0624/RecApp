from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class Preferences(BaseModel):
    age: str
    gymLevel: str = Field(..., alias="gymLevel")
    height: str
    weight: str
    workoutGoal: str = Field(..., alias="workoutGoal")
    sports: List[str] = Field(default_factory=list)

class User(BaseModel):
    email: str
    fullName: str = Field(..., alias="fullName")
    phoneNumber: str
    preferences: Preferences
    sports: Optional[List[str]] = Field(default_factory=list)
    surveyCompleted: bool = Field(..., alias="surveyCompleted")
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    friends: List[str] = Field(default_factory=list)  # New field for friend relationships
    friendRequests: List[str] = Field(default_factory=list)  # Optional: track pending requests

    class Config:
        validate_by_name = True
        json_encoders = {
            datetime: lambda v: v.strftime("%B %d,%Y at %I:%M:%S %p UTC%z")
        }

# New models for friend requests
class FriendRequest(BaseModel):
    from_user: str
    to_user: str
    status: str = "pending"  # "pending", "accepted", "rejected"
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    message: Optional[str] = None

class FriendRequestResponse(BaseModel):
    request_id: str
    status: str
    message: str
    
class FriendRequestAction(BaseModel):  # ✅ New input model
    request_id: str
    response: str