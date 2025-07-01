from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from .models import User
from .firebase_utils import get_user_data, update_user_sports
from .matching_agent import MatchingAgent
from typing import List

app = FastAPI()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

matching_agent = MatchingAgent()

@app.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    user = get_user_data(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@app.get("/matches/{user_id}/explain/{target_user_id}")
async def explain_match(user_id: str, target_user_id: str):
    """Get detailed match explanation"""
    explanation = matching_agent.get_match_explanation(user_id, target_user_id)
    return explanation

@app.patch("/users/{user_id}/sports")
async def update_sports(user_id: str, sports: List[str]):
    if not sports:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sports list cannot be empty"
        )
        
    success = update_user_sports(user_id, sports)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update sports"
        )
    return {"status": "success", "updatedSports": sports}