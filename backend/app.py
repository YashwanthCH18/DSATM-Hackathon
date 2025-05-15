from flask import Flask, render_template, redirect, url_for, request, jsonify, current_app
from flask_cors import CORS
from flask_login import LoginManager, login_required, current_user
from config import Config
from models.models import db, User, Stream, Course, Career, Exam
import pymysql
import os
import secrets
import requests
from werkzeug.utils import secure_filename

# Initialize Flask app with proper folder structure
app = Flask(__name__, 
            static_folder='../frontend/static', 
            template_folder='../frontend')
app.config.from_object(Config)

# Generate a random secret key if not set
if not app.config.get('SECRET_KEY'):
    app.config['SECRET_KEY'] = secrets.token_hex(16)

# Initialize extensions
db.init_app(app)
CORS(app, supports_credentials=True)

# Setup Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'auth.login_page'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Import routes
from routes.guidance import guidance_bp
from routes.auth import auth_bp  # Contains OTP email verification routes

# Register blueprints
app.register_blueprint(guidance_bp)
app.register_blueprint(auth_bp)

# Serve the frontend
@app.route('/')
def index():
    return render_template('index.html', current_user=current_user)

@app.route('/career')
@login_required
def career_guidance():
    return render_template('career.html')

@app.route('/signup')
def signup():
    # Redirect to home if already logged in
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    return render_template('signup.html')

@app.route('/elearn')
@login_required
def elearn():
    # For now, this will expect an elearn.html in the template_folder
    # The user will provide this file.
    return render_template('elearn.html')

# Sarvam AI API proxy routes
@app.route('/process_speech', methods=['POST'])
def process_speech():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file:
        sarvam_api_key = current_app.config.get('SARVAM_API_KEY')
        if not sarvam_api_key:
            current_app.logger.error("Sarvam API key not configured.")
            return jsonify({"error": "Server configuration error"}), 500

        headers = {
            "api-subscription-key": sarvam_api_key,
            # Content-Type is set by requests when using files
        }
        files = {
            'file': (secure_filename(file.filename), file.stream, file.content_type)
        }
        
        sarvam_url = "https://api.sarvam.ai/speech-to-text-translate"
        
        try:
            current_app.logger.info(f"Sending request to Sarvam AI STT API: {sarvam_url}")
            response = requests.post(sarvam_url, headers=headers, files=files)
            response.raise_for_status() # Raises an HTTPError for bad responses (4XX or 5XX)
            current_app.logger.info(f"Sarvam AI STT API Response Status: {response.status_code}")
            current_app.logger.debug(f"Sarvam AI STT API Response Body: {response.text}")
            return jsonify(response.json()), response.status_code
        except requests.exceptions.HTTPError as http_err:
            current_app.logger.error(f"HTTP error occurred with Sarvam STT API: {http_err} - {response.text}")
            return jsonify({"error": "Failed to process speech with Sarvam AI", "details": response.text}), response.status_code
        except requests.exceptions.RequestException as e:
            current_app.logger.error(f"Error calling Sarvam STT API: {e}")
            return jsonify({"error": "Failed to connect to speech processing service"}), 503
        except Exception as e:
            current_app.logger.error(f"An unexpected error occurred: {e}")
            return jsonify({"error": "An internal server error occurred"}), 500

@app.route('/text_to_speech', methods=['POST'])
def text_to_speech():
    # Placeholder for Sarvam AI Text-to-Speech API
    # User needs to provide documentation for this API
    current_app.logger.info("Received request for /text_to_speech (placeholder)")
    data = request.get_json()
    current_app.logger.info(f"TTS Request data: {data}")
    
    # Mock response - replace with actual API call when docs are available
    mock_audio_data = "UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAAABkYXRhAAAAAA==" # Short silent WAV
    return jsonify({
        "audios": [mock_audio_data],
        "message": "TTS processing is currently a placeholder."
    }), 200

if __name__ == '__main__':
    with app.app_context():
        # Check if using MySQL and if so, attempt to create the database
        if 'mysql' in app.config['SQLALCHEMY_DATABASE_URI']:
            try:
                from sqlalchemy_utils import database_exists, create_database
                if not database_exists(app.config['SQLALCHEMY_DATABASE_URI']):
                    create_database(app.config['SQLALCHEMY_DATABASE_URI'])
                print("Using MySQL database")
            except Exception as e:
                print(f"Warning: MySQL connection failed, consider using SQLite instead: {e}")
                
        # Create tables
        db.create_all()
        print(f"Using database: {app.config['SQLALCHEMY_DATABASE_URI']}")
    app.run(debug=True)