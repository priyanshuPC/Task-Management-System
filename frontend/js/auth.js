// Auth service configuration
const AUTH_API_URL = 'http://localhost:8081/api/auth';

// DOM Elements
const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');
const registerSuccess = document.getElementById('register-success');
const logoutBtn = document.getElementById('logout-btn');
const authContainer = document.getElementById('auth-container');
const userInfo = document.getElementById('user-info');
const usernameDisplay = document.getElementById('username-display');
const profileUsername = document.getElementById('profile-username');
const profileEmail = document.getElementById('profile-email');
const profileCreated = document.getElementById('profile-created');

// Tab Switching
loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    loginError.textContent = '';
});

registerTab.addEventListener('click', () => {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    registerError.textContent = '';
    registerSuccess.textContent = '';
});

// Login Handler
loginBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();
    
    if (!username || !password) {
        loginError.textContent = 'Please enter both username and password';
        return;
    }
    
    // Debug info
    console.log('Attempting login with username:', username);
    
    try {
        const requestBody = JSON.stringify({ username, password });
        console.log('Request payload:', requestBody);
        
        loginError.textContent = 'Connecting to server...';
        
        const response = await fetch(`${AUTH_API_URL}/signin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: requestBody,
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', [...response.headers.entries()]);
        
        if (!response.ok) {
            let errorMessage = 'Login failed: ';
            try {
                const errorData = await response.json();
                errorMessage += errorData.message || `Status ${response.status}`;
                console.error('Error data:', errorData);
            } catch (parseError) {
                errorMessage += `Status ${response.status}`;
                console.error('No JSON response from server');
            }
            throw new Error(errorMessage);
        }
        
        const data = await response.json();
        console.log('Login successful, received data:', data);
        
        // Store user data and token - handle different token property names
        const token = data.token || data.accessToken;
        if (!token) {
            console.error('No token found in response:', data);
            throw new Error('No authentication token received from server');
        }
        
        localStorage.setItem('token', token);
        localStorage.setItem('username', data.username);
        localStorage.setItem('userId', data.id);
        localStorage.setItem('email', data.email);
        
        // Update UI and navigate to dashboard
        updateUserInfo();
        window.router.navigateTo('/dashboard');
        
    } catch (error) {
        console.error('Login error:', error);
        loginError.textContent = error.message || 'Login failed. Please try again.';
    }
});

// Register Handler
registerBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value.trim();
    
    if (!username || !email || !password) {
        registerError.textContent = 'Please fill in all fields';
        return;
    }
    
    if (password.length < 6) {
        registerError.textContent = 'Password must be at least 6 characters long';
        return;
    }
    
    // Debug info
    console.log('Attempting registration with username:', username, 'and email:', email);
    registerError.textContent = '';
    registerSuccess.textContent = 'Sending registration request...';
    
    try {
        const requestBody = JSON.stringify({ username, email, password });
        console.log('Request payload:', requestBody);
        
        const response = await fetch(`${AUTH_API_URL}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: requestBody,
        });
        
        console.log('Response status:', response.status);
        
        const data = await response.json();
        console.log('Registration response:', data);
        
        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }
        
        // Show success message
        registerSuccess.textContent = data.message || 'Registration successful! Please login.';
        registerError.textContent = '';
        
        // Clear form
        document.getElementById('register-username').value = '';
        document.getElementById('register-email').value = '';
        document.getElementById('register-password').value = '';
        
    } catch (error) {
        console.error('Registration error:', error);
        registerError.textContent = error.message || 'Registration failed. Please try again.';
        registerSuccess.textContent = '';
    }
});

// Logout Handler
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    
    const header = document.querySelector('.header');
    if (header) {
        header.classList.remove('logged-in');
    }
    
    if (userInfo) {
        userInfo.classList.remove('visible');
        userInfo.classList.add('hidden');
    }
    
    window.router.navigateTo('/login');
});

// Update user information in the UI
function updateUserInfo() {
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email');
    const header = document.querySelector('.header');
    
    // Add logged-in class to header
    if (header) {
        header.classList.add('logged-in');
    }
    
    // Display username in header
    if (usernameDisplay) {
        usernameDisplay.textContent = username;
    }
    
    // Display user info in profile
    if (profileUsername) {
        profileUsername.textContent = username || 'Not set';
    }
    
    if (profileEmail) {
        profileEmail.textContent = email || 'Not set';
    }
    
    if (profileCreated) {
        // For demo purposes, we'll just show the current date
        // In a real app, this would come from the user object in the response
        const date = new Date();
        profileCreated.textContent = date.toLocaleDateString();
    }
    
    // Show user info in header
    if (userInfo) {
        userInfo.classList.remove('hidden');
        userInfo.classList.add('visible');
    }
}

// Check auth status and update UI accordingly
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const header = document.querySelector('.header');
    
    if (token) {
        updateUserInfo();
        
        // If we're on the login page and have a valid token, redirect to dashboard
        if (window.location.hash === '#/login' || window.location.hash === '' || window.location.hash === '#/') {
            window.router.navigateTo('/dashboard');
        }
        
        // Make sure auth container is hidden when authenticated
        if (authContainer) {
            authContainer.classList.add('hidden');
        }
    } else {
        // Remove logged-in class from header
        if (header) {
            header.classList.remove('logged-in');
        }
        
        // Hide user info
        if (userInfo) {
            userInfo.classList.remove('visible');
            userInfo.classList.add('hidden');
        }
        
        // If not authenticated, ensure we go to login page
        window.router.navigateTo('/login');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    
    // Setup dashboard-add-task-btn if it exists
    const dashboardAddTaskBtn = document.getElementById('dashboard-add-task-btn');
    if (dashboardAddTaskBtn) {
        dashboardAddTaskBtn.addEventListener('click', () => {
            window.router.navigateTo('/tasks');
            setTimeout(() => {
                const newTaskBtn = document.getElementById('new-task-btn');
                if (newTaskBtn) {
                    newTaskBtn.click();
                }
            }, 100);
        });
    }
}); 