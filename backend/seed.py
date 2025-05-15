from app import app, db
from models.models import Stream, Course, Career, Exam

# Sample data
streams_data = [
    {"name": "Science"},
    {"name": "Commerce"},
    {"name": "Arts"}
]

courses_data = [
    {"name": "B.Tech", "stream_id": 1},
    {"name": "MBBS", "stream_id": 1},
    {"name": "B.Sc", "stream_id": 1},
    {"name": "BBA", "stream_id": 2},
    {"name": "B.Com", "stream_id": 2},
    {"name": "CA", "stream_id": 2},
    {"name": "BA", "stream_id": 3},
    {"name": "BFA", "stream_id": 3},
    {"name": "B.Ed", "stream_id": 3}
]

careers_data = [
    {"name": "Software Engineer", "course_id": 1},
    {"name": "Data Scientist", "course_id": 1},
    {"name": "Doctor", "course_id": 2},
    {"name": "Surgeon", "course_id": 2},
    {"name": "Research Scientist", "course_id": 3},
    {"name": "Lab Technician", "course_id": 3},
    {"name": "Business Analyst", "course_id": 4},
    {"name": "Entrepreneur", "course_id": 4},
    {"name": "Accountant", "course_id": 5},
    {"name": "Financial Analyst", "course_id": 5},
    {"name": "Chartered Accountant", "course_id": 6},
    {"name": "Journalist", "course_id": 7},
    {"name": "Translator", "course_id": 7},
    {"name": "Artist", "course_id": 8},
    {"name": "Graphic Designer", "course_id": 8},
    {"name": "Teacher", "course_id": 9},
    {"name": "Education Consultant", "course_id": 9}
]

exams_data = [
    {"name": "JEE Main", "career_id": 1},
    {"name": "JEE Advanced", "career_id": 1},
    {"name": "GATE", "career_id": 1},
    {"name": "NEET", "career_id": 3},
    {"name": "AIIMS", "career_id": 3},
    {"name": "CSIR-NET", "career_id": 5},
    {"name": "GRE", "career_id": 5},
    {"name": "CAT", "career_id": 7},
    {"name": "MAT", "career_id": 7},
    {"name": "CA Foundation", "career_id": 11},
    {"name": "CA Intermediate", "career_id": 11},
    {"name": "UGC NET", "career_id": 16},
    {"name": "CTET", "career_id": 16}
]

def seed_db():
    """Seed the database with initial data"""
    with app.app_context():
        # Check if database is MySQL and try to create it if it doesn't exist
        if 'mysql' in app.config['SQLALCHEMY_DATABASE_URI']:
            try:
                from sqlalchemy_utils import database_exists, create_database
                if not database_exists(app.config['SQLALCHEMY_DATABASE_URI']):
                    create_database(app.config['SQLALCHEMY_DATABASE_URI'])
                print("Using MySQL database")
            except Exception as e:
                print(f"Warning: MySQL connection issue: {e}")
                
        # Create all tables
        db.create_all()
        
        # Clear existing data if tables exist
        try:
            # If MySQL, disable foreign key checks temporarily
            if 'mysql' in app.config['SQLALCHEMY_DATABASE_URI']:
                db.session.execute("SET FOREIGN_KEY_CHECKS=0")
                
            db.session.query(Exam).delete()
            db.session.query(Career).delete()
            db.session.query(Course).delete()
            db.session.query(Stream).delete()
            
            # Re-enable foreign key checks if MySQL
            if 'mysql' in app.config['SQLALCHEMY_DATABASE_URI']:
                db.session.execute("SET FOREIGN_KEY_CHECKS=1")
                
            db.session.commit()
        except Exception as e:
            print(f"Error clearing tables: {e}")
            db.session.rollback()
            pass  # Tables might not exist yet
        
        # Add streams
        streams = []
        for stream_data in streams_data:
            stream = Stream(**stream_data)
            db.session.add(stream)
            streams.append(stream)
        
        # Commit to generate IDs for streams
        db.session.commit()
        
        # Add courses
        courses = []
        for course_data in courses_data:
            course = Course(**course_data)
            db.session.add(course)
            courses.append(course)
        
        # Commit to generate IDs for courses
        db.session.commit()
        
        # Add careers
        careers = []
        for career_data in careers_data:
            career = Career(**career_data)
            db.session.add(career)
            careers.append(career)
        
        # Commit to generate IDs for careers
        db.session.commit()
        
        # Add exams
        for exam_data in exams_data:
            exam = Exam(**exam_data)
            db.session.add(exam)
        
        # Commit all changes
        db.session.commit()
        
        print("Database seeded successfully!")
        print(f"Using database: {app.config['SQLALCHEMY_DATABASE_URI']}")

if __name__ == "__main__":
    seed_db() 