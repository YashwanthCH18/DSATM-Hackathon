from flask import Blueprint, jsonify, request, session, redirect, url_for, render_template, current_app
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from models.models import db, User
import re
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Create blueprint
auth_bp = Blueprint('auth', __name__, url_prefix='/api')

# Email configuration
EMAIL_ADDRESS = "ruralchaatra@gmail.com"
EMAIL_PASSWORD = "gwzb kkjq xweu xyjq"  # App password for Gmail

# Store OTPs in memory (in production, use Redis or a database)
otp_store = {}

# Helper function to validate email
def is_valid_email(email):
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(email_regex, email) is not None

# Helper function to validate mobile number
def is_valid_mobile(mobile):
    mobile_regex = r'^[0-9]{10}$'
    return re.match(mobile_regex, mobile) is not None

# Helper function to send email
def send_email(to_email, subject, body):
    msg = MIMEMultipart()
    msg['From'] = EMAIL_ADDRESS
    msg['To'] = to_email
    msg['Subject'] = subject
    
    msg.attach(MIMEText(body, 'html'))
    
    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        text = msg.as_string()
        server.sendmail(EMAIL_ADDRESS, to_email, text)
        server.quit()
        return True
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return False

@auth_bp.route('/send-otp', methods=['POST'])
def send_otp():
    """Send OTP for email verification"""
    data = request.json
    
    if not data or not 'email' in data:
        return jsonify({
            'success': False,
            'message': 'Email is required'
        }), 400
    
    email = data['email']
    
    # Validate email
    if not is_valid_email(email):
        return jsonify({
            'success': False,
            'message': 'Invalid email format'
        }), 400
    
    # Generate 6-digit OTP
    otp = ''.join([str(random.randint(0, 9)) for _ in range(6)])
    
    # Store OTP (in production, use Redis with expiry)
    otp_store[email] = otp
    
    # Prepare email content
    subject = "Rural Student Career Guidance - Email Verification"
    body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
            <h2 style="color: #457B9D; text-align: center;">Email Verification</h2>
            <p>Thank you for registering with Rural Student Career Guidance. Please use the following OTP to verify your email address:</p>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
                {otp}
            </div>
            <p style="margin-top: 20px;">This OTP is valid for 10 minutes. If you did not request this verification, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="text-align: center; font-size: 12px; color: #777;">
                This is an automated message, please do not reply to this email.
            </p>
        </div>
    </body>
    </html>
    """
    
    # Send email
    email_sent = send_email(email, subject, body)
    
    if not email_sent:
        return jsonify({
            'success': False,
            'message': 'Failed to send OTP email. Please try again.'
        }), 500
    
    return jsonify({
        'success': True,
        'message': 'OTP sent successfully'
    })

@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    """Verify OTP for email verification"""
    data = request.json
    
    if not data or not 'email' in data or not 'otp' in data:
        return jsonify({
            'success': False,
            'message': 'Email and OTP are required'
        }), 400
    
    email = data['email']
    otp = data['otp']
    
    # Check if OTP exists for the email
    if email not in otp_store:
        return jsonify({
            'success': False,
            'message': 'OTP expired or not sent. Please request a new OTP.'
        }), 400
    
    # Verify OTP
    if otp_store[email] != otp:
        return jsonify({
            'success': False,
            'message': 'Invalid OTP. Please try again.'
        }), 400
    
    # OTP verified, remove it from store
    del otp_store[email]
    
    return jsonify({
        'success': True,
        'message': 'Email verified successfully'
    })

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.json
    
    # Check if required data is provided
    required_fields = ['name', 'email', 'password', 'qualification']
    if not data or not all(field in data for field in required_fields):
        return jsonify({
            'success': False,
            'message': 'Missing required fields'
        }), 400
    
    # Check if email was verified with OTP (frontend will handle preventing submission
    # but this is a secondary check)
    email = data['email']
    
    # Validate email format
    if not is_valid_email(data['email']):
        return jsonify({
            'success': False,
            'message': 'Invalid email format'
        }), 400
    
    # Validate password length
    if len(data['password']) < 8:
        return jsonify({
            'success': False,
            'message': 'Password must be at least 8 characters'
        }), 400
    
    # Validate mobile if provided
    if 'mobile' in data and data['mobile'] and not is_valid_mobile(data['mobile']):
        return jsonify({
            'success': False,
            'message': 'Invalid mobile number'
        }), 400
    
    # Check if user already exists
    existing_user = User.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({
            'success': False,
            'message': 'Email already registered'
        }), 400
    
    # Generate a username from name/email if not provided
    username = data.get('username', data['name'].replace(' ', '_').lower() or data['email'].split('@')[0])
    
    # Check if username already exists
    if User.query.filter_by(username=username).first():
        # Create a unique username by adding a timestamp
        from datetime import datetime
        timestamp = int(datetime.utcnow().timestamp())
        username = f"{username}_{timestamp}"
    
    # Create new user with hashed password
    hashed_password = generate_password_hash(data['password'])
    new_user = User(
        username=username,
        email=data['email'],
        password=hashed_password,
        mobile=data.get('mobile', None),
        address=data.get('address', None),
        qualification=data['qualification']
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    # Log the user in
    login_user(new_user)
    
    return jsonify({
        'success': True,
        'message': 'User registered successfully',
        'data': new_user.to_dict()
    }), 201

@auth_bp.route('/login', methods=['GET'])
def login_page():
    """Render the login page"""
    # If already logged in, redirect to home
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    
    # Get the next parameter (where to redirect after login)
    next_url = request.args.get('next', '')
    
    # Redirect to the signup page with login form active
    return redirect(url_for('signup', _anchor='login', next=next_url))

@auth_bp.route('/login', methods=['POST'])
def login():
    """Log in a user"""
    data = request.json
    current_app.logger.info(f"Login attempt data: {data}")

    if not data:
        current_app.logger.warning("No JSON data received for login")
        return jsonify({'success': False, 'message': 'No login data provided'}), 400

    email = data.get('email')
    password = data.get('password')

    if not email:
        current_app.logger.warning("Missing email in login data")
        return jsonify({'success': False, 'message': 'Email is required'}), 400

    if not password:
        current_app.logger.warning("Missing password in login data")
        return jsonify({'success': False, 'message': 'Password is required'}), 400

    current_app.logger.info(f"Attempting login with email: {email}")
    
    user = User.query.filter_by(email=email).first()

    if not user:
        current_app.logger.warning(f"No user found with email: {email}. Attempting lookup by username as fallback.")
        user = User.query.filter_by(username=email).first() # Fallback to check if email was entered as username
        if not user:
            current_app.logger.warning(f"User not found by email or username: {email}")
            return jsonify({'success': False, 'message': 'Invalid email or password'}), 401

    if not check_password_hash(user.password, password):
        current_app.logger.warning(f"Password mismatch for user: {email}")
        return jsonify({'success': False, 'message': 'Invalid email or password'}), 401

    login_user(user)
    current_app.logger.info(f"User {user.username} (ID: {user.id}) logged in successfully")
    
    return jsonify({
        'success': True,
        'message': 'Login successful',
        'data': user.to_dict()
    })

@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    """Log out the current user"""
    logout_user()
    
    return jsonify({
        'success': True,
        'message': 'Logout successful'
    })

@auth_bp.route('/user', methods=['GET'])
@login_required
def get_user():
    """Get the current user's information"""
    return jsonify({
        'success': True,
        'data': current_user.to_dict()
    })

@auth_bp.route('/check-auth', methods=['GET'])
def check_auth():
    """Check if a user is authenticated"""
    if current_user.is_authenticated:
        return jsonify({
            'success': True,
            'authenticated': True,
            'data': current_user.to_dict()
        })
    else:
        return jsonify({
            'success': True,
            'authenticated': False
        }) 