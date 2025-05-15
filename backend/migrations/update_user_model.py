"""
Migration script to update User model by adding mobile and address fields.
Run this after updating the models.py file.
"""

import sys
import os
import traceback

# Add the parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app, db
from models.models import User

def migrate_user_table():
    """Add mobile and address columns to the users table if they don't exist"""
    try:
        with app.app_context():
            # Check if the database is MySQL or SQLite
            is_mysql = 'mysql' in app.config['SQLALCHEMY_DATABASE_URI']
            
            # Get database engine
            engine = db.engine
            
            # Check if mobile column exists in users table
            if is_mysql:
                result = engine.execute("SHOW COLUMNS FROM users LIKE 'mobile'")
                mobile_exists = result.rowcount > 0
                
                result = engine.execute("SHOW COLUMNS FROM users LIKE 'address'")
                address_exists = result.rowcount > 0
            else:
                # SQLite
                result = engine.execute("PRAGMA table_info(users)")
                columns = [row[1] for row in result]
                mobile_exists = 'mobile' in columns
                address_exists = 'address' in columns
                
            # Add columns if they don't exist
            if not mobile_exists:
                print("Adding 'mobile' column to users table...")
                if is_mysql:
                    engine.execute("ALTER TABLE users ADD COLUMN mobile VARCHAR(15)")
                else:
                    engine.execute("ALTER TABLE users ADD COLUMN mobile TEXT")
                    
            if not address_exists:
                print("Adding 'address' column to users table...")
                if is_mysql:
                    engine.execute("ALTER TABLE users ADD COLUMN address TEXT")
                else:
                    engine.execute("ALTER TABLE users ADD COLUMN address TEXT")
                    
            print("Migration completed successfully!")
            
    except Exception as e:
        print(f"Migration failed: {e}")
        traceback.print_exc()
        
if __name__ == "__main__":
    migrate_user_table() 