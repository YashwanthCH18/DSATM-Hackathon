// Auth Check Script
document.addEventListener('DOMContentLoaded', function() {
    // Check for authenticated user
    const user = localStorage.getItem('user');
    const isAuthenticated = !!user;
    
    // Find authentication UI elements
    const signupBtn = document.getElementById('signup-btn');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    
    // Only proceed if we found all UI elements
    if (signupBtn && loginBtn && logoutBtn) {
        if (isAuthenticated) {
            // User is logged in - show logout, hide signup/login
            signupBtn.style.display = 'none';
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'block';
            
            // Optional: Display user name if needed
            try {
                const userData = JSON.parse(user);
                console.log('Logged in as:', userData.username || userData.email);
            } catch (e) {
                console.error('Error parsing user data', e);
            }
        } else {
            // User is not logged in - show login, hide signup/logout
            signupBtn.style.display = 'none'; // As requested, only show login
            loginBtn.style.display = 'block';
            logoutBtn.style.display = 'none';
        }
    } else {
        console.log('Auth UI elements not found on this page');
    }
    
    // Set up logout button click handler
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Call the logout API endpoint
            axios.post('/api/logout')
                .then(response => {
                    // Clear user data
                    localStorage.removeItem('user');
                    
                    // Show success message
                    alert('You have been logged out successfully');
                    
                    // Redirect to home page
                    window.location.href = '/';
                })
                .catch(error => {
                    console.error('Logout error:', error);
                    
                    // Clear user data anyway
                    localStorage.removeItem('user');
                    
                    // Redirect to home page
                    window.location.href = '/';
                });
        });
    }
});
