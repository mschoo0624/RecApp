from models import User
from firebase_utils import get_user_data, get_all_users  # Move imports to top
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Tuple
import numpy as np
import logging

logger = logging.getLogger(__name__)

class MatchingAgent:
    def __init__(self):
        # Each user's preferences become a point in high-dimensional space.
        self.vectorizer = TfidfVectorizer(
            stop_words='english',
            max_features=1000,
            ngram_range=(1, 2)  # Include bigrams for better matching
        )
        self.weights = {
            'text_similarity': 0.3,
            'age_compatibility': 0.1,
            'gym_level_match': 0.3,
            'sports_overlap': 0.3
        }
    
    # Data Preprocessing
    def _create_feature_text(self, user: User) -> str:
        """Combine user attributes for vectorization"""
        # Combines attributes into a single text blob
        sports_text = ' '.join(user.sports) if user.sports else 'general'
        
        # Enables NLP processing of structured data
        return f"{user.preferences.gymLevel} {user.preferences.workoutGoal} {sports_text} {user.preferences.age}"

    # helper for better recommendations by calculating the each survery results.
    def _calculate_age_compatibility(self, user1: User, user2: User) -> float:
        try:
            age1 = int(user1.preferences.age)
            age2 = int(user2.preferences.age)
            age_diff = abs(age1 - age2)
            
            # Exponential decay for age difference
            if age_diff <= 2:
                return 1.0
            elif age_diff <= 5:
                return 0.8
            elif age_diff <= 10:
                return 0.5
            else:
                return 0.2
            
        except (ValueError, AttributeError):
            return 0.5  # Default neutral score
    # Calculate gym experience compatibility
    def _calculate_gym_level_match(self, user1: User, user2: User) -> float:
        levels = ['beginner', 'intermediate', 'advanced']
        try:
            level1_idx = levels.index(user1.preferences.gymLevel.lower())
            level2_idx = levels.index(user2.preferences.gymLevel.lower())
            diff = abs(level1_idx - level2_idx)
            
            return 1.0 if diff == 0 else (0.7 if diff == 1 else 0.3)
        except (ValueError, AttributeError):
            return 0.5

    def _calculate_sports_overlap(self, user1: User, user2: User) -> float:
        """Calculate sports interest overlap"""
        sports1 = set(sport.lower() for sport in user1.sports) if user1.sports else set()
        sports2 = set(sport.lower() for sport in user2.sports) if user2.sports else set()
        
        logger.info(f"Comparing sports between {user1.email} and {user2.email}")

        if not sports1 and not sports2:
            return 0.5  # Both have no specific sports
        
        intersection = sports1.intersection(sports2)
        union = sports1.union(sports2)  
        
        return len(intersection) / len(union) if union else 0
    # Core AI Engine. 
    def calculate_compatibility(self, user1: User, user2: User) -> Tuple[float, Dict[str, float]]:
        try:
            # Convert user profiles → TF-IDF vectors. 
            texts = [self._create_feature_text(user1), self._create_feature_text(user2)]
            tfidf_matrix = self.vectorizer.transform(texts)
            text_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            
            # Individual compatibility scores (Calculate domain-specific scores)
            age_compat = self._calculate_age_compatibility(user1, user2)
            gym_match = self._calculate_gym_level_match(user1, user2)
            sports_overlap = self._calculate_sports_overlap(user1, user2)
            
            # Fuse scores with custom weights
            total_score = (
                text_sim * self.weights['text_similarity'] +
                age_compat * self.weights['age_compatibility'] +
                gym_match * self.weights['gym_level_match'] +
                sports_overlap * self.weights['sports_overlap']
            )
            
            score_breakdown = {
                'textSimilarity': round(text_sim, 3),
                'ageCompatibility': round(age_compat, 3),
                'gymLevelMatch': round(gym_match, 3),
                'sportsOverlap': round(sports_overlap, 3)
            }
            
            # Fuse scores with custom weights
            return min(total_score, 1.0), score_breakdown
            
        except Exception as e:
            logger.error(f"Error calculating compatibility: {e}")
            return 0.0, {}
    
    # Recommendation Engine. 
    def find_matches(self, current_user_id: str, limit: int = 5) -> List[Dict]:
        try:
            # First getting the current user's data. 
            current_user = get_user_data(current_user_id)
            if not current_user or not current_user.surveyCompleted:
                logger.warning(f"User {current_user_id} not found or survey incomplete")
                return []

            # Fetching all users except the current user.
            all_users = get_all_users(exclude=[current_user_id])
            if not all_users:
                logger.info("No other users available for matching")
                return []

            # ✅ Refit TF-IDF vectorizer with all user texts
            all_texts = [self._create_feature_text(current_user)] + [
                self._create_feature_text(user) for user in all_users.values()
            ]
            self.vectorizer.fit(all_texts)

            matches = []

            for uid, user in all_users.items():
                compatibility_score, breakdown = self.calculate_compatibility(current_user, user)

                match_data = {
                    "userId": uid,
                    "name": user.fullName,
                    "email": user.email,
                    "sports": user.sports,
                    "gymLevel": user.preferences.gymLevel,
                    "workoutGoal": user.preferences.workoutGoal,
                    "compatibilityScore": round(compatibility_score * 100, 1),
                    "scoreBreakdown": breakdown
                }
                matches.append(match_data)

            sorted_matches = sorted(matches, key=lambda x: x["compatibilityScore"], reverse=True)
            logger.info(f"Found {len(sorted_matches)} potential matches for user {current_user_id}")
            return sorted_matches[:limit]

        except Exception as e:
            logger.error(f"Error finding matches for user {current_user_id}: {e}")
            return []
    
    #Force refresh the vectorizer with current user data
    def refresh_vectorizer(self):
        all_users = get_all_users()
        all_texts = [self._create_feature_text(user) for user in all_users.values()]
        self.vectorizer.fit(all_texts)
        logger.info("Vectorizer refreshed with latest user data")
    
    # Explainable AI. 
    def get_match_explanation(self, user_id1: str, user_id2: str) -> Dict:
        """Get detailed explanation of why two users match"""
        try:
            user1 = get_user_data(user_id1)
            user2 = get_user_data(user_id2)
            
            if not user1 or not user2:
                return {"error": "One or both users not found"}
            
            score, breakdown = self.calculate_compatibility(user1, user2)
            # Provides transparent reasoning for matches:
            return {
                "compatibilityScore": round(score * 100, 1),
                "breakdown": breakdown,
                "commonSports": list(set(user1.sports).intersection(set(user2.sports))),
                "ageDifference": abs(int(user1.preferences.age) - int(user2.preferences.age)),
                "gymLevels": [user1.preferences.gymLevel, user2.preferences.gymLevel],
                "workoutGoals": [user1.preferences.workoutGoal, user2.preferences.workoutGoal]
            }
        except Exception as e:
            logger.error(f"Error generating match explanation: {e}")
            return {"error": "Failed to generate explanation"}