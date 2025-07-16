import firebase_admin  # Firebase Admin SDK for Python
from firebase_admin import credentials, firestore  # Import credentials and Firestore client
from google.cloud.firestore_v1.base_client import BaseClient  # Firestore base client (not always needed)
from models import User, FriendRequest, FriendRequestResponse,FriendRequestAction  
from typing import Dict, Optional, List, Union  # Type hints for better code clarity
import os  # For file path operations
import logging  # For logging errors and info
from datetime import datetime

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
    # Check if 'created_at' field exists and has a 'to_datetime' method
    if 'created_at' in data and hasattr(data['created_at'], 'to_datetime'):
        # Convert Firestore timestamp to Python datetime
        data['created_at'] = data['created_at'].to_datetime()
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
        # Debugging here to fix the finding the match user. 
        logger.info("DEBUGGING: Testing the converted Data.")
        data = _convert_firestore_data(doc.to_dict())  # Convert Firestore data
        logger.info("DEBUGGING: Has Successfully converted!!!")
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

#Update user's sports list with validation
def update_user_sports(user_id: str, sports: List[str]) -> bool:
    try:
        # Validate sports list
        if not sports or not isinstance(sports, list):
            logger.warning(f"Invalid sports data for user {user_id}")
            return False
        
        # Sanitize sports list
        clean_sports = [sport.strip() for sport in sports if isinstance(sport, str) and sport.strip()]
        
        if not clean_sports:
            logger.warning(f"No valid sports provided for user {user_id}")
            return False
        
        db.collection("users").document(user_id).update({
            "preferences.sports": clean_sports,
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

# Create the new friends requests documents. (In the firebase database)
def create_friend_request(from_user_id: str, to_user_id: str) -> Optional[str]:
    try:
        from_user = get_user_data(from_user_id)
        to_user = get_user_data(to_user_id)
        
        request_data = {
            "from_user": from_user_id,
            "from_user_name": from_user.fullName,
            "to_user": to_user_id,
            "to_user_name": to_user.fullName,
            "status": "pending",
            "created_at": firestore.SERVER_TIMESTAMP
        }
        # Adds a new doc with the data in request_data to the friend_requests collection in Firestore.
        _, doc_ref = db.collection("friend_requests").add(request_data)
        # and returning the newly created friend request doc. 
        logger.info("DEBUGGING: Returning the newly added user request doc.")
        return doc_ref.id
    
    except Exception as e:
        logger.error(f"Error creating friend request: {e}")
        return None
    
# Update status of a friend request (accepted/rejected)
def update_friend_request_status(request_id: str, status: str) -> bool:
    try:
        # Checking if the argument is either accepct or rejected.
        if status not in ["accepted", "rejected"]:
            raise ValueError("Invalid status")
        # Updating the data either "accepcted" or "rejected".
        db.collection("friend_requests").document(request_id).update({
            "status": status,
            "responded_at": firestore.SERVER_TIMESTAMP
        })
        return True
    
    except Exception as e:
        logger.error(f"Error updating friend request: {e}")
        return False
    
# Add mutual friendship between two users
def add_friendship(user1_id: str, user2_id: str) -> bool:
    try:
        batch = db.batch() 
        user1_ref = db.collection("users").document(user1_id)
        user2_ref = db.collection("users").document(user2_id)
        
        batch.update(user1_ref, {
            "friends": firestore.ArrayUnion([user2_id]),
            "updated_at": firestore.SERVER_TIMESTAMP
        })
        batch.update(user2_ref, {
            "friends": firestore.ArrayUnion([user1_id]),
            "updated_at": firestore.SERVER_TIMESTAMP
        })
        # commit the changes. 
        batch.commit()
        user1_data = get_user_data(user1_id)
        user1 = user1_data.fullName
        
        user2_data = get_user_data(user2_id)
        user2 = user2_data.fullName
        
        logger.info(f"Successfully add_friendship function between {user1} and {user2}")
        return True
    
    except Exception as e:
        logger.error(f"Error creating friendship: {e}")
        return False

#Get pending friend requests for a user. 
def get_pending_requests(user_id: str) -> List[Dict]:
    try:
        requests = db.collection("friend_requests") \
            .where("to_user", "==", user_id) \
            .where("status", "==", "pending") \
            .order_by("created_at", direction=firestore.Query.DESCENDING) \
            .stream()

        return [
            {**_convert_firestore_data(doc.to_dict()), "id": doc.id}
            for doc in requests
        ]
    except Exception as e:
        logger.error(f"Error fetching pending requests: {e}")
        return []

# To fetch a friend request document by its ID
def get_friend_request(request_id: str) -> Optional[dict]:
    try:
        doc_ref = db.collection("friend_requests").document(request_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            logger.warning(f"Friend request {request_id} not found")
            return None
        
        data = doc.to_dict()
        data["id"] = doc.id
        return data
    
    except Exception as e:
        logger.error(f"Error fetching friend request {request_id}: {e}")
        return None

# Get a user's friends list with basic info. 
def get_friends_list(user_id: str) -> List[Dict]:
    try:
        # Getting uer's doc to look at their collectionss. 
        user_ref = db.collection("users").document(user_id)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            return []
        
        # Checking the matching users.     
        friends = user_doc.to_dict().get("friends", [])
        if not friends:
            return []
        
        # Removed the photoURL for now. 
        # .select(["fullName", "photoURL", "sports"])\
        # Batch fetch friend profiles
        friends_docs = db.collection("users")\
                       .where(firestore.FieldPath.document_id(), "in", friends)\
                       .select(["fullName", "sports"])\
                       .stream()
        logger.info("DEBUGGING: HELLO IT WORKED HEHE!!!")
        return [{"id": doc.id, **doc.to_dict()} for doc in friends_docs]
    
    except Exception as e:
        logger.error(f"Error fetching friends list: {e}")
        return []

# Enhanced converter to handle friend request timestamps
def _convert_firestore_data(data: dict) -> dict:
    if 'created_at' in data and hasattr(data['created_at'], 'to_datetime'):
        data['created_at'] = data['created_at'].to_datetime()
    if 'responded_at' in data and hasattr(data['responded_at'], 'to_datetime'):
        data['responded_at'] = data['responded_at'].to_datetime()
    return data