from app import app, db
from models.models import Stream, Course, Career, Exam, User
import datetime

# Sample user data
users_data = [
    {"username": "student10th", "email": "student10th@example.com", "password": "password", "qualification": "10th"},
    {"username": "student12th", "email": "student12th@example.com", "password": "password", "qualification": "12th"},
    {"username": "graduate", "email": "graduate@example.com", "password": "password", "qualification": "Graduate"}
]

# Sample data
streams_data = [
    {"name": "Science", "min_qualification": "10th", "description": "Scientific and mathematical disciplines that focus on understanding nature and the universe."},
    {"name": "Commerce", "min_qualification": "10th", "description": "Business-oriented disciplines focusing on economics, accounting, and trade."},
    {"name": "Arts", "min_qualification": "10th", "description": "Disciplines in humanities, social sciences, and creative fields."}
]

courses_data = [
    {"name": "B.Tech", "stream_id": 1, "min_qualification": "12th", "description": "Bachelor of Technology - engineering degree focusing on applying technical and scientific knowledge."},
    {"name": "MBBS", "stream_id": 1, "min_qualification": "12th", "description": "Bachelor of Medicine and Bachelor of Surgery - professional degree for physicians and surgeons."},
    {"name": "B.Sc", "stream_id": 1, "min_qualification": "12th", "description": "Bachelor of Science - undergraduate degree in various scientific disciplines."},
    {"name": "BBA", "stream_id": 2, "min_qualification": "12th", "description": "Bachelor of Business Administration - undergraduate degree in business management."},
    {"name": "B.Com", "stream_id": 2, "min_qualification": "12th", "description": "Bachelor of Commerce - undergraduate degree in commerce, accounting, and business."},
    {"name": "CA", "stream_id": 2, "min_qualification": "12th", "description": "Chartered Accountancy - professional accounting qualification."},
    {"name": "BA", "stream_id": 3, "min_qualification": "12th", "description": "Bachelor of Arts - undergraduate degree in humanities and social sciences."},
    {"name": "BFA", "stream_id": 3, "min_qualification": "12th", "description": "Bachelor of Fine Arts - undergraduate degree in visual arts, performing arts, or creative writing."},
    {"name": "B.Ed", "stream_id": 3, "min_qualification": "Graduate", "description": "Bachelor of Education - professional degree preparing students for careers in teaching."}
]

careers_data = [
    {"name": "Software Engineer", "course_id": 1, "min_qualification": "Graduate", "description": "Designs, develops, and maintains software systems and applications."},
    {"name": "Data Scientist", "course_id": 1, "min_qualification": "Graduate", "description": "Analyzes and interprets complex data to help organizations make better decisions."},
    {"name": "Doctor", "course_id": 2, "min_qualification": "Graduate", "description": "Medical professional who diagnoses and treats health conditions."},
    {"name": "Surgeon", "course_id": 2, "min_qualification": "Postgraduate", "description": "Medical doctor who performs operations and surgeries."},
    {"name": "Research Scientist", "course_id": 3, "min_qualification": "Graduate", "description": "Conducts scientific research to expand knowledge in a specific field."},
    {"name": "Lab Technician", "course_id": 3, "min_qualification": "Graduate", "description": "Performs laboratory tests and procedures."},
    {"name": "Business Analyst", "course_id": 4, "min_qualification": "Graduate", "description": "Analyzes business processes and recommends improvements."},
    {"name": "Entrepreneur", "course_id": 4, "min_qualification": "12th", "description": "Starts and runs their own business ventures."},
    {"name": "Accountant", "course_id": 5, "min_qualification": "Graduate", "description": "Prepares and examines financial records for accuracy and compliance."},
    {"name": "Financial Analyst", "course_id": 5, "min_qualification": "Graduate", "description": "Evaluates financial data to help businesses make investment decisions."},
    {"name": "Chartered Accountant", "course_id": 6, "min_qualification": "Graduate", "description": "Professional accountant qualified to audit financial statements and provide financial advice."},
    {"name": "Journalist", "course_id": 7, "min_qualification": "Graduate", "description": "Investigates, reports, and writes news stories for various media."},
    {"name": "Translator", "course_id": 7, "min_qualification": "Graduate", "description": "Converts written or spoken content from one language to another."},
    {"name": "Artist", "course_id": 8, "min_qualification": "12th", "description": "Creates visual art, such as paintings, sculptures, or illustrations."},
    {"name": "Graphic Designer", "course_id": 8, "min_qualification": "Graduate", "description": "Creates visual content for various media including print and digital platforms."},
    {"name": "Teacher", "course_id": 9, "min_qualification": "Graduate", "description": "Educates students in various subjects and grade levels."},
    {"name": "Education Consultant", "course_id": 9, "min_qualification": "Postgraduate", "description": "Advises students on educational choices and career paths."}
]

