from flask import Flask, render_template, redirect, url_for
from flask_cors import CORS
from flask_login import LoginManager, login_required, current_user
from config import Config
from models.models import db, User, Stream, Course, Career, Exam
import pymysql
import os
import secrets

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
login_manager.login_view = 'auth.login'

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
    return render_template('index.html')

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