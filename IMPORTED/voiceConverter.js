// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Text to Speech functionality
    const textToSpeech = document.getElementById('textToSpeech');
    const speakBtn = document.getElementById('speakBtn');
    
    // Speech to Text functionality
    const startRecordingBtn = document.getElementById('startRecordingBtn');
    const stopRecordingBtn = document.getElementById('stopRecordingBtn');
    const transcriptionResult = document.getElementById('transcriptionResult');
    
    // Speech synthesis variables
    let speechSynthesis = window.speechSynthesis;
    let speechRecognition = null;
    
    // Initialize Web Speech API for Speech Recognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        speechRecognition = new SpeechRecognition();
        speechRecognition.continuous = true;
        speechRecognition.interimResults = true;
        speechRecognition.lang = 'en-US'; // Default language
    }
    
    // Event listeners for Text to Speech
    if (speakBtn && textToSpeech) {
        speakBtn.addEventListener('click', function() {
            speakText(textToSpeech.value);
        });
    }
    
    // Event listeners for Speech to Text
    if (startRecordingBtn && stopRecordingBtn && transcriptionResult && speechRecognition) {
        startRecordingBtn.addEventListener('click', startRecording);
        stopRecordingBtn.addEventListener('click', stopRecording);
        
        // Results event for speech recognition
        speechRecognition.onresult = function(event) {
            let interimTranscript = '';
            let finalTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }
            
            // Update the transcription result
            transcriptionResult.textContent = finalTranscript || interimTranscript;
            
            // Send transcription to the server (demo)
            if (finalTranscript) {
                sendTranscriptionToServer(finalTranscript);
            }
        };
        
        // Error event for speech recognition
        speechRecognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
            stopRecording();
            alert('Speech recognition error: ' + event.error);
        };
    } else if (startRecordingBtn && stopRecordingBtn) {
        // Disable buttons if speech recognition is not supported
        startRecordingBtn.disabled = true;
        stopRecordingBtn.disabled = true;
        
        if (transcriptionResult) {
            transcriptionResult.textContent = 'Speech recognition is not supported in this browser.';
        }
    }
    
    // Update language for speech recognition based on the selected language
    document.addEventListener('languageChanged', function(e) {
        if (speechRecognition) {
            switch(e.detail.language) {
                case 'en':
                    speechRecognition.lang = 'en-US';
                    break;
                case 'hi':
                    speechRecognition.lang = 'hi-IN';
                    break;
                case 'kn':
                    speechRecognition.lang = 'kn-IN';
                    break;
                case 'te':
                    speechRecognition.lang = 'te-IN';
                    break;
                default:
                    speechRecognition.lang = 'en-US';
            }
        }
    });
});

// Function to convert text to speech
function speakText(text) {
    if (!text) {
        alert('Please enter some text to speak.');
        return;
    }
    
    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Get the current language
    const currentLanguage = localStorage.getItem('preferredLanguage') || 'en';
    
    // Set language for the utterance
    switch(currentLanguage) {
        case 'en':
            utterance.lang = 'en-US';
            break;
        case 'hi':
            utterance.lang = 'hi-IN';
            break;
        case 'kn':
            utterance.lang = 'kn-IN';
            break;
        case 'te':
            utterance.lang = 'te-IN';
            break;
        default:
            utterance.lang = 'en-US';
    }
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    // Speak the text
    window.speechSynthesis.speak(utterance);
    
    // Send text to API for analytics (demo)
    sendTextToSpeechToServer(text, currentLanguage);
}

// Function to start speech recording
function startRecording() {
    if (!speechRecognition) {
        alert('Speech recognition is not supported in this browser.');
        return;
    }
    
    // Clear previous transcription
    document.getElementById('transcriptionResult').textContent = '';
    
    // Update button states
    document.getElementById('startRecordingBtn').disabled = true;
    document.getElementById('stopRecordingBtn').disabled = false;
    
    // Start recognition
    try {
        speechRecognition.start();
    } catch (error) {
        console.error('Speech recognition error:', error);
        stopRecording();
    }
}

// Function to stop speech recording
function stopRecording() {
    if (!speechRecognition) return;
    
    // Update button states
    document.getElementById('startRecordingBtn').disabled = false;
    document.getElementById('stopRecordingBtn').disabled = true;
    
    // Stop recognition
    try {
        speechRecognition.stop();
    } catch (error) {
        console.error('Error stopping speech recognition:', error);
    }
}

// Function to send text to speech data to server (demo)
async function sendTextToSpeechToServer(text, language) {
    try {
        // Example API call using Axios - replace URL with actual endpoint
        // const response = await axios.post('https://api.ruraleducation.org/text-to-speech', { 
        //     text, 
        //     language 
        // });
        
        console.log('Text to speech sent to server:', { text, language });
    } catch (error) {
        console.error('Error sending text to speech data:', error);
    }
}

// Function to send transcription to server (demo)
async function sendTranscriptionToServer(text) {
    try {
        // Get the current language
        const language = localStorage.getItem('preferredLanguage') || 'en';
        
        // Example API call using Axios - replace URL with actual endpoint
        // const response = await axios.post('https://api.ruraleducation.org/speech-to-text', { 
        //     text, 
        //     language 
        // });
        
        console.log('Transcription sent to server:', { text, language });
    } catch (error) {
        console.error('Error sending transcription data:', error);
    }
} 