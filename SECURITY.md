# Security Overview - AI Writing Assistant

This document outlines the security measures implemented in the AI Writing Assistant application.

## Security Architecture

### 1. API Key Security
- **Environment Variables**: API keys stored in `.env` file (excluded from git)
- **No Hardcoded Keys**: No API keys embedded in source code
- **Separate Keys**: Frontend and backend use separate API key variables

### 2. Input Security
- **Sanitization**: All user input is sanitized using regex patterns
- **Character Filtering**: Removes potentially harmful characters
- **Length Limits**: Text input limited to 1000 characters
- **Whitespace Normalization**: Removes excessive whitespace

### 3. Rate Limiting
- **Requests per Minute**: 10 requests per minute per IP address
- **Sliding Window**: 60-second window for request counting
- **Storage**: In-memory storage with automatic cleanup
- **Logging**: Rate limit violations are logged for monitoring

### 4. Timeout Handling
- **Per-Style Timeout**: 30-second timeout for each writing style processing
- **Async Timeouts**: Uses `asyncio.wait_for` for proper timeout management
- **Graceful Failure**: Individual style failures don't stop entire process

### 5. CORS Security
- **Restricted Origins**: Only allows `http://localhost:3000`
- **Limited Methods**: Only GET and POST methods allowed
- **Limited Headers**: Only Content-Type and Accept headers allowed
- **No Wildcards**: No `*` wildcards in CORS configuration

### 6. Error Handling
- **No Information Disclosure**: Error messages don't expose internal details
- **Structured Logging**: Comprehensive logging with timestamps and levels
- **File and Console**: Logs written to both file and console
- **Error Recovery**: Individual style errors don't crash the application

### 7. Streaming Security
- **Connection Cleanup**: Proper cleanup of abandoned streams
- **Memory Management**: Weak references for active connections
- **Resource Limits**: Timeout handling prevents resource exhaustion

## Security Testing

### Test Coverage
- Input sanitization verification
- Rate limiting functionality
- Error handling without information disclosure
- CORS configuration validation
- Timeout handling verification

### Running Security Tests
```bash
cd backend
pytest test_main.py -v
```

## Monitoring and Logging

### Log Files
- **Location**: `backend/backend.log`
- **Format**: Structured logging with timestamps
- **Levels**: INFO, WARNING, ERROR

### Key Log Events
- Rate limit violations
- Input validation failures
- API errors (without sensitive details)
- Processing timeouts
- Application startup/shutdown

## Production Considerations

### Environment Variables
- Use different API keys for development and production
- Set `ALLOWED_ORIGINS` environment variable for production domains
- Consider using a secrets management service

### Additional Security (Recommended for Production)
- HTTPS enforcement
- Security headers middleware
- Request ID tracking
- API key rotation
- IP whitelisting (if applicable)

## Security Best Practices

1. **Never commit `.env` files to git**
2. **Use strong, unique API keys**
3. **Monitor rate limiting logs**
4. **Regularly update dependencies**
5. **Review error logs for security issues**
6. **Test security features regularly**

## Incident Response

If you suspect a security issue:
1. Check the application logs
2. Review rate limiting violations
3. Rotate API keys if compromised
4. Update dependencies if vulnerabilities are found
5. Contact the development team