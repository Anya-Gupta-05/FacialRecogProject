# Facial Recognition Attendance System

A full-stack mobile application that uses facial recognition for user registration and authentication. This project is built with a React Native (Expo) frontend, a Python (FastAPI) backend, and the `DeepFace` library for AI-powered face matching.



## Features

* **User Registration:** Register a new user with their name, email, and a photo.
* **Dual Image Input:** Supports capturing a live photo with the camera or uploading from the phone's gallery.
* **User Authentication:** Log in an existing user by verifying their face.
* **Efficient AI Matching:** Does **not** re-calculate embeddings on every login. The system pre-calculates a user's "face fingerprint" (embedding) once during registration and stores it in the database.
* **Scalable Backend:** The FastAPI backend handles all AI processing and database logic, keeping the mobile app fast and lightweight.

---

## Tech Stack

| Area | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React Native (Expo) | Cross-platform (iOS/Android) mobile application. |
| | Expo Router | File-based navigation between screens. |
| | Expo Camera | For live photo capture. |
| | Expo Image Picker | For selecting photos from the gallery. |
| | Axios | For making HTTP requests to the backend API. |
| **Backend** | Python 3.11 | Core programming language. |
| | FastAPI | High-performance, modern web framework for the API. |
| | `uvicorn` | ASGI server to run the FastAPI app. |
| | `deepface` | The core AI library for face recognition. |
| | `ArcFace` | The specific AI model used for generating embeddings. |
| | `numpy` | For fast mathematical comparisons of face embeddings. |
| **Database** | SQLite | Lightweight, file-based SQL database for storing user info and embeddings. |
| | `sqlalchemy` | Python ORM for interacting with the database. |
| **DevOps** | `ngrok` | Creates a secure tunnel to expose the local backend server to the internet for mobile testing. |

---

## How It Works (Core Architecture)

This project uses a modern, efficient architecture for face recognition. It does **not** simply "compare pictures."

### 1. Registration Flow

1.  A user fills out their name/email and uploads a photo on the React Native app.
2.  The app sends this data to the `POST /register` endpoint on the FastAPI server.
3.  The server saves the user's name/email to the `users.db` (SQLite) database.
4.  The server uses `DeepFace.represent()` to analyze the photo and generate a **face embedding** (a 512-dimension vector, or "math fingerprint").
5.  This embedding is saved as a JSON string in the database next to the user's name.



### 2. Login (Recognition) Flow

1.  A user takes or selects a new photo on the app.
2.  The app sends this photo to the `POST /recognize` endpoint.
3.  The server generates a new embedding for this temporary photo.
4.  The server then loops through all embeddings in the database, using `numpy` to find the one with the lowest "distance" (highest similarity) to the new embedding.
5.  If a match is found that is below the `SIMILARITY_THRESHOLD` (0.68), the server returns the matched user's name. Otherwise, it returns a "Not Found" error.

---

## 🔬 AI Model Showcase

This repository includes a Jupyter Notebook, `model_showcase.ipynb`, that provides a deep dive into the AI model. It visually demonstrates:
1.  How an image is converted into an embedding.
2.  How the "distance" score is calculated.
3.  Why two different photos of the same person have a **low distance** (a match).
4.  Why photos of two different people have a **high distance** (a rejection).

---
