rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null;
    }
    match /game_sessions/{sessionId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
    match /high_scores/{scoreId} {
      allow read;
      allow create: if request.auth != null;
    }
    
    match /userScores/{userId} {
      allow read: if true; 
      
      allow write: if request.auth != null && request.auth.uid == userId;
      
      allow create: if request.auth != null && 
                      request.auth.uid == userId &&
                      request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null && 
                      request.auth.uid == userId;
    }
  }
}
