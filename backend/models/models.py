from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin

db = SQLAlchemy()

class User(db.Model, UserMixin):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(100), nullable=False, unique=True)
    email = db.Column(db.String(100), nullable=False, unique=True)
    password = db.Column(db.String(100), nullable=False)
    mobile = db.Column(db.String(15), nullable=True)
    address = db.Column(db.Text, nullable=True)
    qualification = db.Column(db.String(50), nullable=False)  # e.g., "10th", "12th", "Graduate"
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'mobile': self.mobile,
            'address': self.address,
            'qualification': self.qualification,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Stream(db.Model):
    __tablename__ = 'streams'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    min_qualification = db.Column(db.String(50), nullable=False, default="10th")  # Minimum qualification required
    description = db.Column(db.Text, nullable=True)
    courses = db.relationship('Course', backref='stream', lazy=True, cascade="all, delete-orphan")
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'min_qualification': self.min_qualification,
            'description': self.description
        }

class Course(db.Model):
    __tablename__ = 'courses'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    stream_id = db.Column(db.Integer, db.ForeignKey('streams.id', ondelete='CASCADE'), nullable=False)
    min_qualification = db.Column(db.String(50), nullable=False, default="12th")  # Minimum qualification required
    description = db.Column(db.Text, nullable=True)
    careers = db.relationship('Career', backref='course', lazy=True, cascade="all, delete-orphan")
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'stream_id': self.stream_id,
            'min_qualification': self.min_qualification,
            'description': self.description
        }

class Career(db.Model):
    __tablename__ = 'careers'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id', ondelete='CASCADE'), nullable=False)
    min_qualification = db.Column(db.String(50), nullable=False, default="Graduate")  # Minimum qualification required
    description = db.Column(db.Text, nullable=True)
    exams = db.relationship('Exam', backref='career', lazy=True, cascade="all, delete-orphan")
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'course_id': self.course_id,
            'min_qualification': self.min_qualification,
            'description': self.description
        }

class Exam(db.Model):
    __tablename__ = 'exams'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    career_id = db.Column(db.Integer, db.ForeignKey('careers.id', ondelete='CASCADE'), nullable=False)
    min_qualification = db.Column(db.String(50), nullable=False, default="12th")  # Minimum qualification required
    description = db.Column(db.Text, nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'career_id': self.career_id,
            'min_qualification': self.min_qualification,
            'description': self.description
        }

# Helper function to determine if a qualification meets minimum requirements
def meets_qualification(user_qualification, min_qualification):
    qualification_ranks = {
        "10th": 1,
        "12th": 2,
        "Diploma": 2,
        "Graduate": 3,
        "Postgraduate": 4,
        "PhD": 5
    }
    
    user_rank = qualification_ranks.get(user_qualification, 0)
    min_rank = qualification_ranks.get(min_qualification, 0)
    
    return user_rank >= min_rank 