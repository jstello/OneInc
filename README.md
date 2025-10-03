# AI Writing Assistant

This project implements an AI Writing Assistant, a single-page application (SPA) that uses a Large Language Model (LLM) to rephrase user input into different writing styles. It consists of a Next.js frontend and a FastAPI Python backend.

## Project Structure

- `frontend/`: Next.js application
- `backend/`: FastAPI Python application

## Setup Instructions

### Prerequisites

- Node.js (LTS version recommended)
- Python 3.13 (or compatible version, see `backend/requirements.txt`)
- `uv` (Python package installer and resolver)

### 1. Clone the repository

```bash
git clone <repository_url>
cd OneInc
```

### 2. Frontend Setup (Next.js)

Navigate to the `frontend` directory and install dependencies:

```bash
cd frontend
npm install # or yarn install or pnpm install
```

### 3. Backend Setup (FastAPI)

Navigate to the `backend` directory, create a virtual environment, and install dependencies using `uv`:

```bash
cd backend
uv venv
uv pip install -r requirements.txt
```

### 4. Environment Variables

Create a `.env` file in the **root directory** of the project (i.e., `/Users/juan_tello/repos/OneInc/.env`) with the following content:

```
NEXT_PUBLIC_DEEPSEEK_API_KEY=your_deepseek_api_key_here
NEXT_PUBLIC_DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
```

**Important:** Replace `your_deepseek_api_key_here` with your actual DeepSeek API key.
Note that `NEXT_PUBLIC_` variables are for the frontend, and non-prefixed variables are for the backend.

## Running the Applications

### 1. Start the Backend Server

Navigate to the `backend` directory and run the FastAPI application:

```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
The backend will be accessible at `http://localhost:8000`.

### 2. Start the Frontend Server

Navigate to the `frontend` directory and run the Next.js application:

```bash
cd frontend
npm run dev
```
The frontend will be accessible at `http://localhost:3000`.

## Security Features

- **API Key Security:** Environment variables are properly managed with `.env` file excluded from git
- **Input Sanitization:** All user input is sanitized to prevent injection attacks
- **Rate Limiting:** 10 requests per minute per IP address to prevent abuse
- **Timeout Handling:** 30-second timeout per writing style processing
- **CORS Security:** Restricted CORS configuration with specific origins and methods
- **Error Handling:** Secure error messages that prevent information disclosure
- **Logging:** Comprehensive logging for security monitoring and debugging

## Important Notes

- **Python Version:** This project was developed and tested with Python 3.13. Dependency conflicts may arise with other Python versions.
- **Dependency Management:** `uv` is used for backend dependency management.
- **API Key Security:** Ensure your DeepSeek API key is correctly set in the `.env` file and never commit it to git.
- **CORS:** The backend is configured with secure CORS settings to allow requests from `http://localhost:3000` only.
- **Security Testing:** Run `pytest test_main.py -v` to verify all security features are working correctly.