import firebase_admin
from firebase_admin import credentials, firestore, auth
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Depends, HTTPException
from .models import User

# Initialize Firebase admin with the service account key.
cred = credentials.Certificate("backend/DontShare/firebase-account-key.json") 
firebase_admin.initialize_app(cred)
db = firestore.client()

