import os
import shutil
import json
import numpy as np
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends, File, UploadFile, Form, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from deepface import DeepFace

# Import our database definitions
import database
from database import User, get_db, create_db_and_tables

app = FastAPI(title="Face Recognition API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    """Create database tables on startup."""
    print("Application is starting up...")
    create_db_and_tables()
    print("Database tables created.")

FACES_STORAGE_PATH = "user_faces"
MODEL_NAME = "ArcFace"
SIMILARITY_THRESHOLD = 0.68


def save_image_file(image_file: UploadFile, user_id: int) -> str:
    try:
        user_folder = os.path.join(FACES_STORAGE_PATH, f"user_{user_id}")
        os.makedirs(user_folder, exist_ok=True)
        image_path = os.path.join(user_folder, "face.jpg")
        with open(image_path, "wb") as output_file:
            shutil.copyfileobj(image_file.file, output_file)
        return image_path
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save image: {str(e)}"
        )

def get_face_embedding(image_path: str) -> str:
    """
    Generates a face embedding from an image file.
    This will now "lazy-load" the model on the first request.
    """
    try:
        embedding_objs = DeepFace.represent(
            img_path=image_path,
            model_name=MODEL_NAME,
            enforce_detection=True
        )
        embedding = embedding_objs[0]["embedding"]
        return json.dumps(embedding)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not process face from image: {e}"
        )

def find_best_match(unknown_embedding_str: str, db: Session) -> User | None:
    """
    Compares a new embedding against all known users in the database.
    Returns the matched User object or None.
    """
    unknown_embedding = np.array(json.loads(unknown_embedding_str))
    
    all_users = db.query(User).filter(User.embedding != None).all()
    if not all_users:
        return None

    best_match_user = None
    lowest_distance = float('inf')

    for user in all_users:
        known_embedding = np.array(json.loads(user.embedding))
        
        distance = 1 - (np.dot(unknown_embedding, known_embedding) / 
                        (np.linalg.norm(unknown_embedding) * np.linalg.norm(unknown_embedding)))
        
        if distance < lowest_distance:
            lowest_distance = distance
            best_match_user = user

    if lowest_distance <= SIMILARITY_THRESHOLD:
        return best_match_user
    else:
        return None


@app.post("/register", status_code=status.HTTP_201_CREATED)
async def register(
    name: str = Form(...),
    email: str = Form(...),
    image_file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Email already registered"
        )

    user = User(name=name, email=email)
    db.add(user)
    db.commit()
    db.refresh(user)

    try:
        image_path = save_image_file(image_file, user.id)
        embedding_json = get_face_embedding(image_path)
        
        user.image_path = image_path
        user.embedding = embedding_json
        db.commit()

    except HTTPException as e:
        db.delete(user)
        db.commit()
        raise e

    return {
        "message": "User registered successfully.",
        "user_id": user.id
    }

@app.post("/recognize")
async def recognize(
    image_file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    temp_image_path = "temp_recognition_face.jpg"
    with open(temp_image_path, "wb") as output_file:
        shutil.copyfileobj(image_file.file, output_file)

    try:
        embedding_objs = DeepFace.represent(
            img_path=temp_image_path,
            model_name=MODEL_NAME,
            enforce_detection=False
        )
        unknown_embedding_str = json.dumps(embedding_objs[0]["embedding"])

        matched_user = find_best_match(unknown_embedding_str, db)

        if not matched_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="No matching user found in database."
            )
        return {
            "message": "Face recognized successfully.",
            "user_name": matched_user.name,
            "user_email": matched_user.email
        }
        
    finally:
        if os.path.exists(temp_image_path):
            os.remove(temp_image_path)
