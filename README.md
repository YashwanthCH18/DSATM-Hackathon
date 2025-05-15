# Rural Chaatra - Empowering Rural Students Through Technology

## Project Overview

Rural Chaatra is an innovative platform designed to bridge the career and language learning gap for rural students across India. The project leverages advanced AI technologies, including Google's Gemini AI and India's indigenous Sarvam AI, to provide personalized educational experiences to students in rural areas who often lack access to quality career guidance and language resources.

The platform offers three core functionalities:
1. **Tailored Career Guidance** - Personalized career recommendations based on student profiles and preferences
2. **Multilingual Speech-to-Text Learning** - Native language to English translation using Sarvam AI's advanced speech recognition
3. **Automated Quiz Generation** - PDF document analysis and quiz generation powered by Gemini AI

## Technology Stack

### Frontend
- HTML5, CSS3, JavaScript
- Bootstrap 5 for responsive design
- Flask templates for server-side rendering
- AJAX for asynchronous API calls
- Web Speech API for browser-based speech recognition

### Backend
- Python 3.8+
- Flask framework for API development and server-side logic
- Flask-Login for authentication management
- SQLAlchemy ORM for database operations
- PyMySQL for MySQL database connectivity
- Werkzeug for security utilities

### AI and Machine Learning
- **Sarvam AI** - Indigenous Indian AI platform for speech-to-text and translation services
- **Google Gemini AI** - For PDF analysis and automated quiz generation
- Custom NLP pipelines for career recommendation algorithms

### Database
- MySQL/SQLite for data persistence
- SQLAlchemy for ORM capabilities and database migrations

## System Architecture

The application follows a modular architecture with several key components:

1. **Authentication Module**: OTP-based verification system with email integration
2. **Career Guidance Engine**: Algorithm-based recommendation system with data analysis
3. **Language Translation Pipeline**: Audio processing → Speech-to-Text → Translation → Response
4. **PDF Processing Service**: Document parsing → Content extraction → Quiz generation
5. **Frontend Rendering Engine**: Responsive templates with multilingual support

## Project Setup

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)
- Git
- MySQL (optional, SQLite works out of the box)

### Environment Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/DSATM-Hackathon.git
cd DSATM-Hackathon
```

2. Create a virtual environment
```bash
python -m venv venv

# Activate on Windows
venv\Scripts\activate

# Activate on macOS/Linux
source venv/bin/activate
```

3. Install required packages
```bash
pip install -r requirements.txt
```

4. Configure environment variables
```bash
# Create a .env file with the following variables
FLASK_APP=backend/app.py
FLASK_ENV=development
SECRET_KEY=your_secret_key
DATABASE_URL=sqlite:///instance/rural_chaatra.db  # or your MySQL connection string
MAIL_SERVER=smtp.yourserver.com
MAIL_PORT=587
MAIL_USERNAME=your_email@example.com
MAIL_PASSWORD=your_email_password
SARVAM_API_KEY=your_sarvam_ai_api_key
```

### Database Setup

```bash
# Navigate to the backend directory
cd backend

# Initialize the database
flask db init
flask db migrate -m "Initial migration"
flask db upgrade

# Seed the database with initial data (optional)
python seed.py
```

## Running the Application

1. Start the Flask development server
```bash
flask run
# or
python backend/app.py
```

2. Access the application
```
http://127.0.0.1:5000/
```

## API Endpoints

The application exposes several RESTful API endpoints:

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/verify-otp` - OTP verification
- `GET /auth/logout` - User logout

### Career Guidance
- `GET /career/streams` - List available education streams
- `GET /career/courses` - List courses based on stream
- `GET /career/careers` - Get career options based on course
- `GET /career/exams` - Get relevant entrance examinations

### Speech-to-Text (Sarvam AI Integration)
- `POST /process_speech` - Convert speech audio to text with translation
- `POST /text_to_speech` - Convert text to speech in multiple Indian languages

### Quiz Generation (Gemini AI Integration)
- `POST /generate-quiz` - Parse PDF and generate interactive quizzes

## Key Features in Detail

### Sarvam AI Speech-to-Text Integration

The platform integrates with Sarvam AI's advanced speech recognition system specially trained on Indian accents and languages. This integration allows:

- Recognition of multiple Indian languages
- Accurate translation to English
- Context-aware responses for educational content
- Real-time processing with minimal latency

The implementation utilizes a custom audio processing pipeline:
1. Audio capture using browser APIs
2. Conversion to compatible format
3. Secure transmission to Sarvam AI endpoints
4. Response parsing and presentation

Example API request:
```python
# Audio data processing with Sarvam AI
headers = {
    "api-subscription-key": sarvam_api_key,
}
files = {
    'file': (secure_filename(file.filename), file.stream, file.content_type)
}
        
sarvam_url = "https://api.sarvam.ai/speech-to-text-translate"
response = requests.post(sarvam_url, headers=headers, files=files)
```

### Multi-Language Support

The platform supports multiple Indian languages including:
- Hindi
- Kannada
- Telugu
- Tamil
- Malayalam
- Bengali
- Marathi
- Gujarati

Users can switch languages dynamically through the interface, with all content and UI elements translated accordingly.

## Project Structure

```
DSATM-Hackathon/
├── backend/
│   ├── app.py                 # Main Flask application entry point
│   ├── config.py              # Configuration settings
│   ├── seed.py                # Database seed script
│   ├── models/                # SQLAlchemy models
│   │   └── models.py          # Database schema definitions
│   ├── routes/                # API route definitions
│   │   ├── auth.py            # Authentication routes
│   │   └── guidance.py        # Career guidance routes
│   ├── templates/             # Server-side templates
│   └── migrations/            # Database migration scripts
├── frontend/
│   ├── static/
│   │   ├── css/               # Stylesheets
│   │   ├── js/                # JavaScript files
│   │   │   ├── main.js        # Core functionality
│   │   │   ├── auth-check.js  # Authentication utilities
│   │   │   └── language_learner.js # Sarvam AI integration
│   │   └── img/               # Static images
│   ├── index.html             # Landing page
│   ├── career.html            # Career guidance page
│   ├── elearn.html            # E-learning platform page
│   └── signup.html            # Authentication page
├── projectPhoto/              # Project-related images
├── venv/                      # Virtual environment (not tracked in git)
├── instance/                  # Instance-specific files
├── requirements.txt           # Python dependencies
└── README.md                  # Project documentation
```

## Deployment Considerations

For production deployment:

1. Use a production WSGI server (Gunicorn, uWSGI)
2. Configure a reverse proxy (Nginx, Apache)
3. Implement proper SSL/TLS certificates
4. Set up database backups
5. Configure error logging and monitoring
6. Use environment variables for sensitive information

## Contributors

- [Contributor 1](https://github.com/contributor1)
- [Contributor 2](https://github.com/contributor2)
- [Contributor 3](https://github.com/contributor3)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Sarvam AI](https://sarvam.ai/) for providing API access to their cutting-edge speech recognition technology
- Google for Gemini AI capabilities
- The DSATM Hackathon organizing team for the opportunity to develop this solution 