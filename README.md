# nvidia-geo-guessing

This project consists of a Vite React-TypeScript frontend and a Python Flask backend.

## Frontend

The frontend is located in the `frontend` directory.

### Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the development server:
   ```
   npm run dev
   ```

The frontend will be available at `http://localhost:5173` (default Vite port).

## Backend

The backend is located in the `backend` directory.

### Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a Python virtual environment:
   ```
   python -m venv .venv
   ```

3. Activate the virtual environment:
   - On Windows:
     ```
     .venv\Scripts\Activate.ps1
     ```
   - On Linux/Mac:
     ```
     source .venv/bin/activate
     ```

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Run the Flask app:
   ```
   python app.py
   ```

The backend will be available at `http://localhost:5000` (default Flask port).
