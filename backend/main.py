"""
AI Writing Assistant - FastAPI Backend
Provides API endpoints for text rephrasing using LLM
"""
from dotenv import load_dotenv
import os

# Load environment variables from .env file if it exists
# In container environments, environment variables are typically set directly
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
if os.path.exists(env_path):
    load_dotenv(dotenv_path=env_path)

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import AsyncGenerator
import json
import re
import time
import asyncio
import logging
from collections import defaultdict
from openai import AsyncOpenAI

app = FastAPI(title="AI Writing Assistant API")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('backend.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Simple rate limiting storage
rate_limit_storage = defaultdict(list)
RATE_LIMIT_WINDOW = 60  # 1 minute window
RATE_LIMIT_MAX_REQUESTS = 10  # 10 requests per minute


def check_rate_limit(client_ip: str) -> bool:
    """Check if client has exceeded rate limit"""
    current_time = time.time()

    # Clean old requests outside the window
    rate_limit_storage[client_ip] = [
        req_time for req_time in rate_limit_storage[client_ip]
        if current_time - req_time < RATE_LIMIT_WINDOW
    ]

    # Check if limit exceeded
    if len(rate_limit_storage[client_ip]) >= RATE_LIMIT_MAX_REQUESTS:
        logger.warning(f"Rate limit exceeded for client: {client_ip}")
        return False

    # Add current request
    rate_limit_storage[client_ip].append(current_time)
    logger.info(f"Rate limit check passed for client: {client_ip}, requests: {len(rate_limit_storage[client_ip])}")
    return True

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Accept"],
)

# Initialize DeepSeek client (compatible with OpenAI API)
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
if not DEEPSEEK_API_KEY:
    raise ValueError("DEEPSEEK_API_KEY environment variable not set. Please check your .env file or container environment variables.")

client = AsyncOpenAI(
    api_key=DEEPSEEK_API_KEY,
    base_url="https://api.deepseek.com"
)

# Writing styles configuration
WRITING_STYLES = {
    "professional": "Rephrase the following text in a professional, formal business tone suitable for corporate communication.",
    "casual": "Rephrase the following text in a casual, friendly, and relaxed tone.",
    "polite": "Rephrase the following text in a very polite, courteous, and respectful tone.",
    "social-media": "Rephrase the following text in a fun, engaging social media style with energy and brevity."
}


def sanitize_text(text: str) -> str:
    """Remove potentially harmful content and normalize text"""
    if not text:
        return text

    # Remove excessive whitespace
    text = re.sub(r'\s+', ' ', text.strip())

    # Limit to safe characters (letters, numbers, punctuation, spaces)
    text = re.sub(r'[^\w\s.,!?;:()\-]', '', text)

    # Enforce length limit
    return text[:1000]


class RephraseRequest(BaseModel):
    text: str


class HealthResponse(BaseModel):
    status: str
    message: str


@app.get("/", response_model=HealthResponse)
async def root():
    """Health check endpoint"""
    return HealthResponse(status="ok", message="AI Writing Assistant API is running")


@app.get("/health", response_model=HealthResponse)
async def health():
    """Health check endpoint"""
    return HealthResponse(status="ok", message="Healthy")


async def generate_rephrase_stream(text: str) -> AsyncGenerator[str, None]:
    """
    Generate rephrased text for all writing styles with streaming support.
    Yields Server-Sent Events (SSE) formatted data.
    """
    try:
        for style_name, style_prompt in WRITING_STYLES.items():
            # Send style header
            yield f"data: {json.dumps({'type': 'style_start', 'style': style_name})}\n\n"

            try:
                # Create streaming completion with DeepSeek with timeout
                stream = await asyncio.wait_for(
                    client.chat.completions.create(
                        model="deepseek-chat",
                        messages=[
                            {"role": "system", "content": style_prompt},
                            {"role": "user", "content": text}
                        ],
                        stream=True,
                        temperature=0.7,
                        max_tokens=200
                    ),
                    timeout=30.0  # 30 second timeout per style
                )

                # Stream the response
                async for chunk in stream:
                    if chunk.choices[0].delta.content:
                        content = chunk.choices[0].delta.content
                        yield f"data: {json.dumps({'type': 'content', 'style': style_name, 'content': content})}\n\n"

                # Send style completion
                yield f"data: {json.dumps({'type': 'style_end', 'style': style_name})}\n\n"

            except asyncio.TimeoutError:
                logger.warning(f"Timeout processing writing style: {style_name}")
                yield f"data: {json.dumps({'type': 'error', 'style': style_name, 'message': 'Timeout processing this writing style'})}\n\n"
                continue

            except Exception as e:
                logger.error(f"Error processing writing style {style_name}: {str(e)}", exc_info=True)
                yield f"data: {json.dumps({'type': 'error', 'style': style_name, 'message': f'Error processing {style_name}'})}\n\n"
                continue

        # Send final completion
        yield f"data: {json.dumps({'type': 'complete'})}\n\n"

    except Exception as e:
        logger.error(f"Error in generate_rephrase_stream: {str(e)}", exc_info=True)
        yield f"data: {json.dumps({'type': 'error', 'message': 'An error occurred while processing your request'})}\n\n"


@app.post("/api/rephrase")
async def rephrase_text(rephrase_request: RephraseRequest, request: Request):
    """
    Rephrase text in multiple writing styles with streaming support.
    Returns Server-Sent Events (SSE) stream.
    """
    # Rate limiting check
    client_ip = request.client.host
    if not check_rate_limit(client_ip):
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded. Please try again in a minute."
        )

    if not rephrase_request.text or len(rephrase_request.text.strip()) == 0:
        logger.warning(f"Empty text input from client: {client_ip}")
        raise HTTPException(status_code=400, detail="Text input cannot be empty")

    # Sanitize input text
    sanitized_text = sanitize_text(rephrase_request.text)

    if len(sanitized_text) > 1000:
        logger.warning(f"Text input too long from client: {client_ip}, length: {len(sanitized_text)}")
        raise HTTPException(status_code=400, detail="Text input too long (max 1000 characters)")

    logger.info(f"Processing rephrase request from client: {client_ip}, text length: {len(sanitized_text)}")

    return StreamingResponse(
        generate_rephrase_stream(sanitized_text),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)