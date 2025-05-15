from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from config import Config
import requests
import base64

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

@app.route('/text_to_speech', methods=['POST'])
def text_to_speech():
    try:
        # Get the API key from the header
        api_key = request.headers.get('X-API-Key')
        if not api_key:
            return jsonify({'error': 'API key is missing'}), 401
        
        # Get request data
        data = request.json
        if not data or 'text' not in data:
            return jsonify({'error': 'Text is required'}), 400
        
        # Prepare request for Sarvam.ai TTS API
        sarvam_url = 'https://api.sarvam.ai/text-to-speech'
        headers = {
            'api-subscription-key': api_key,
            'Content-Type': 'application/json'
        }
        
        # Add default parameters if not provided
        if 'target_language_code' not in data:
            data['target_language_code'] = 'en-US'  # Default to English
        
        # Optional parameters
        params = ['speaker', 'pace', 'pitch', 'loudness', 'speech_sample_rate', 'enable_preprocessing', 'model']
        for param in params:
            if param not in data and param in request.json:
                data[param] = request.json[param]
        
        # Send request to Sarvam API
        response = requests.post(sarvam_url, headers=headers, json=data)
        
        if response.status_code == 200:
            # Return the base64 audio data
            return response.json(), 200
        else:
            return jsonify({'error': 'Text-to-speech API error', 'details': response.text}), response.status_code
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)