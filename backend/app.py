from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from config import Config
import requests

app = Flask(__name__)
app.config.from_object(Config)
db = SQLAlchemy(app)

# Import routes (after db to avoid circular imports)
# from routes.api import *

@app.route('/learn_language')
def learn_language_page():
    return render_template('language_learner.html')

@app.route('/process_speech', methods=['POST'])
def process_speech():
    try:
        # Get the API key from the header
        api_key = request.headers.get('X-API-Key')
        if not api_key:
            return jsonify({'error': 'API key is missing'}), 401
        
        # Check if the file is in the request
        if 'file' not in request.files:
            return jsonify({'error': 'No file part in the request'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Forward the request to the Sarvam.ai API
        sarvam_url = 'https://api.sarvam.ai/speech-to-text-translate'
        headers = {
            'api-subscription-key': api_key,
        }
        
        # Send file to the Sarvam API
        files = {'file': (file.filename, file.read(), file.content_type)}
        response = requests.post(sarvam_url, headers=headers, files=files)
        
        # Return the response from the Sarvam API
        return response.json(), response.status_code
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)