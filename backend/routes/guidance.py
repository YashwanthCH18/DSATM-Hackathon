from flask import Blueprint, jsonify, request
from models.models import db, Stream, Course, Career, Exam, User, meets_qualification

# Create blueprint
guidance_bp = Blueprint('guidance', __name__, url_prefix='/api')

@guidance_bp.route('/streams', methods=['GET'])
def get_streams():
    """Get all streams or filter by qualification"""
    qualification = request.args.get('qualification', '10th')  # Default to 10th if not provided
    
    # Filter streams based on qualification
    streams = Stream.query.all()
    filtered_streams = [
        stream for stream in streams 
        if meets_qualification(qualification, stream.min_qualification)
    ]
    
    return jsonify({
        'success': True,
        'data': [stream.to_dict() for stream in filtered_streams]
    })

@guidance_bp.route('/courses/<int:stream_id>', methods=['GET'])
def get_courses(stream_id):
    """Get courses for a specific stream with qualification filter"""
    qualification = request.args.get('qualification', '12th')  # Default to 12th if not provided
    
    # Filter courses based on qualification and stream
    courses = Course.query.filter_by(stream_id=stream_id).all()
    filtered_courses = [
        course for course in courses 
        if meets_qualification(qualification, course.min_qualification)
    ]
    
    return jsonify({
        'success': True,
        'data': [course.to_dict() for course in filtered_courses]
    })

@guidance_bp.route('/careers/<int:course_id>', methods=['GET'])
def get_careers(course_id):
    """Get careers for a specific course with qualification filter"""
    qualification = request.args.get('qualification', 'Graduate')  # Default to Graduate if not provided
    
    # Filter careers based on qualification and course
    careers = Career.query.filter_by(course_id=course_id).all()
    filtered_careers = [
        career for career in careers 
        if meets_qualification(qualification, career.min_qualification)
    ]
    
    return jsonify({
        'success': True,
        'data': [career.to_dict() for career in filtered_careers]
    })

@guidance_bp.route('/exams/<int:career_id>', methods=['GET'])
def get_exams(career_id):
    """Get exams for a specific career with qualification filter"""
    qualification = request.args.get('qualification', '12th')  # Default to 12th if not provided
    
    # Filter exams based on qualification and career
    exams = Exam.query.filter_by(career_id=career_id).all()
    filtered_exams = [
        exam for exam in exams 
        if meets_qualification(qualification, exam.min_qualification)
    ]
    
    return jsonify({
        'success': True,
        'data': [exam.to_dict() for exam in filtered_exams]
    })

@guidance_bp.route('/guidance', methods=['GET'])
def get_guidance_by_qualification():
    """Get personalized guidance based on qualification level"""
    qualification = request.args.get('qualification', '10th')
    
    guidance_data = {
        'qualification': qualification,
        'options': []
    }
    
    if qualification == '10th':
        # For 10th students, show basic streams and career exploration
        guidance_data['options'] = [
            {
                'type': 'stream',
                'title': 'Consider your interests',
                'description': 'As a 10th standard student, you should explore basic interests in Science, Arts, or Commerce',
                'options': [stream.to_dict() for stream in Stream.query.filter_by(min_qualification='10th').all()]
            },
            {
                'type': 'preparation',
                'title': 'Prepare for your journey',
                'description': 'Focus on building foundational skills and exploring interests'
            }
        ]
    elif qualification == '12th':
        # For 12th students, show streams and courses
        guidance_data['options'] = [
            {
                'type': 'advanced_options',
                'title': 'Explore these educational paths',
                'description': 'As a 12th standard student, you can pursue these educational paths',
                'streams': [stream.to_dict() for stream in Stream.query.all()],
                'popular_courses': [course.to_dict() for course in Course.query.filter_by(min_qualification='12th').limit(5).all()]
            },
            {
                'type': 'exams',
                'title': 'Prepare for entrance exams',
                'description': 'Consider preparing for these entrance examinations',
                'exams': [exam.to_dict() for exam in Exam.query.filter_by(min_qualification='12th').limit(5).all()]
            }
        ]
    else:
        # For graduates and above
        guidance_data['options'] = [
            {
                'type': 'career_options',
                'title': 'Career opportunities',
                'description': f'With your {qualification} qualification, explore these career options',
                'careers': [career.to_dict() for career in Career.query.filter_by(min_qualification=qualification).limit(10).all()]
            },
            {
                'type': 'advanced_studies',
                'title': 'Advanced study options',
                'description': 'Consider furthering your education with these options',
                'courses': [course.to_dict() for course in Course.query.filter(Course.min_qualification >= qualification).limit(5).all()]
            }
        ]
    
    return jsonify({
        'success': True,
        'data': guidance_data
    })

# User authentication and profile routes
@guidance_bp.route('/register', methods=['POST'])
def register_user():
    """Register a new user"""
    data = request.json
    
    if not data or not all(key in data for key in ['username', 'email', 'password', 'qualification']):
        return jsonify({
            'success': False,
            'message': 'Missing required fields'
        }), 400
    
    # Check if user already exists
    existing_user = User.query.filter((User.username == data['username']) | (User.email == data['email'])).first()
    if existing_user:
        return jsonify({
            'success': False,
            'message': 'Username or email already exists'
        }), 400
    
    # Create new user
    new_user = User(
        username=data['username'],
        email=data['email'],
        password=data['password'],  # In production, hash this password
        qualification=data['qualification']
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'User registered successfully',
        'data': new_user.to_dict()
    }), 201

@guidance_bp.route('/login', methods=['POST'])
def login_user():
    """Login a user"""
    data = request.json
    
    if not data or not all(key in data for key in ['username', 'password']):
        return jsonify({
            'success': False,
            'message': 'Missing username or password'
        }), 400
    
    # Find user by username
    user = User.query.filter_by(username=data['username']).first()
    
    # Check if user exists and password matches
    if not user or user.password != data['password']:  # In production, verify hashed password
        return jsonify({
            'success': False,
            'message': 'Invalid username or password'
        }), 401
    
    return jsonify({
        'success': True,
        'message': 'Login successful',
        'data': user.to_dict()
    }) 