from fastapi import FastAPI, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
from typing import List
import logging
import traceback

# Importing other files. 
from models import User
from matching_agent import MatchingAgent
from firebase_utils import (
    get_user_data, 
    update_user_sports, 
    get_all_users,
    batch_get_users
)

# Configure logging with more detail
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Creating instance of the fastAPI.  
app = FastAPI()

# Add exception handler for better debugging
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global exception handler caught: {exc}")
    logger.error(f"Request URL: {request.url}")
    logger.error(f"Request method: {request.method}")
    logger.error(f"Traceback: {traceback.format_exc()}")
    
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"}
    )

# CORS Configuration. 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize matching agent with error handling
try:
    matching_agent = MatchingAgent()
    logger.info("MatchingAgent initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize MatchingAgent: {e}")
    logger.error(f"Traceback: {traceback.format_exc()}")
    raise

# Request models.
# Model for updating user's sports preferences
class SportsUpdateRequest(BaseModel):
    sports: List[str]  # List of sports activities.

    # Every time data is assigned to the sports field, run this custom validation method before accepting the value. 
    @validator('sports')  # Fixed: changed from 'sport' to 'sports'
    def validate_sports(cls, v):
        if not v:
            raise ValueError('Sports list cannot be empty')
        if len(v) > 10:
            raise ValueError('Maximum 10 sports allowed')
        return [sport.strip() for sport in v if sport.strip()]
    
# Model for filtering potential matches
class MatchFilters(BaseModel):
    min_age: Optional[int] = None  # Minimum age filter 
    max_age: Optional[int] = None  # Maximum age filter 
    gym_levels: Optional[List[str]] = None  # ["Beginner", "Intermediate", "Advanced"]
    sports: Optional[List[str]] = None  # Sports to match. 
    min_compatibility: Optional[float] = 0.0  # Minimum score threshold.
    
# Standard API response format
class ApiResponse(BaseModel):
    status: str  # "success" or "error"
    message: Optional[str] = None  # Optional descriptive message
    data: Optional[Dict[str, Any]] = None  # Response payload
    timestamp: datetime = datetime.utcnow()  # Auto-generated UTC timestamp

# User Management Endpoints. 
@app.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    try:
        logger.info(f"Fetching user data for user_id: {user_id}")
        # Getting the user's data. 
        user = get_user_data(user_id)
    
        if not user:
            logger.warning(f"User {user_id} not found")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found."
            )
    
        logger.info(f"Successfully retrieved user profile: {user_id}")
        return user
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving user {user_id}: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user"
        )

# Matching Endpoints with enhanced debugging
@app.get("/matches/{user_id}")
async def get_matches(
    user_id: str,
    limit: int = Query(default=5, ge=1, le=20),
    min_score: float = Query(default=0.0, ge=0.0, le=100.0)
):
    try:
        logger.info(f"Finding matches for user_id: {user_id}, limit: {limit}, min_score: {min_score}")
        
        # Debug: Check if matching_agent is initialized
        if not matching_agent:
            logger.error("MatchingAgent is not initialized")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Matching service not available"
            )
        
        # Trying to find the matching users. 
        logger.info("Calling matching_agent.find_matches...")
        TargetMatch = matching_agent.find_matches(user_id, limit)
        logger.info(f"Raw matches returned: {len(TargetMatch) if TargetMatch else 0}")

        if not TargetMatch:
            logger.warning(f"No matches found for user {user_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No compatible matches found."
            )
                
        if min_score > 0:
            original_count = len(TargetMatch)
            TargetMatch = [m for m in TargetMatch if m["compatibilityScore"] >= min_score]
            logger.info(f"Filtered matches from {original_count} to {len(TargetMatch)} based on min_score")
        
        logger.info(f"Successfully found {len(TargetMatch)} matches for user {user_id}")
        
        response = {
            "userId": user_id,
            "matches": TargetMatch,
            "total": len(TargetMatch),
            "criteria": {
                "limit": limit,
                "min_score": min_score
            },
            "generated_at": datetime.utcnow().isoformat()
        }
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error finding matches for {user_id}: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate matches: {str(e)}"
        )

# More advanced find the matches. 
@app.post("/matches/{user_id}/advanced")
async def get_advanced_matches(
    user_id: str,
    filters: MatchFilters,
    limit: int = Query(default=5, ge=1, le=20)
):
    try:
        logger.info(f"Advanced matching for user_id: {user_id}")
        # Basic implementation - can be enhanced with filtering logic
        matches = matching_agent.find_matches(user_id, limit)
        
        # Apply filters (basic implementation)
        filtered_matches = []
        for match in matches:
            if match["compatibilityScore"] >= (filters.min_compatibility * 100):
                filtered_matches.append(match)
        
        return {
            "userId": user_id,
            "matches": filtered_matches[:limit],
            "filters_applied": filters.dict(),
            "total": len(filtered_matches)
        }
    except Exception as e:
        logger.error(f"Error in advanced matching for {user_id}: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate advanced matches"
        )

