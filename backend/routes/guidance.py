from flask import Blueprint, jsonify, request
from models.models import db, Stream, Course, Career, Exam

# Create blueprint
guidance_bp = Blueprint('guidance', __name__, url_prefix='/api')

@guidance_bp.route('/streams', methods=['GET'])
def get_streams():
    """Get all streams"""
    streams = Stream.query.all()
    return jsonify({
        'success': True,
        'data': [stream.to_dict() for stream in streams]
    })

@guidance_bp.route('/courses/<int:stream_id>', methods=['GET'])
def get_courses(stream_id):
    """Get courses for a specific stream"""
    courses = Course.query.filter_by(stream_id=stream_id).all()
    return jsonify({
        'success': True,
        'data': [course.to_dict() for course in courses]
    })

@guidance_bp.route('/careers/<int:course_id>', methods=['GET'])
def get_careers(course_id):
    """Get careers for a specific course"""
    careers = Career.query.filter_by(course_id=course_id).all()
    return jsonify({
        'success': True,
        'data': [career.to_dict() for career in careers]
    })

@guidance_bp.route('/exams/<int:career_id>', methods=['GET'])
def get_exams(career_id):
    """Get exams for a specific career"""
    exams = Exam.query.filter_by(career_id=career_id).all()
    return jsonify({
        'success': True,
        'data': [exam.to_dict() for exam in exams]
    }) 