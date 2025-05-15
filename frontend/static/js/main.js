/**
 * Main JavaScript file for Rural Education Hub
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    initStateSelector();
    checkAuthStatus();
    
    // Add event listeners to any interactive elements
    addEventListeners();
});

/**
 * Check if the user is authenticated and update UI accordingly
 */
async function checkAuthStatus() {
    try {
        const response = await axios.get('/api/check-auth');
        
        if (response.data.authenticated) {
            // User is logged in, show logout button and hide login/signup
            if (document.getElementById('login-signup-item')) {
                document.getElementById('login-signup-item').style.display = 'none';
            }
            if (document.getElementById('logout-item')) {
                document.getElementById('logout-item').style.display = 'block';
            }
            
            // Add event listener for logout
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', handleLogout);
            }
        } else {
            // User is not logged in, show login/signup button
            if (document.getElementById('login-signup-item')) {
                document.getElementById('login-signup-item').style.display = 'block';
            }
            if (document.getElementById('logout-item')) {
                document.getElementById('logout-item').style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Authentication check failed:', error);
    }
}

/**
 * Handle user logout
 */
async function handleLogout(e) {
    e.preventDefault();
    
    try {
        await axios.post('/api/logout');
        // Clear localStorage
        localStorage.removeItem('user');
        // Reload page
        window.location.href = '/';
    } catch (error) {
        console.error('Logout failed:', error);
        showAlert('Logout failed. Please try again.', 'danger');
    }
}

/**
 * Initialize state selector for government schemes
 */
function initStateSelector() {
    const stateSelector = document.getElementById('stateSelector');
    if (stateSelector) {
        stateSelector.addEventListener('change', function() {
            const selectedState = this.value;
            filterSchemesByState(selectedState);
        });
    }
}

/**
 * Filter government schemes by selected state
 */
function filterSchemesByState(state) {
    // Hide all state-specific schemes first
    const schemeCards = document.querySelectorAll('.state-scheme-card');
    schemeCards.forEach(card => {
        card.style.display = 'none';
    });
    
    if (state === 'all') {
        // Show only central schemes
        document.querySelectorAll('.state-schemes').forEach(section => {
            section.style.display = 'none';
        });
    } else {
        // Show state schemes section
        document.querySelectorAll('.state-schemes').forEach(section => {
            section.style.display = 'block';
        });
        
        // Show schemes for the selected state
        document.querySelectorAll(`.state-scheme-card[data-state="${state}"]`).forEach(card => {
            card.style.display = 'block';
        });
        
        // Update state schemes title
        const stateTitle = document.getElementById('stateSchemeTitle');
        if (stateTitle) {
            const stateName = document.querySelector(`#stateSelector option[value="${state}"]`).textContent;
            stateTitle.textContent = `${stateName} Government Schemes`;
        }
    }
}

/**
 * Add event listeners to interactive elements
 */
function addEventListeners() {
    // Set up form submissions
    setupForms();
    
    // Add any other event listeners here
}

/**
 * Set up form submissions
 */
function setupForms() {
    // Add event listeners for any forms
    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show success message and reset form
            showAlert('Thank you for your feedback!', 'success');
            feedbackForm.reset();
            
            // Close modal if exists
            const feedbackModal = bootstrap.Modal.getInstance(document.getElementById('feedbackModal'));
            if (feedbackModal) {
                feedbackModal.hide();
            }
        });
    }
}

/**
 * Show an alert message to the user
 */
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('mainAlertContainer');
    if (!alertContainer) return;
    
    const alertHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
    
    alertContainer.innerHTML = alertHTML;
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        const alert = document.querySelector('.alert');
        if (alert) {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }
    }, 5000);
} 