from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import HTTPBearer
from firebase_admin import auth
from . import firebase_utils, matching_agent, models

app = FastAPI()
# authentication using bearer tokens for Firebase ID tokens. 
security = HTTPBearer()

@app.post("/matches", response_model=models.MatchResponse)
async def get_matches(user_id: str, current_user: models.User = Depends(firebase_utils.get_current_user)):
    return