from flask import Flask, render_template
from flask_cors import CORS
from config import Config
from models.models import db, Stream, Course, Career, Exam
import pymysql
import os

app = Flask(__name__, 
            static_folder='../frontend/static', 
            template_folder='../frontend')
app.config.from_object(Config)
db.init_app(app)
CORS(app)

# Import routes
from routes.guidance import guidance_bp

# Register blueprints
app.register_blueprint(guidance_bp)

# Serve the frontend
@app.route('/')
@app.route('/career')
def career_guidance():
    return render_template('career.html')

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