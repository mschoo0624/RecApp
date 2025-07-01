import firebase_admin  # Firebase Admin SDK for Python
from firebase_admin import credentials, firestore  # Import credentials and Firestore client
from google.cloud.firestore_v1.base_client import BaseClient  # Firestore base client (not always needed)
from .models import User  # Import User model from local models.py
from typing import Dict, Optional, List  # Type hints for better code clarity
import os  # For file path operations
import logging  # For logging errors and info

# Configure logging to show INFO level and above
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Firebase with error handling
try:
    if not firebase_admin._apps:  # Prevent re-initialization if already initialized
        cred = credentials.Certificate(
            os.path.join(os.path.dirname(__file__), "DontShare", "firebase-account-key.json")  # Path to service account key
        )
        firebase_admin.initialize_app(cred)  # Initialize Firebase app
    db = firestore.client()  # Get Firestore client
except Exception as e:
    logger.error(f"Firebase initialization failed: {e}")  # Log error if initialization fails
    raise

# Convert Firestore timestamps to datetime objects
def _convert_firestore_data(data: dict) -> dict:
    # Check if 'createdAt' field exists and has a 'to_datetime' method
    if 'createdAt' in data and hasattr(data['createdAt'], 'to_datetime'):
        # Convert Firestore timestamp to Python datetime
        data['createdAt'] = data['createdAt'].to_datetime()
    # Return the updated dictionary
    return data

# Fetch and validate user document
def get_user_data(user_id: str) -> Optional[User]:
    try:
        doc_ref = db.collection("users").document(user_id)  # Reference to user document
        doc = doc_ref.get()  # Get document snapshot
        print("DEBUGGING: Got the users_ID")
        
        if not doc.exists:
            logger.info(f"User {user_id} not found")  # Log if user does not exist
            return None

        data = _convert_firestore_data(doc.to_dict())  # Convert Firestore data
        return User(**data)  # Return User object
    
    except Exception as e:
        logger.error(f"Error fetching user {user_id}: {e}")  # Log error if fetch fails
        return None

def get_all_users(exclude: List[str] = None) -> Dict[str, User]:
    """Get all users except excluded ones"""
    if exclude is None:
        exclude = []
    
    try:
        users_ref = db.collection("users")  # Reference to users collection
        docs = users_ref.stream()  # Stream all user documents
        
        users = {}
        for doc in docs:
            if doc.id not in exclude:  # Skip excluded users
                data = doc.to_dict()
                if 'surveyCompleted' in data and data['surveyCompleted']:  # Only include users who completed survey
                    converted_data = _convert_firestore_data(data)
                    users[doc.id] = User(**converted_data)
        
        logger.info(f"Retrieved {len(users)} users")  # Log number of users retrieved
        return users
    except Exception as e:
        logger.error(f"Error fetching users: {e}")  # Log error if fetch fails
        return {}

def update_user_sports(user_id: str, sports: List[str]) -> bool:
    """Update user's sports list with validation"""
    try:
        # Validate sports list
        if not sports or not isinstance(sports, list):
            logger.warning(f"Invalid sports data for user {user_id}")
            return False
        
        # Sanitize sports list
        clean_sports = [sport.strip() for sport in sports if isinstance(sport, str) and sport.strip()]
        print("Debugging: Sport Lists: ", clean_sports)
        
        if not clean_sports:
            logger.warning(f"No valid sports provided for user {user_id}")
            return False
        
        db.collection("users").document(user_id).update({
            "sports": clean_sports,
            "lastUpdated": firestore.SERVER_TIMESTAMP  # Update timestamp
        })
        
        logger.info(f"Updated sports for user {user_id}: {clean_sports}")  # Log update
        return True
    
    except Exception as e:
        logger.error(f"Update failed for user {user_id}: {str(e)}")  # Log error if update fails
        return False

def batch_get_users(user_ids: List[str]) -> Dict[str, User]:
    """Efficiently fetch multiple users in batch"""
    try:
        users = {}
        batch_refs = [db.collection("users").document(uid) for uid in user_ids]  # Create document references
        docs = db.get_all(batch_refs)  # Batch fetch documents
        
        for doc in docs:
            if doc.exists:
                data = _convert_firestore_data(doc.to_dict())
                users[doc.id] = User(**data)
        
        return users
    except Exception as e:
        logger.error(f"Batch fetch failed: {e}")  # Log error if batch fetch fails
        return {}