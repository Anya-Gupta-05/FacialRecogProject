# Facial Recognition Attendance System

A full-stack mobile application that uses facial recognition for user registration and authentication. This project is built with a React Native (Expo) frontend, a Python (FastAPI) backend, and the `DeepFace` library.

---

## 🚀 Project Overview & Architecture

This section explains the features and technical design of the project.

### Features

* **User Registration:** Register a new user with their name, email, and a photo.
* **Dual Image Input:** Supports capturing a live photo with the camera or uploading from the phone's gallery.
* **User Authentication:** Log in an existing user by verifying their face.
* **Efficient AI Matching:** The system pre-calculates a user's "face fingerprint" (embedding) once during registration and stores it in the database for fast, scalable matching.

<br>

<details>
  <summary><b>Click to see the full Tech Stack</b></summary>
  
  | Area | Technology | Purpose |
  | :--- | :--- | :--- |
  | **Frontend** | React Native (Expo) | Cross-platform (iOS/Android) mobile application. |
  | | Expo Router | File-based navigation between screens. |
  | | Expo Camera / Image Picker | For dual image inputs. |
  | | Axios | For making HTTP requests to the backend API. |
  | **Backend** | Python 3.11 | Core programming language. |
  | | FastAPI | High-performance web framework for the API. |
  | | `deepface` (with `ArcFace`) | The core AI library for face recognition. |
  | | `numpy` | For fast mathematical comparisons of face embeddings. |
  | **Database** | SQLite & `sqlalchemy` | For storing user info and embeddings. |
  | **DevOps** | `ngrok` | Creates a secure tunnel for mobile testing. |

</details>

<br>

<details>
  <summary><b>Click to see the detailed "How It Works" flow</b></summary>
  
  ### 1. Registration Flow
  1.  A user fills out their name/email and uploads a photo on the React Native app.
  2.  The app sends this data to the `POST /register` endpoint on the FastAPI server.
  3.  The server saves the user's name/email to the `users.db` (SQLite) database.
  4.  The server uses `DeepFace.represent()` to generate a **face embedding** (a "math fingerprint").
  5.  This embedding is saved in the database next to the user's name.

  ### 2. Login (Recognition) Flow
  1.  A user takes or selects a new photo on the app.
  2.  The app sends this photo to the `POST /recognize` endpoint.
  3.  The server generates a new embedding for this temporary photo.
  4.  The server loops through all embeddings in the database, using `numpy` to find the one with the lowest "distance" (highest similarity).
  5.  If a match is found, the server returns the matched user's name. Otherwise, it returns a "Not Found" error.

</details>

<br>

<details>
  <summary><b>Click to see the AI Model Showcase</b></summary>
  
  This repository includes a Jupyter Notebook, `model_showcase.ipynb`, that provides a deep dive into the AI model. It visually demonstrates:
  1.  How an image is converted into an embedding.
  2.  How the "distance" score is calculated for a "match" vs. a "rejection".
</details>

---

## 🔧 Setup & Installation

This section explains how to get the project running on your local machine.

### Prerequisites

* Python 3.10+
* Conda (or another Python environment manager)
* Node.js (LTS version)
* The **Expo Go** app on your physical phone (iOS or Android)
* A free `ngrok` account (for the authtoken)

### 1. Backend Setup

```bash
# 1. Clone the repository and navigate to the backend
git clone [https://github.com/your-username/your-project.git](https://github.com/your-username/your-project.git)
cd your-project/backend

# 2. Create and activate the Conda environment
conda create -n face-api-env python=3.11
conda activate face-api-env

# 3. Install all Python packages
pip install "fastapi[all]" sqlalchemy deepface numpy matplotlib ipykernel
```

### 2.  Frontend Setup

```bash
# In a new terminal, navigate to the frontend folder
cd your-project/frontend

# 1. Install all Node.js packages
npm install

# 2. Install the expo-ngrok tool (required for tunneling)
sudo npm install --global @expo/ngrok@^4.1.0
```
### Running the Project
##This project requires three separate terminals to run simultaneously.

### Terminal 1: Start the Backend (FastAPI)
```bash
cd your-project/backend
conda activate face-api-env
uvicorn main:app --reload --port 8001
```
Your backend is now running on http://localhost:8001.

### Terminal 2: Start the Tunnel (ngrok)
```bash

# This command requires a one-time setup with your authtoken
# (See ngrok.com for info)
ngrok http 8001
```
ngrok will give you a public URL (e.g., https://your-random-id.ngrok-free.app). Copy this URL.


### Terminal 3: Start the Frontend (Expo)
```bash

cd your-project/frontend

# 1. Update the API address
#    Open 'api.js' and paste your new ngrok URL into the 'API_URL' variable.

# 2. Start the app using the --tunnel flag
npx expo start --tunnel
```
A QR code will appear. Scan this with the Expo Go app on your phone.
