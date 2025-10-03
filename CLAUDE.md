# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI Writing Assistant application that rephrases user input into different writing styles using DeepSeek's LLM API. The project consists of a Next.js frontend and a FastAPI Python backend.

## Architecture

### Frontend (Next.js)
- **Framework**: Next.js 14.1.0 with TypeScript
- **UI Components**: Custom UI components built with Radix UI primitives and Tailwind CSS
- **Key Files**:
  - `frontend/app/page.tsx` - Main application component with text processing logic
  - `frontend/components/ui/` - Reusable UI components (Button, Textarea, Card)
  - `frontend/lib/utils.ts` - Utility functions (cn for className merging)
- **Styling**: Tailwind CSS with custom color system and dark mode support

### Backend (FastAPI)
- **Framework**: FastAPI with Python 3.13
- **API**: RESTful API with Server-Sent Events (SSE) for streaming responses
- **Key Files**:
  - `backend/main.py` - Main FastAPI application with rephrasing logic and security features
  - `backend/test_main.py` - Comprehensive test suite including security tests
- **LLM Integration**: DeepSeek API via OpenAI-compatible client
- **Security Features**: Input sanitization, rate limiting, timeout handling, secure error handling

### Configuration
- **Environment**: Root `.env` file with DeepSeek API keys for both frontend and backend
- **Dependency Management**: `uv` for Python packages, npm for Node.js

## Development Commands

### Frontend Development
```bash
cd frontend
npm run dev          # Start development server (localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Backend Development
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload  # Start development server
pytest test_main.py -v                               # Run backend tests
```

### Running Both Services
1. Start backend: `cd backend && uvicorn main:app --host 0.0.0.0 --port 8000 --reload`
2. Start frontend: `cd frontend && npm run dev`

## Key Features

### Text Rephrasing
- **Writing Styles**: Professional, Casual, Polite, Social Media
- **Streaming**: Real-time word-by-word output display
- **Validation**: Input length (max 1000 chars) and empty text checks

### API Endpoints
- `GET /` and `GET /health` - Health checks
- `POST /api/rephrase` - Text rephrasing with SSE streaming

### UI Components
- **Button**: Custom styled button with variants
- **Textarea**: Enhanced text input with styling
- **Card**: Container component for output display

## Testing

### Backend Tests
- Health endpoint tests
- Input validation and sanitization tests
- Stream generation tests
- Error handling and security tests
- Rate limiting tests
- Timeout handling tests

Run tests with: `cd backend && pytest test_main.py -v`

### Security Testing
The test suite includes comprehensive security testing:
- Input sanitization verification
- Rate limiting functionality
- Error handling without information disclosure
- CORS configuration validation

## Environment Setup

1. **API Keys**: Set `DEEPSEEK_API_KEY` and `NEXT_PUBLIC_DEEPSEEK_API_KEY` in root `.env`
2. **Python**: Requires Python 3.13 (specified in requirements.txt)
3. **Node.js**: LTS version recommended

## Important Notes

- **CORS**: Backend configured with secure CORS settings to allow requests from `http://localhost:3000` only
- **Streaming**: Uses Server-Sent Events for real-time response display
- **Error Handling**: Comprehensive error handling that prevents information disclosure
- **Security**: Production-grade security features including input sanitization, rate limiting, and timeout handling
- **UI/UX**: Production-grade enterprise application design with dark mode support
- **API Key Security**: Environment variables properly managed with `.env` file excluded from git
- **Rate Limiting**: 10 requests per minute per IP to prevent abuse
- **Logging**: Comprehensive logging for security monitoring and debugging