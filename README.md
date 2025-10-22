# 🌍 GeoRemix!

**GeoRemix** to gra stworzona we współpracy Koła Naukowego **BIT** z firmą **NVIDIA**, która łączy nowoczesne technologie przetwarzania obrazu oparte na sztucznej inteligencji z dobrze znaną zabawą w stylu **GeoGuessr**.

Lokalizacje wykorzystywane w grze zostały przetworzone za pomocą specjalnie przygotowanego pipeline’u, opartego nie tylko na modelach generatywnych, ale też na autorskich rozwiązaniach zapewniających ciekawy i realistyczny wygląd miejsc.

Cała platforma – od pomysłu, przez logikę rozgrywki, aż po stronę wizualną – została w całości zaprojektowana i zbudowana przez członków koła. **GeoRemix** to połączenie pasji do technologii, sztucznej inteligencji i dobrej zabawy!

---

[ENG] 

# Setup Instructions

This project consists of a Vite React-TypeScript frontend and a Python Flask backend. You can run it using Docker with nginx or locally without Docker.

## Table of Contents

- [Running with Docker (Recommended)](#running-with-docker-recommended)
- [Running Locally without Docker](#running-locally-without-docker)

---

## Running with Docker (Recommended)

Docker Compose orchestrates both frontend (with nginx) and backend services.

### Prerequisites

- Docker and Docker Compose installed
- Port 80 (frontend) and 5000 (backend) available

### Setup

1. **Create a `.env` file in the project root directory** with the following environment variables:

   ```env
   # Backend Configuration
   API_SECRET_KEY=your-secret-key-here
   API_PORT=5000
   API_HOST=http://localhost
   DATABASE_URL=sqlite:///scores.db
   CLIENT_ORIGIN=http://localhost
   FLASK_ENV=production
   SKIP_API_KEY_CHECK=false
   
   # Frontend Configuration
   VITE_API_SECRET_KEY=your-secret-key-here
   VITE_API_URL=http://localhost/api
   ```

   **Important Notes:**
   - `API_SECRET_KEY` and `VITE_API_SECRET_KEY` should match
   - `CLIENT_ORIGIN` should match where the frontend will be accessed from
   - `VITE_API_URL` uses `/api` prefix as nginx proxies to backend
   - Set `SKIP_API_KEY_CHECK=true` for development (skips API key validation)

2. **Build and start the containers:**

   ```bash
   docker-compose up --build
   ```

   Or run in detached mode:

   ```bash
   docker-compose up -d --build
   ```

3. **Access the application:**
   - **Frontend:** http://localhost (port 80)
   - **Backend API:** http://localhost:5000

### Managing Docker Containers

- **Stop containers:**
  ```bash
  docker-compose down
  ```

- **View logs:**
  ```bash
  docker-compose logs -f
  ```

- **Rebuild after changes:**
  ```bash
  docker-compose up --build
  ```

---

## Running Locally without Docker

Run the frontend and backend separately for development.

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a `.env` file in the `backend` directory:**

   ```env
   API_SECRET_KEY=your-secret-key-here
   API_PORT=5000
   API_HOST=http://localhost
   DATABASE_URL=sqlite:///scores.db
   CLIENT_ORIGIN=http://localhost:5173
   FLASK_ENV=development
   SKIP_API_KEY_CHECK=true
   ```

   **Notes:**
   - `CLIENT_ORIGIN=http://localhost:5173` matches Vite's default dev server port
   - `FLASK_ENV=development` enables debug mode
   - `SKIP_API_KEY_CHECK=true` disables API key validation for local development

3. **Create a Python virtual environment:**
   ```bash
   python -m venv .venv
   ```

4. **Activate the virtual environment:**
   - On Windows (PowerShell):
     ```powershell
     .venv\Scripts\Activate.ps1
     ```
   - On Windows (CMD):
     ```cmd
     .venv\Scripts\activate.bat
     ```
   - On Linux/Mac:
     ```bash
     source .venv/bin/activate
     ```

5. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

6. **Run the Flask app:**
   ```bash
   python app.py
   ```

   The backend will be available at **http://localhost:5000**

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Create a `.env` file in the `frontend` directory:**

   ```env
   VITE_API_SECRET_KEY=your-secret-key-here
   VITE_API_URL=http://localhost:5000
   ```

   **Notes:**
   - `VITE_API_SECRET_KEY` should match the backend's `API_SECRET_KEY`
   - `VITE_API_URL=http://localhost:5000` points directly to the Flask backend

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

   The frontend will be available at **http://localhost:5173** (default Vite port)