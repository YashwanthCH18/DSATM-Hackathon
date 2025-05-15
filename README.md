# Rural Student Career Guidance

A web application to provide career guidance to rural students with OTP-based email verification.

## Features

- User registration with email OTP verification
- Secure login/authentication system
- Career guidance based on qualification
- Course recommendations
- Exam information
- Mobile-friendly interface

## OTP Verification Flow

1. User enters their email on the signup form
2. User clicks "Send OTP" button
3. System sends a 6-digit OTP to the provided email
4. User enters the OTP and clicks "Verify OTP"
5. Upon successful verification, user can complete the registration form
6. After registration, user is redirected to the landing page

## Email Configuration

The application uses the following SMTP settings for sending OTP emails:
- Email: ruralchaatra@gmail.com
- Server: smtp.gmail.com
- Port: 587
- Authentication: App password

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Configure the database in config.py
4. Run the application:
   ```
   python backend/app.py
   ```
5. Access the application at http://localhost:5000

## Project Structure

```
DSATM-Hackathon/
├── backend/
│   ├── app.py               # Main Flask application
│   ├── config.py            # Configuration settings
│   ├── models/
│   │   └── models.py        # Database models
│   └── routes/
│       ├── auth.py          # Authentication routes (login, register, OTP)
│       └── guidance.py      # Career guidance routes
└── frontend/
    ├── index.html           # Landing page
    ├── signup.html          # User registration with OTP verification
    ├── career.html          # Career guidance page
    └── static/
        ├── css/             # Stylesheets
        ├── js/              # JavaScript files
        └── img/             # Images
```