exams_data = [
    {"name": "JEE Main", "career_id": 1, "min_qualification": "12th", "description": "National level engineering entrance exam for admission to NITs, IIITs and other institutions."},
    {"name": "JEE Advanced", "career_id": 1, "min_qualification": "12th", "description": "Entrance exam for admission to the Indian Institutes of Technology (IITs)."},
    {"name": "GATE", "career_id": 1, "min_qualification": "Graduate", "description": "Graduate Aptitude Test in Engineering for admission to postgraduate programs in engineering."},
    {"name": "NEET", "career_id": 3, "min_qualification": "12th", "description": "National Eligibility cum Entrance Test for admission to medical colleges."},
    {"name": "AIIMS", "career_id": 3, "min_qualification": "12th", "description": "All India Institute of Medical Sciences entrance exam for medical programs."},
    {"name": "CSIR-NET", "career_id": 5, "min_qualification": "Graduate", "description": "Joint CSIR-UGC National Eligibility Test for research fellowships and academic positions."},
    {"name": "GRE", "career_id": 5, "min_qualification": "Graduate", "description": "Graduate Record Examination for admission to graduate programs abroad."},
    {"name": "CAT", "career_id": 7, "min_qualification": "Graduate", "description": "Common Admission Test for admission to MBA programs in India."},
    {"name": "MAT", "career_id": 7, "min_qualification": "Graduate", "description": "Management Aptitude Test for admission to MBA and PGDM programs."},
    {"name": "CA Foundation", "career_id": 11, "min_qualification": "12th", "description": "Entry-level exam for the Chartered Accountancy course."},
    {"name": "CA Intermediate", "career_id": 11, "min_qualification": "12th", "description": "Second level of the Chartered Accountancy course after completing CA Foundation."},
    {"name": "UGC NET", "career_id": 16, "min_qualification": "Graduate", "description": "National Eligibility Test for determining eligibility for teaching positions and JRF."},
    {"name": "CTET", "career_id": 16, "min_qualification": "Graduate", "description": "Central Teacher Eligibility Test for teaching positions in central government schools."}
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
            db.session.query(User).delete()
            
            # Re-enable foreign key checks if MySQL
            if 'mysql' in app.config['SQLALCHEMY_DATABASE_URI']:
                db.session.execute("SET FOREIGN_KEY_CHECKS=1")
                
            db.session.commit()
        except Exception as e:
            print(f"Error clearing tables: {e}")
            db.session.rollback()
            pass  # Tables might not exist yet
        
        # Add users
        users = []
        for user_data in users_data:
            user = User(**user_data)
            db.session.add(user)
            users.append(user)
            
        # Commit to generate IDs for users
        db.session.commit()
        
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
        
        # Print sample login credentials
        print("\nSample Login Credentials:")
        print("10th Student: username=student10th, password=password")
        print("12th Student: username=student12th, password=password")
        print("Graduate: username=graduate, password=password")

if __name__ == "__main__":
    seed_db() 