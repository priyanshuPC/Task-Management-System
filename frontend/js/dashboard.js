// Dashboard service configuration
const DASHBOARD_API_URL = 'http://localhost:8082/api/dashboard';

// DOM Elements
const totalTasksElement = document.getElementById('total-tasks');
const todoTasksElement = document.getElementById('todo-tasks');
const inProgressTasksElement = document.getElementById('in-progress-tasks');
const doneTasksElement = document.getElementById('done-tasks');
const blockerTasksElement = document.getElementById('blocker-tasks');
const overdueTasksElement = document.getElementById('overdue-tasks');

// Make test function available globally for browser console testing
window.testDashboardAPI = async function() {
    console.log('Testing dashboard API connection...');
    
    // First test the test endpoint
    try {
        const testResult = await testDashboardConnection();
        console.log('Test endpoint result:', testResult);
    } catch (error) {
        console.error('Test endpoint error:', error);
    }
    
    // Then try the summary endpoint with detailed error logging
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found');
            return;
        }

        console.log('Testing summary endpoint...');
        console.log('Token length:', token.length);
        console.log('Token first 10 chars:', token.substring(0, 10) + '...');
        
        const response = await fetch(`${DASHBOARD_API_URL}/summary`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Summary endpoint status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            return { status: response.status, error: errorText };
        }
        
        const data = await response.json();
        console.log('Summary endpoint data:', data);
        return { status: response.status, data };
    } catch (error) {
        console.error('Summary endpoint error:', error);
        return { status: 'error', error: error.message };
    }
};

// Test dashboard connection
async function testDashboardConnection() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found');
            return;
        }

        console.log('Testing dashboard connection...');
        const response = await fetch(`${DASHBOARD_API_URL}/test`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.text();
        console.log('Dashboard test response:', response.status, data);
        
        return { status: response.status, data };
    } catch (error) {
        console.error('Dashboard test error:', error);
        return { status: 'error', error: error.message };
    }
}

// Load dashboard data
async function loadDashboard() {
    // Check if dashboard elements exist
    if (!totalTasksElement) return;
    
    // Show loading state
    const dashboardStats = document.querySelector('.dashboard-stats');
    if (dashboardStats) {
        showLoading(dashboardStats);
    }
    
    try {
        // Test connection first
        await testDashboardConnection();
        
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found');
            window.router.navigateTo('/login');
            return;
        }

        const response = await fetch(`${DASHBOARD_API_URL}/summary`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                // Unauthorized - token expired or invalid
                localStorage.removeItem('token');
                window.router.navigateTo('/login');
                return;
            }
            throw new Error('Failed to load dashboard data');
        }

        const data = await response.json();
        updateDashboard(data);
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showDashboardError(error.message);
    } finally {
        // Hide loading state
        if (dashboardStats) {
            hideLoading(dashboardStats);
        }
    }
}

// Update dashboard UI with data
function updateDashboard(data) {
    if (totalTasksElement) totalTasksElement.textContent = data.totalTasks || 0;
    if (todoTasksElement) todoTasksElement.textContent = data.todoTasks || 0;
    if (inProgressTasksElement) inProgressTasksElement.textContent = data.inProgressTasks || 0;
    if (doneTasksElement) doneTasksElement.textContent = data.doneTasks || 0;
    if (blockerTasksElement) blockerTasksElement.textContent = data.blockerTasks || 0;
    if (overdueTasksElement) overdueTasksElement.textContent = data.overdueTasks || 0;
}

// Show error message on dashboard
function showDashboardError(message) {
    const dashboardStats = document.querySelector('.dashboard-stats');
    if (dashboardStats) {
        dashboardStats.innerHTML = `<div class="error-message">Error loading dashboard: ${message}</div>`;
    }
} 