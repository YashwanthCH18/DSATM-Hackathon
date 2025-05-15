from flask import Blueprint, jsonify, request, session, redirect, url_for
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from models.models import db, User
import re

# Create blueprint
auth_bp = Blueprint('auth', __name__, url_prefix='/api')

# Helper function to validate email
def is_valid_email(email):
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(email_regex, email) is not None

# Helper function to validate mobile number
def is_valid_mobile(mobile):
    mobile_regex = r'^[0-9]{10}$'
    return re.match(mobile_regex, mobile) is not None

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.json
    
    if not data:
        return jsonify({"success": False, "message": "No data provided"}), 400
    
    # Extract data from request
    name = data.get('name')
    username = data.get('username', name)  # Use name as username if not provided
    email = data.get('email')
    password = data.get('password')
    mobile = data.get('mobile')
    address = data.get('address')
    qualification = data.get('qualification')
    
    # Validate required fields
    if not all([name, email, password, qualification]):
        return jsonify({
            "success": False, 
            "message": "Missing required fields: name, email, password, and qualification are required"
        }), 400
    
    # Validate email format
    if not is_valid_email(email):
        return jsonify({"success": False, "message": "Invalid email format"}), 400
    
    # Validate mobile format if provided
    if mobile and not is_valid_mobile(mobile):
        return jsonify({"success": False, "message": "Invalid mobile number format, must be 10 digits"}), 400
    
    # Check if user already exists
    existing_user = User.query.filter(
        (User.username == username) | (User.email == email)
    ).first()
    
    if existing_user:
        return jsonify({
            "success": False, 
            "message": "User with this username or email already exists"
        }), 400
    
    # Create new user with hashed password
    hashed_password = generate_password_hash(password)
    new_user = User(
        username=username,
        email=email,
        password=hashed_password,
        mobile=mobile,
        address=address,
        qualification=qualification
    )
    
    try:
        db.session.add(new_user)
        db.session.commit()
        
        # Login the new user automatically
        login_user(new_user)
        
        return jsonify({
            "success": True,
            "message": "User registered successfully",
            "data": new_user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": f"Registration failed: {str(e)}"
        }), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login a user"""
    data = request.json
    
    if not data:
        return jsonify({"success": False, "message": "No data provided"}), 400
    
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Email and password are required"
        }), 400
    
    # Find user by email
    user = User.query.filter_by(email=email).first()
    
    # Check if user exists and password matches
    if not user or not check_password_hash(user.password, password):
        return jsonify({
            "success": False,
            "message": "Invalid email or password"
        }), 401
    
    # Log in the user
    login_user(user)
    
    return jsonify({
        "success": True,
        "message": "Login successful",
        "data": user.to_dict()
    })

@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    """Logout a user"""
    logout_user()
    return jsonify({
        "success": True,
        "message": "Logged out successfully"
    })

@auth_bp.route('/check-auth', methods=['GET'])
def check_auth():
    """Check if user is authenticated"""
    if current_user.is_authenticated:
        return jsonify({
            "success": True,
            "authenticated": True,
            "data": current_user.to_dict()
        })
    else:
        return jsonify({
            "success": False,
            "authenticated": False,
            "message": "User not authenticated"
        }) 