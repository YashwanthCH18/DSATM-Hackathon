# Rural Education Hub

A platform for providing career guidance to students from rural areas based on their qualifications.

## Project Structure

```
DSATM-Hackathon/
├── backend/
│   ├── models/
│   │   └── models.py           # Database models
│   ├── routes/
│   │   ├── auth.py             # Authentication routes
│   │   └── guidance.py         # Career guidance routes
│   ├── migrations/
│   │   └── update_user_model.py # Database migration script
│   ├── app.py                  # Main application entry point
│   ├── config.py               # Application configuration
│   ├── decorators.py           # Route decorators (auth, etc.)
│   └── seed.py                 # Database seeding script
├── frontend/
│   ├── static/
│   │   ├── css/
│   │   │   └── style.css       # Main stylesheet
│   │   ├── js/
│   │   │   ├── main.js         # Main JavaScript file
│   │   │   └── languageConverter.js # Language translation support
│   │   └── images/             # Image assets
│   ├── career.html             # Career guidance page
│   ├── index.html              # Home page
│   └── signup.html             # Authentication page
└── requirements.txt            # Python dependencies
```

## Features

1. **Qualification-based Career Guidance**
   - Explore suitable educational streams for 10th standard
   - Discover courses based on 12th standard qualification
   - Find career paths for graduates
   - Get exam recommendations based on qualifications

2. **User Authentication**
   - User registration with validation
   - Login and session management
   - Profile management

3. **Multilingual Support**
   - Content translation in multiple languages
   - Mobile-friendly design

## Setup Instructions

### Prerequisites
- Python 3.8+
- Flask
- MySQL (or SQLite for development)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd DSATM-Hackathon
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Set up the database:
   ```
   cd backend
   python seed.py  # This will create and seed the database
   ```

5. Run the application:
   ```
   python app.py
   ```

6. Access the application:
   - Open a browser and navigate to `http://localhost:5000`

## Usage

1. **Browse Career Options**
   - Visit the Career Path page to explore options without logging in

2. **Personalized Recommendations**
   - Register or log in to get personalized career guidance based on your qualification
   - Explore streams, courses, careers, and exams suitable for your qualification level

3. **Educational Resources**
   - Find information about government schemes and scholarships
   - Access educational resources and guidance material

## Technologies Used

- **Backend**: Flask, SQLAlchemy, Flask-Login
- **Frontend**: HTML, CSS, JavaScript, Bootstrap
- **Database**: MySQL/SQLite
