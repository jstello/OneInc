"""
AI Writing Assistant - FastAPI Backend
Provides API endpoints for text rephrasing using LLM
"""
from dotenv import load_dotenv

load_dotenv(dotenv_path="../.env")

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import AsyncGenerator
import os
import json
from openai import AsyncOpenAI

app = FastAPI(title="AI Writing Assistant API")

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DeepSeek client (compatible with OpenAI API)
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
print(f"DEBUG: DEEPSEEK_API_KEY loaded: {DEEPSEEK_API_KEY is not None}")
if not DEEPSEEK_API_KEY:
    raise ValueError("DEEPSEEK_API_KEY environment variable not set. Please check your .env file.")

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
            
            # Create streaming completion with DeepSeek
            stream = await client.chat.completions.create(
                model="deepseek-chat",
                messages=[
                    {"role": "system", "content": style_prompt},
                    {"role": "user", "content": text}
                ],
                stream=True,
                temperature=0.7,
                max_tokens=200
            )
            
            # Stream the response
            async for chunk in stream:
                if chunk.choices[0].delta.content:
                    content = chunk.choices[0].delta.content
                    yield f"data: {json.dumps({'type': 'content', 'style': style_name, 'content': content})}\n\n"
            
            # Send style completion
            yield f"data: {json.dumps({'type': 'style_end', 'style': style_name})}\n\n"
        
        # Send final completion
        yield f"data: {json.dumps({'type': 'complete'})}\n\n"
        
    except Exception as e:
        error_message = str(e)
        yield f"data: {json.dumps({'type': 'error', 'message': error_message})}\n\n"


@app.post("/api/rephrase")
async def rephrase_text(request: RephraseRequest):
    """
    Rephrase text in multiple writing styles with streaming support.
    Returns Server-Sent Events (SSE) stream.
    """
    if not request.text or len(request.text.strip()) == 0:
        raise HTTPException(status_code=400, detail="Text input cannot be empty")
    
    if len(request.text) > 1000:
        raise HTTPException(status_code=400, detail="Text input too long (max 1000 characters)")
    
    return StreamingResponse(
        generate_rephrase_stream(request.text),
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
