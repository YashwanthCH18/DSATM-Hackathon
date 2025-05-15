document.addEventListener('DOMContentLoaded', () => {
    const speakButton = document.getElementById('speakButton');
    const statusDisplay = document.getElementById('statusDisplay');
    const recordingIndicator = document.getElementById('recordingIndicator');
    const conversationContainer = document.getElementById('conversationContainer');

    let isRecording = false;
    let mediaRecorder = null;
    let audioChunks = [];
    const API_KEY = 'sk_1j4etflr_iIlrTHqNrPb5DsnWYr94ah45';
    
    speakButton.addEventListener('click', async () => {
        if (!isRecording) {
            startRecording();
        } else {
            stopRecording();
        }
    });

    async function startRecording() {
        try {
            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Set up recording
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];
            
            // Start recording / listening
            isRecording = true;
            updateButtonToRecording();
            recordingIndicator.classList.remove('d-none');
            statusDisplay.innerHTML = "<em>Listening... Speak now!</em>";
            
            // Handle audio data
            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };
            
            // Handle recording stop
            mediaRecorder.onstop = async () => {
                // Convert audio chunks to a blob
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                
                // Process the audio
                await processAudioWithAPI(audioBlob);
            };
            
            // Start the recorder
            mediaRecorder.start();
            
        } catch (error) {
            console.error("Error accessing microphone:", error);
            statusDisplay.innerHTML = "<p style='color: red;'>Could not access microphone. Please check permissions and try again.</p>";
        }
    }

    function stopRecording() {
        if (mediaRecorder && isRecording) {
            isRecording = false;
            updateButtonToDefault();
            recordingIndicator.classList.add('d-none');
            statusDisplay.innerHTML = "<em>Processing your speech...</em>";
            
            // Stop the recorder
            mediaRecorder.stop();
            
            // Stop the microphone access
            if (mediaRecorder.stream) {
                mediaRecorder.stream.getTracks().forEach(track => track.stop());
            }
        }
    }

    function updateButtonToRecording() {
        speakButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-stop-circle-fill" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M6.5 5A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5v-5a.5.5 0 0 0-.5-.5z"/>
            </svg>
            Stop Listening`;
        speakButton.classList.add('btn-danger');
        speakButton.classList.remove('btn-custom-speak');
    }

    function updateButtonToDefault() {
        speakButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-mic-fill" viewBox="0 0 16 16">
                <path d="M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0z"/>
                <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5"/>
            </svg>
            Start Talking`;
        speakButton.classList.remove('btn-danger');
        speakButton.classList.add('btn-custom-speak');
    }

    async function processAudioWithAPI(audioBlob) {
        try {
            // Add user's recording to conversation as a placeholder
            addMessageToConversation("Processing your speech...", 'user', true);
            
            // Create form data for the API call
            const formData = new FormData();
            formData.append('file', audioBlob, 'recording.wav');
            
            // Send to the backend proxy endpoint (to avoid CORS issues)
            const response = await axios.post('/process_speech', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-API-Key': API_KEY
                }
            });
            
            // Process the response
            if (response.data && response.data.transcript) {
                const transcript = response.data.transcript;
                const detectedLanguage = response.data.language_code || "Unknown";
                
                // Update the user message with the actual transcription
                const userMessageElements = document.querySelectorAll('.user-message.processing');
                if (userMessageElements.length > 0) {
                    const lastUserMessage = userMessageElements[userMessageElements.length - 1];
                    lastUserMessage.querySelector('.message-content').textContent = transcript;
                    lastUserMessage.classList.remove('processing');
                }
                
                // Create AI response
                const aiResponse = generateAIResponse(transcript, detectedLanguage);
                
                // Add AI response to conversation
                addMessageToConversation(aiResponse.responseText, 'ai');
                
                // Update status display
                updateStatusWithLanguageInfo(aiResponse);
                
            } else {
                throw new Error("Invalid API response");
            }
            
        } catch (error) {
            console.error("Error processing audio:", error);
            statusDisplay.innerHTML = "<p style='color: red;'>Error processing your speech. Please try again.</p>";
            
            // Remove the processing message if there was an error
            const processingMessages = document.querySelectorAll('.user-message.processing');
            processingMessages.forEach(msg => msg.remove());
            
            // Fall back to mock data if API fails
            const mockTranscript = "Hello, how are you today?";
            addMessageToConversation(mockTranscript, 'user');
            const mockResponse = generateAIResponse(mockTranscript, "en-US");
            addMessageToConversation(mockResponse.responseText, 'ai');
        }
    }

    function generateAIResponse(transcript, languageCode) {
        // Map language code to language name
        let languageName = "Unknown";
        const languageMap = {
            'hi-IN': 'Hindi',
            'ta-IN': 'Tamil',
            'te-IN': 'Telugu',
            'kn-IN': 'Kannada',
            'ml-IN': 'Malayalam',
            'mr-IN': 'Marathi',
            'gu-IN': 'Gujarati',
            'bn-IN': 'Bengali',
            'fr-FR': 'French',
            'de-DE': 'German',
            'es-ES': 'Spanish',
            'it-IT': 'Italian',
            'ja-JP': 'Japanese',
            'ko-KR': 'Korean',
            'zh-CN': 'Chinese',
            'ru-RU': 'Russian',
            'ar-SA': 'Arabic',
            'en-US': 'English',
            'en-GB': 'English',
            'en-IN': 'English (Indian accent)'
        };
        
        if (languageCode in languageMap) {
            languageName = languageMap[languageCode];
        }
        
        // Generate response based on language
        let responseText = "";
        let pronunciationTips = "";
        
        if (languageName === "English" || languageName === "English (Indian accent)" || languageName === "Unknown") {
            responseText = `I heard you speaking English! Here's how to improve: Focus on pronouncing 'th' sounds correctly, and work on word stress patterns.`;
            pronunciationTips = "Pay attention to the rhythm of English sentences - English is a stress-timed language.";
        } else {
            responseText = `I heard you speaking ${languageName}! In English, you would say: "${transcript}"`;
            
            // Language-specific pronunciation tips
            switch(languageCode.split('-')[0]) {
                case 'hi':
                case 'ta':
                case 'te':
                case 'kn':
                case 'ml':
                case 'mr':
                case 'gu':
                case 'bn':
                    pronunciationTips = "Indian language speakers should focus on the 'w/v' distinction and English vowel sounds.";
                    break;
                case 'es':
                    pronunciationTips = "Spanish speakers should practice the 'h' sound which is silent in Spanish but pronounced in English.";
                    break;
                case 'fr':
                    pronunciationTips = "French speakers should focus on the 'h' sound and final consonants which are often silent in French.";
                    break;
                case 'de':
                    pronunciationTips = "German speakers should practice the 'w' sound (pronounced as 'v' in German) and soften consonants.";
                    break;
                case 'zh':
                    pronunciationTips = "Chinese speakers should practice 'l' and 'r' sounds and work on longer words with multiple syllables.";
                    break;
                case 'ja':
                    pronunciationTips = "Japanese speakers should practice distinguishing 'r' and 'l' sounds and consonant clusters.";
                    break;
                default:
                    pronunciationTips = "Focus on English rhythm and intonation patterns for more natural-sounding speech.";
            }
        }
        
        return {
            detectedLanguage: languageName,
            originalText: transcript,
            responseText: responseText,
            pronunciationTips: pronunciationTips
        };
    }

    function updateStatusWithLanguageInfo(data) {
        statusDisplay.innerHTML = `
            <p><strong>Detected Language:</strong> ${data.detectedLanguage}</p>
            <p><strong>Pronunciation Tip:</strong> ${data.pronunciationTips}</p>
        `;
    }

    function addMessageToConversation(text, sender, isProcessing = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        if (isProcessing) {
            messageDiv.classList.add('processing');
        }
        
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.innerHTML = `
            <p class="message-content">${text}</p>
            <div class="message-metadata">${timeString}</div>
        `;
        
        conversationContainer.appendChild(messageDiv);
        
        // Scroll to the latest message
        conversationContainer.scrollTop = conversationContainer.scrollHeight;
    }
}); 