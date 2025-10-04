"""
Security middleware for protecting API endpoints.
"""
import os
from functools import wraps
from flask import request, jsonify


def validate_api_key(f):
    """
    Decorator to validate API key for write operations.
    The API key must be provided in the X-API-Key header.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Skip API key validation in development mode
        if os.getenv("FLASK_ENV") == "development" and os.getenv("SKIP_API_KEY_CHECK") == "true":
            return f(*args, **kwargs)
        
        api_key = request.headers.get("X-API-Key")
        expected_api_key = os.getenv("API_SECRET_KEY")
        
        if not expected_api_key:
            # If no API key is configured, reject requests in production
            return jsonify({"error": "API security not configured"}), 500
        
        if not api_key:
            return jsonify({"error": "API key is required"}), 401
        
        if api_key != expected_api_key:
            return jsonify({"error": "Invalid API key"}), 403
        
        return f(*args, **kwargs)
    
    return decorated_function


def validate_origin(f):
    """
    Decorator to validate that requests come from allowed origins.
    Provides additional layer of security beyond CORS.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        allowed_origins = os.getenv("CLIENT_ORIGIN", "http://localhost:5173").split(",")
        origin = request.headers.get("Origin")
        # referer = request.headers.get("Referer")
        
        # In production, enforce origin checking
        if os.getenv("FLASK_ENV") != "development":
            if not origin:
            # if not origin and not referer:
                return jsonify({"error": "Origin verification failed"}), 403
            
            # Check if origin or referer starts with any allowed origin
            valid_origin = False
            if origin:
                valid_origin = any(origin.startswith(allowed.strip()) for allowed in allowed_origins)
            # elif referer:
            #     valid_origin = any(referer.startswith(allowed.strip()) for allowed in allowed_origins)
            
            if not valid_origin:
                return jsonify({"error": "Unauthorized origin"}), 403
        
        return f(*args, **kwargs)
    
    return decorated_function


def require_json(f):
    """
    Decorator to ensure request content type is JSON for POST/PUT requests.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if request.method in ["POST", "PUT", "PATCH"]:
            if not request.is_json:
                return jsonify({"error": "Content-Type must be application/json"}), 415
        return f(*args, **kwargs)
    
    return decorated_function
