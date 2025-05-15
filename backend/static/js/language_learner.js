document.addEventListener('DOMContentLoaded', () => {
    const speakButton = document.getElementById('speakButton');
    const statusDisplay = document.getElementById('statusDisplay');
    const recordingIndicator = document.getElementById('recordingIndicator');
    const conversationContainer = document.getElementById('conversationContainer');

    let isRecording = false;
    let mediaRecorder = null;
    let audioChunks = [];
    const API_KEY = 'sk_1j4etflr_iIlrTHqNrPb5DsnWYr94ah45';
    let isPlaying = false;
    
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
            const messageId = addMessageToConversation("Processing your speech...", 'user', true);
            
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
                const messageId = addMessageToConversation(aiResponse.responseText, 'ai', false, true);
                
                // Convert AI response to speech
                await convertTextToSpeech(aiResponse.responseText, 'en-US', messageId);
                
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

    async function convertTextToSpeech(text, languageCode, messageId) {
        try {
            // Show loading indicator on the message
            const messageElement = document.getElementById(messageId);
            if (messageElement) {
                messageElement.classList.add('tts-loading');
            }
            
            // Prepare the data for TTS API
            const ttsData = {
                text: text,
                target_language_code: languageCode,
                speaker: 'Arjun', // A male voice
                pace: 1.0,        // Normal pace
                model: 'bulbul:v1' // The model to use
            };
            
            // Call the TTS API
            const response = await axios.post('/text_to_speech', ttsData, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': API_KEY
                }
            });
            
            // Check if we have audio data
            if (response.data && response.data.audios && response.data.audios.length > 0) {
                const base64Audio = response.data.audios[0];
                
                // Create an audio element and play the speech
                const audioSrc = `data:audio/wav;base64,${base64Audio}`;
                
                // If the message has an existing audio element, update it
                let audioElement = messageElement ? messageElement.querySelector('audio') : null;
                
                if (!audioElement) {
                    // Create new audio element
                    audioElement = document.createElement('audio');
                    audioElement.controls = false;
                    
                    // Add it to the message container
                    if (messageElement) {
                        // Create an audio control button
                        const audioButton = document.createElement('button');
                        audioButton.className = 'audio-control';
                        audioButton.innerHTML = `
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-volume-up" viewBox="0 0 16 16">
                                <path d="M11.536 14.01A8.47 8.47 0 0 0 14.026 8a8.47 8.47 0 0 0-2.49-6.01l-.708.707A7.48 7.48 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z"/>
                                <path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.48 5.48 0 0 1 11.025 8a5.48 5.48 0 0 1-1.61 4.596l.706.704z"/>
                                <path d="M8.707 11.182A4.5 4.5 0 0 0 10.025 8a4.5 4.5 0 0 0-1.318-3.182L8 5.525A3.5 3.5 0 0 1 9.025 8 3.5 3.5 0 0 1 8 10.475l.707.707zM6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06z"/>
                            </svg>
                        `;
                        
                        // Toggle audio on button click
                        audioButton.addEventListener('click', (e) => {
                            e.preventDefault();
                            if (isPlaying && audioElement.playing) {
                                audioElement.pause();
                                isPlaying = false;
                                audioButton.innerHTML = `
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-volume-up" viewBox="0 0 16 16">
                                        <path d="M11.536 14.01A8.47 8.47 0 0 0 14.026 8a8.47 8.47 0 0 0-2.49-6.01l-.708.707A7.48 7.48 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z"/>
                                        <path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.48 5.48 0 0 1 11.025 8a5.48 5.48 0 0 1-1.61 4.596l.706.704z"/>
                                        <path d="M8.707 11.182A4.5 4.5 0 0 0 10.025 8a4.5 4.5 0 0 0-1.318-3.182L8 5.525A3.5 3.5 0 0 1 9.025 8 3.5 3.5 0 0 1 8 10.475l.707.707zM6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06z"/>
                                    </svg>
                                `;
                            } else {
                                // Stop all currently playing audio
                                document.querySelectorAll('audio').forEach(audio => {
                                    if (audio !== audioElement) {
                                        audio.pause();
                                        audio.currentTime = 0;
                                    }
                                });
                                
                                // Reset all audio buttons
                                document.querySelectorAll('.audio-control').forEach(btn => {
                                    btn.innerHTML = `
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-volume-up" viewBox="0 0 16 16">
                                            <path d="M11.536 14.01A8.47 8.47 0 0 0 14.026 8a8.47 8.47 0 0 0-2.49-6.01l-.708.707A7.48 7.48 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z"/>
                                            <path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.48 5.48 0 0 1 11.025 8a5.48 5.48 0 0 1-1.61 4.596l.706.704z"/>
                                            <path d="M8.707 11.182A4.5 4.5 0 0 0 10.025 8a4.5 4.5 0 0 0-1.318-3.182L8 5.525A3.5 3.5 0 0 1 9.025 8 3.5 3.5 0 0 1 8 10.475l.707.707zM6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06z"/>
                                        </svg>
                                    `;
                                });
                                
                                // Play this audio
                                audioElement.play();
                                isPlaying = true;
                                audioButton.innerHTML = `
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-pause-circle" viewBox="0 0 16 16">
                                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                        <path d="M5 6.25a1.25 1.25 0 1 1 2.5 0v3.5a1.25 1.25 0 1 1-2.5 0v-3.5zm3.5 0a1.25 1.25 0 1 1 2.5 0v3.5a1.25 1.25 0 1 1-2.5 0v-3.5z"/>
                                    </svg>
                                `;
                            }
                        });
                        
                        // Add the button and audio element to the message
                        const audioContainer = document.createElement('div');
                        audioContainer.className = 'audio-container';
                        audioContainer.appendChild(audioButton);
                        audioContainer.appendChild(audioElement);
                        messageElement.appendChild(audioContainer);
                    }
                }
                
                // Update audio source
                audioElement.src = audioSrc;
                
                // Add event listeners to track playing state
                audioElement.addEventListener('ended', () => {
                    isPlaying = false;
                    // Reset the audio button icon
                    if (messageElement) {
                        const audioButton = messageElement.querySelector('.audio-control');
                        if (audioButton) {
                            audioButton.innerHTML = `
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-volume-up" viewBox="0 0 16 16">
                                    <path d="M11.536 14.01A8.47 8.47 0 0 0 14.026 8a8.47 8.47 0 0 0-2.49-6.01l-.708.707A7.48 7.48 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303l.708.707z"/>
                                    <path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.48 5.48 0 0 1 11.025 8a5.48 5.48 0 0 1-1.61 4.596l.706.704z"/>
                                    <path d="M8.707 11.182A4.5 4.5 0 0 0 10.025 8a4.5 4.5 0 0 0-1.318-3.182L8 5.525A3.5 3.5 0 0 1 9.025 8 3.5 3.5 0 0 1 8 10.475l.707.707zM6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325l2.363-1.89a.5.5 0 0 1 .529-.06z"/>
                                </svg>
                            `;
                        }
                    }
                });
                
                // Auto-play the audio
                try {
                    await audioElement.play();
                    isPlaying = true;
                    
                    if (messageElement) {
                        const audioButton = messageElement.querySelector('.audio-control');
                        if (audioButton) {
                            audioButton.innerHTML = `
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-pause-circle" viewBox="0 0 16 16">
                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                    <path d="M5 6.25a1.25 1.25 0 1 1 2.5 0v3.5a1.25 1.25 0 1 1-2.5 0v-3.5zm3.5 0a1.25 1.25 0 1 1 2.5 0v3.5a1.25 1.25 0 1 1-2.5 0v-3.5z"/>
                                </svg>
                            `;
                        }
                    }
                } catch (err) {
                    console.warn('Auto-play failed. User interaction needed to play audio.', err);
                }
            }
            
            // Remove loading state
            if (messageElement) {
                messageElement.classList.remove('tts-loading');
            }
            
        } catch (error) {
            console.error("Error converting text to speech:", error);
            
            // Remove loading state
            const messageElement = document.getElementById(messageId);
            if (messageElement) {
                messageElement.classList.remove('tts-loading');
            }
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

    function addMessageToConversation(text, sender, isProcessing = false, withTts = false) {
        const messageId = 'msg-' + Date.now();
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.id = messageId;
        
        if (isProcessing) {
            messageDiv.classList.add('processing');
        }
        
        if (withTts) {
            messageDiv.classList.add('tts-loading');
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
        
        return messageId;
    }
}); 