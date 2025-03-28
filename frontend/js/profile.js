// Profile service configuration
const PROFILE_API_URL = 'http://localhost:8081/api/auth/profile';

// Initialize profile functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const editUsernameBtn = document.getElementById('edit-username-btn');
    const editEmailBtn = document.getElementById('edit-email-btn');
    const editProfileModal = document.getElementById('edit-profile-modal');
    const editProfileForm = document.getElementById('edit-profile-form');
    const editProfileField = document.getElementById('edit-profile-field');
    const editProfileTitle = document.getElementById('edit-profile-title');
    const saveProfileBtn = document.getElementById('save-profile-btn');
    const cancelProfileBtn = document.getElementById('cancel-profile-btn');
    const editProfileError = document.getElementById('edit-profile-error');
    const closeModalBtn = editProfileModal?.querySelector('.close');

    let currentEditField = '';

    // Only add event listeners if elements exist
    if (editUsernameBtn && editEmailBtn && editProfileModal && editProfileForm) {
        // Event Listeners
        editUsernameBtn.addEventListener('click', () => openEditModal('username'));
        editEmailBtn.addEventListener('click', () => openEditModal('email'));
        closeModalBtn?.addEventListener('click', closeEditModal);
        cancelProfileBtn?.addEventListener('click', closeEditModal);
        editProfileForm.addEventListener('submit', handleProfileUpdate);

        // Open edit modal
        function openEditModal(field) {
            currentEditField = field;
            const currentValue = document.getElementById(`profile-${field}`).textContent;
            
            editProfileTitle.textContent = `Edit ${field.charAt(0).toUpperCase() + field.slice(1)}`;
            editProfileField.value = currentValue;
            editProfileField.type = field === 'email' ? 'email' : 'text';
            editProfileError.textContent = '';
            
            editProfileModal.classList.remove('hidden');
        }

        // Close edit modal
        function closeEditModal() {
            editProfileModal.classList.add('hidden');
            editProfileError.textContent = '';
            currentEditField = '';
        }

        // Handle profile update
        async function handleProfileUpdate(e) {
            e.preventDefault();
            editProfileError.textContent = '';
            
            const newValue = editProfileField.value.trim();
            if (!newValue) {
                editProfileError.textContent = 'Please enter a value';
                return;
            }
            
            if (currentEditField === 'email' && !isValidEmail(newValue)) {
                editProfileError.textContent = 'Please enter a valid email address';
                return;
            }
            
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('Authentication required. Please log in again.');
                }
                
                console.log('Updating profile...', currentEditField, newValue);
                
                const response = await fetch(PROFILE_API_URL, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        [currentEditField]: newValue
                    })
                });
                
                console.log('Update response status:', response.status);
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `Failed to update ${currentEditField}. Please try again.`);
                }
                
                const data = await response.json();
                console.log('Update successful:', data);
                
                // Update local storage and UI
                localStorage.setItem(currentEditField, newValue);
                document.getElementById(`profile-${currentEditField}`).textContent = newValue;
                
                // Update header username if username was changed
                if (currentEditField === 'username') {
                    const usernameDisplay = document.getElementById('username-display');
                    if (usernameDisplay) {
                        usernameDisplay.textContent = newValue;
                    }
                }
                
                // Show success message
                const successMessage = document.createElement('div');
                successMessage.className = 'success-message';
                successMessage.textContent = `${currentEditField.charAt(0).toUpperCase() + currentEditField.slice(1)} updated successfully`;
                editProfileForm.insertAdjacentElement('beforebegin', successMessage);
                
                setTimeout(() => {
                    successMessage.remove();
                    closeEditModal();
                }, 2000);
                
            } catch (error) {
                console.error('Profile update error:', error);
                editProfileError.textContent = error.message || `Failed to update ${currentEditField}. Please try again.`;
            }
        }
    }
});

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
} 