import os
from dotenv import load_dotenv

# Load variables from the .env file
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path)

class Config:
    # Use MySQL if available, otherwise fallback to SQLite
    # You can set DATABASE_URI in .env file to your MySQL connection string
    # Example: mysql+pymysql://username:password@localhost/career_guidance
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URI', 'sqlite:///guidance.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev_key_for_development')
