from functools import wraps
from flask import request, jsonify, redirect, url_for
from flask_login import current_user

def login_required_api(f):
    """
    Decorator for API routes that require authentication.
    Returns JSON error if not authenticated.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            return jsonify({
                'success': False, 
                'message': 'Authentication required',
                'authenticated': False
            }), 401
        return f(*args, **kwargs)
    return decorated_function

def login_required_page(f):
    """
    Decorator for page routes that require authentication.
    Redirects to login page if not authenticated.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            return redirect(url_for('signup'))
        return f(*args, **kwargs)
    return decorated_function 