# Get detailed explanation of why two users match. 
@app.get("/matches/{user_id}/explain/{target_user_id}")
async def explain_match(user_id: str, target_user_id: str):
    try:
        logger.info(f"Explaining match between {user_id} and {target_user_id}")
        explanation = matching_agent.get_match_explanation(user_id, target_user_id)
        
        if "error" in explanation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=explanation["error"]
            )
        
        logger.info(f"Generated match explanation: {user_id} <-> {target_user_id}")
        
        return {
            "user1_id": user_id,
            "user2_id": target_user_id,
            "explanation": explanation,
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error explaining match {user_id}-{target_user_id}: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate match explanation"
        )

# User Preferences Updates. 
@app.patch("/users/{user_id}/sports")
async def update_sports(user_id: str, request: SportsUpdateRequest):
    try:
        logger.info(f"Updating sports for user {user_id}: {request.sports}")
        # Have updated the sports preferences. 
        success = update_user_sports(user_id, request.sports)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to update sports preferences"
            )
        
        logger.info(f"Successfully updated sports for user {user_id}")
        
        return {
            "status": "success",
            "message": "Sports preferences updated successfully",
            "user_id": user_id,
            "updated_sports": request.sports,
            "updated_at": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating sports for {user_id}: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user preferences"
        )

# Analytics & Statistics
@app.get("/stats/matches/{user_id}")
async def get_user_match_stats(user_id: str):
    try:
        logger.info(f"Getting match stats for user {user_id}")
        matches = matching_agent.find_matches(user_id, limit=20)
        
        if not matches:
            return {
                "user_id": user_id,
                "stats": {
                    "total_potential_matches": 0,
                    "average_compatibility": 0,
                    "top_compatibility": 0
                }
            }
        
        scores = [m["compatibilityScore"] for m in matches]
        
        return {
            "user_id": user_id,
            "stats": {
                "total_potential_matches": len(matches),
                "average_compatibility": round(sum(scores) / len(scores), 1),
                "top_compatibility": max(scores),
                "score_distribution": {
                    "excellent": len([s for s in scores if s >= 80]),
                    "good": len([s for s in scores if 60 <= s < 80]),
                    "fair": len([s for s in scores if 40 <= s < 60]),
                    "poor": len([s for s in scores if s < 40])
                }
            },
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error generating stats for {user_id}: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate user statistics"
        )
        
# To get the overall platform statistics. 
@app.get("/stats/platform")
async def get_platform_stats():
    try:
        logger.info("Getting platform statistics")
        # Getting all the users.
        all_users = get_all_users()
        
        if not all_users:
            return {
                "total_users": 0,
                "active_users": 0,
                "stats": {}
            }
            
        # Basic analytics
        users_list = list(all_users.values())
        gym_levels = [u.preferences.gymLevel for u in users_list]
        all_sports = [sport for u in users_list for sport in u.sports]
        
        from collections import Counter
        return {
            "total_users": len(users_list),
            "active_users": len([u for u in users_list if u.surveyCompleted]),
            "stats": {
                "gym_level_distribution": dict(Counter(gym_levels)),
                "popular_sports": dict(Counter(all_sports).most_common(10)),
                "recent_signups": len([
                    u for u in users_list 
                    if (datetime.utcnow() - u.createdAt).days <= 7
                ])
            },
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error generating platform stats: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate platform statistics"
        )

# Health check endpoint
@app.get("/health")
async def health_check():
    try:
        # Test basic functionality
        logger.info("Health check requested")
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "matching_agent_initialized": matching_agent is not None
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Service unhealthy"
        )
        
# Adding for the test cases. 
@app.get("/test/user/{user_id}")
async def test_user_fetch(user_id: str):
    """Test endpoint to debug user fetching"""
    try:
        logger.info(f"Testing user fetch for: {user_id}")
        
        # Step 1: Test Firebase connection
        logger.info("Step 1: Testing Firebase connection...")
        from firebase_utils import db
        logger.info("✓ Firebase connection successful")
        
        # Step 2: Test user document exists
        logger.info("Step 2: Testing user document exists...")
        doc_ref = db.collection("users").document(user_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return {"error": "User document not found", "user_id": user_id}
        
        logger.info("✓ User document exists")
        
        # Step 3: Test raw data
        logger.info("Step 3: Getting raw user data...")
        raw_data = doc.to_dict()
        logger.info(f"Raw data keys: {list(raw_data.keys())}")
        
        # Step 4: Test User model creation
        logger.info("Step 4: Testing User model creation...")
        user = get_user_data(user_id)
        
        if not user:
            return {"error": "Failed to create User model", "raw_data": raw_data}
            
        logger.info("✓ User model created successfully")
        
        # Step 5: Test matching agent initialization
        logger.info("Step 5: Testing matching agent...")
        if not matching_agent:
            return {"error": "MatchingAgent not initialized"}
        
        logger.info("✓ MatchingAgent is initialized")
        
        return {
            "success": True,
            "user_id": user_id,
            "user_name": user.fullName,
            "survey_completed": user.surveyCompleted,
            "sports_count": len(user.sports),
            "raw_data_keys": list(raw_data.keys())
        }
        
    except Exception as e:
        logger.error(f"Test failed: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        return {
            "error": str(e),
            "traceback": traceback.format_exc()
        }