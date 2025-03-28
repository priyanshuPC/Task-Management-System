
class Router {
    constructor(routes) {
        this.routes = routes;
        this.rootElem = document.getElementById('main-content');
        this.currentView = null;
        
       
        window.addEventListener('hashchange', () => this.navigate());
        
    
        document.addEventListener('click', e => {
            if (e.target.matches('[data-link]')) {
                e.preventDefault();
                this.navigateTo(e.target.getAttribute('href'));
            }
        });
        
       
        this.navigate();
    }
    
    
    navigateTo(url) {
        window.location.hash = '#' + url;
    }
    
   
    navigate() {
       
        let path = window.location.hash.slice(1);
        
       
        if (!path || path === '/') {
            const token = localStorage.getItem('token');
            if (token) {
                path = '/dashboard';
                this.navigateTo(path);
                return;
            } else {
                path = '/login';
                this.navigateTo(path);
                return;
            }
        }
        
        // Find matching route
        const route = this.routes.find(route => {
            return path.match(new RegExp(`^${route.path}$`));
        });
        
        // Handle unknown routes
        if (!route) {
            this.navigateTo('/dashboard');
            return;
        }
        
        // Check authentication for protected routes
        if (route.protected) {
            const token = localStorage.getItem('token');
            if (!token) {
                this.navigateTo('/login');
                return;
            }
        }
        
        // Hide auth container if showing a protected route
        if (route.protected) {
            const authContainer = document.getElementById('auth-container');
            if (authContainer) {
                authContainer.classList.add('hidden');
            }
        }
        
        // Hide all views first
        this.hideAllViews();
        
        // Render the view
        this.showView(route.view);
    }
    
    // Hide all views in the application
    hideAllViews() {
        const views = [
            'auth-container',
            'dashboard-view',
            'tasks-view',
            'profile-view'
        ];
        
        views.forEach(viewId => {
            const viewElement = document.getElementById(viewId);
            if (viewElement) {
                viewElement.classList.add('hidden');
            }
        });
    }
    
    // Show a specific view
    showView(viewName) {
        // Show new view
        const newView = document.getElementById(viewName);
        if (newView) {
            newView.classList.remove('hidden');
            this.currentView = viewName;
            
            // Load data for views that need it
            if (viewName === 'dashboard-view') {
                loadDashboard();
            } else if (viewName === 'tasks-view') {
                loadTasks();
            }
        }
    }
}

// Initialize router when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const router = new Router([
        { path: '/login', view: 'auth-container' },
        { path: '/dashboard', view: 'dashboard-view', protected: true },
        { path: '/tasks', view: 'tasks-view', protected: true },
        { path: '/profile', view: 'profile-view', protected: true }
    ]);
    
    // Make router globally available
    window.router = router;
}); 