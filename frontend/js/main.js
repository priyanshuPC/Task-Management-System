
window.addEventListener('click', (e) => {
    if (e.target === document.getElementById('task-form-modal')) {
        document.getElementById('task-form-modal').classList.add('hidden');
    }
});


async function handleResponse(response) {
    if (!response.ok) {
        let errorMessage = 'An error occurred';
        try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } catch (e) {
            errorMessage = `${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
    }
    return response.json();
}


function formatDate(date) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}


function showLoading(element) {
    element.innerHTML = '<div class="loading-spinner"></div>';
}


function hideLoading(element) {
    const spinner = element.querySelector('.loading-spinner');
    if (spinner) {
        spinner.remove();
    }
}


function validateForm(formId) {
    const form = document.getElementById(formId);
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('invalid');
        } else {
            input.classList.remove('invalid');
        }
    });
    
    return isValid;
}


console.log('Task Management System initialized');


window.addEventListener('load', () => {
    console.log('Page loaded/reloaded - verifying authentication state');
    
    
    const token = localStorage.getItem('token');
    if (token) {
        const authContainer = document.getElementById('auth-container');
        if (authContainer) {
            authContainer.classList.add('hidden');
        }
        
        const userInfo = document.getElementById('user-info');
        if (userInfo) {
            userInfo.classList.remove('hidden');
        }
    }
}); 