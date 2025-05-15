// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Profile form submission
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const studentData = {
                name: document.getElementById('studentName').value,
                mobile: document.getElementById('studentMobile').value,
                email: document.getElementById('studentEmail').value,
                qualification: document.getElementById('studentQualification').value
            };
            
            try {
                // Example API call using Axios - replace URL with actual endpoint
                // const response = await axios.post('https://api.ruraleducation.org/profile', studentData);
                
                // Simulate successful submission for demo
                await simulateApiCall(studentData);
                
                // Show success message
                showAlert('success', 'Profile saved successfully!');
                
                // Close modal after successful submission
                const profileModal = bootstrap.Modal.getInstance(document.getElementById('profileModal'));
                if (profileModal) {
                    profileModal.hide();
                }
                
                // Save to localStorage for demo purposes
                localStorage.setItem('studentProfile', JSON.stringify(studentData));
                
            } catch (error) {
                console.error('Error saving profile:', error);
                showAlert('danger', 'Failed to save profile. Please try again.');
            }
        });
    }
    
    // Feedback form submission
    const feedbackForm = document.getElementById('feedbackForm');
    const feedbackText = document.getElementById('feedbackText');
    const charCount = document.getElementById('charCount');
    
    if (feedbackForm && feedbackText && charCount) {
        // Update character count as user types
        feedbackText.addEventListener('input', function() {
            charCount.textContent = this.value.length;
        });
        
        feedbackForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const feedbackData = {
                feedback: feedbackText.value
            };
            
            try {
                // Example API call using Axios - replace URL with actual endpoint
                // const response = await axios.post('https://api.ruraleducation.org/feedback', feedbackData);
                
                // Simulate successful submission for demo
                await simulateApiCall(feedbackData);
                
                // Show success message
                showAlert('success', 'Feedback submitted successfully!');
                
                // Clear form and reset character count
                feedbackText.value = '';
                charCount.textContent = '0';
                
                // Close modal after successful submission
                const feedbackModal = bootstrap.Modal.getInstance(document.getElementById('feedbackModal'));
                if (feedbackModal) {
                    feedbackModal.hide();
                }
                
            } catch (error) {
                console.error('Error submitting feedback:', error);
                showAlert('danger', 'Failed to submit feedback. Please try again.');
            }
        });
    }
    
    // AI Chat functionality
    const chatForm = document.getElementById('chatForm');
    const chatContainer = document.getElementById('chatContainer');
    const userMessage = document.getElementById('userMessage');
    
    if (chatForm && chatContainer && userMessage) {
        chatForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const message = userMessage.value.trim();
            if (!message) return;
            
            // Add user message to chat
            addChatMessage(message, 'user');
            
            // Clear input field
            userMessage.value = '';
            
            try {
                // Example API call using Axios - replace URL with actual endpoint
                // const response = await axios.post('https://api.ruraleducation.org/ai-bot', { message });
                
                // Simulate AI response for demo
                const aiResponse = await simulateAiResponse(message);
                
                // Add AI response to chat
                addChatMessage(aiResponse, 'bot');
                
            } catch (error) {
                console.error('Error getting AI response:', error);
                addChatMessage('Sorry, I encountered an error. Please try again.', 'bot');
            }
        });
    }
    
    // Government Schemes State Selector
    const stateSelector = document.getElementById('stateSelector');
    if (stateSelector) {
        stateSelector.addEventListener('change', function() {
            const selectedState = this.value;
            filterSchemesByState(selectedState);
        });
        
        // Initial filter on page load
        filterSchemesByState('all');
    }
    
    // Load profile data from localStorage if available (for demo)
    const loadSavedProfile = () => {
        const savedProfile = localStorage.getItem('studentProfile');
        if (savedProfile) {
            try {
                const profileData = JSON.parse(savedProfile);
                document.getElementById('studentName').value = profileData.name || '';
                document.getElementById('studentMobile').value = profileData.mobile || '';
                document.getElementById('studentEmail').value = profileData.email || '';
                document.getElementById('studentQualification').value = profileData.qualification || '';
            } catch (error) {
                console.error('Error loading saved profile:', error);
            }
        }
    };
    
    // Call function to load saved profile data
    if (document.getElementById('studentName')) {
        loadSavedProfile();
    }
});

// Helper Functions

// Function to display bootstrap alerts
function showAlert(type, message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Insert alert at the top of the body
    document.body.insertBefore(alertDiv, document.body.firstChild);
    
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
        const bsAlert = new bootstrap.Alert(alertDiv);
        bsAlert.close();
    }, 3000);
}

// Function to add message to chat
function addChatMessage(message, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = message;
    
    messageDiv.appendChild(contentDiv);
    
    const chatContainer = document.getElementById('chatContainer');
    chatContainer.appendChild(messageDiv);
    
    // Auto-scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Function to filter government schemes based on selected state
function filterSchemesByState(selectedState) {
    // Get all state scheme cards
    const stateSchemeCards = document.querySelectorAll('.state-scheme-card');
    
    // Show/hide state scheme cards based on selection
    stateSchemeCards.forEach(card => {
        const cardState = card.getAttribute('data-state');
        
        if (selectedState === 'all') {
            // Show a message that all central schemes are shown when "All India" is selected
            card.style.display = 'none';
            document.querySelector('.state-schemes h3').textContent = 'State Government Schemes (Select a state to view)';
        } else if (cardState === selectedState) {
            // Show cards that match the selected state
            card.style.display = 'block';
            document.querySelector('.state-schemes h3').textContent = `${getStateName(selectedState)} Government Schemes`;
        } else {
            // Hide cards that don't match the selected state
            card.style.display = 'none';
        }
    });
    
    // If no schemes are available for the selected state, show a message
    const visibleCards = Array.from(stateSchemeCards).filter(card => card.style.display !== 'none');
    const stateSchemesContainer = document.getElementById('stateSchemesContainer');
    
    if (selectedState !== 'all' && visibleCards.length === 0) {
        // Create a message element if it doesn't exist
        let noSchemesMessage = document.getElementById('noSchemesMessage');
        if (!noSchemesMessage) {
            noSchemesMessage = document.createElement('div');
            noSchemesMessage.id = 'noSchemesMessage';
            noSchemesMessage.className = 'col-12 text-center my-4';
            stateSchemesContainer.appendChild(noSchemesMessage);
        }
        
        noSchemesMessage.innerHTML = `
            <div class="alert alert-info">
                No specific schemes found for ${getStateName(selectedState)}. 
                Please check back later or explore the central government schemes.
            </div>
        `;
        noSchemesMessage.style.display = 'block';
    } else {
        // Hide the message if schemes are available
        const noSchemesMessage = document.getElementById('noSchemesMessage');
        if (noSchemesMessage) {
            noSchemesMessage.style.display = 'none';
        }
    }
    
    // Optionally, you could also fetch schemes from an API based on the selected state
    if (selectedState !== 'all') {
        // Example of how you would fetch schemes from an API:
        // fetchStateSchemes(selectedState);
    }
}

// Helper function to get full state name from state code
function getStateName(stateCode) {
    const stateNames = {
        'andhra-pradesh': 'Andhra Pradesh',
        'karnataka': 'Karnataka',
        'kerala': 'Kerala',
        'tamil-nadu': 'Tamil Nadu',
        'telangana': 'Telangana',
        'maharashtra': 'Maharashtra',
        'gujarat': 'Gujarat',
        'rajasthan': 'Rajasthan',
        'uttar-pradesh': 'Uttar Pradesh',
        'bihar': 'Bihar',
        'west-bengal': 'West Bengal',
        'assam': 'Assam',
        'orissa': 'Orissa',
        'madhya-pradesh': 'Madhya Pradesh',
        'punjab': 'Punjab',
        'haryana': 'Haryana'
    };
    
    return stateNames[stateCode] || stateCode;
}

// Example function to fetch state-specific schemes from an API
async function fetchStateSchemes(stateCode) {
    try {
        // This is just a placeholder for an actual API call
        // const response = await axios.get(`https://api.ruraleducation.org/schemes/${stateCode}`);
        // const schemes = response.data;
        
        // For demo purposes, we'll just log the state code
        console.log(`Fetching schemes for state: ${stateCode}`);
        
        // In a real implementation, you would then populate the UI with the fetched schemes
        // populateStateSchemes(schemes);
    } catch (error) {
        console.error('Error fetching state schemes:', error);
        showAlert('danger', 'Failed to fetch schemes for the selected state.');
    }
}

// Simulate API call (for demo purposes)
async function simulateApiCall(data) {
    return new Promise((resolve) => {
        // Simulate network delay
        setTimeout(() => {
            console.log('API call data:', data);
            resolve({ success: true });
        }, 1000);
    });
}

// Simulate AI response (for demo purposes)
async function simulateAiResponse(message) {
    return new Promise((resolve) => {
        // Simulate AI processing delay
        setTimeout(() => {
            // Simple responses based on keywords
            const lowerMessage = message.toLowerCase();
            
            if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
                resolve('Hello! How can I help you with your education today?');
            } else if (lowerMessage.includes('math') || lowerMessage.includes('mathematics')) {
                resolve('Our mathematics resources include basic arithmetic, algebra, geometry, and more. What specific topic would you like to learn about?');
            } else if (lowerMessage.includes('science')) {
                resolve('We have resources on physics, chemistry, biology, and environmental science. Which area interests you?');
            } else if (lowerMessage.includes('career') || lowerMessage.includes('job')) {
                resolve('Based on your rural location, I can suggest careers in agriculture, rural development, healthcare, education, or technology. Would you like to know more about any of these?');
            } else if (lowerMessage.includes('scheme') || lowerMessage.includes('scholarship')) {
                resolve('There are several government schemes available for rural students, including Samagra Shiksha Abhiyan, PM SHRI Schools, and state-specific scholarships. You can check our Government Schemes section for more details.');
            } else {
                resolve('That\'s an interesting question. Let me help you find resources on that topic. Could you provide more details about what you\'re looking for?');
            }
        }, 1000);
    });
} 