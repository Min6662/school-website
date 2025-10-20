/**
 * Shared Sidebar Component
 * Handles navigation, active states, and user profile display
 */

class SidebarManager {
    constructor() {
        this.currentPage = this.getCurrentPageFromURL();
        this.init();
    }

    async init() {
        try {
            // Load the sidebar HTML
            await this.loadSidebarHTML();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Set active navigation item
            this.setActiveNavItem();
            
            // Load user profile
            this.loadUserProfile();
            
            // Initialize mobile functionality
            this.initializeMobile();
            
            console.log('✅ Sidebar initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize sidebar:', error);
        }
    }

    async loadSidebarHTML() {
        try {
            const response = await fetch('components/sidebar.html');
            if (!response.ok) {
                throw new Error('Failed to load sidebar component');
            }
            
            const sidebarHTML = await response.text();
            
            // Find or create sidebar container
            let sidebarContainer = document.getElementById('sidebar-container');
            if (!sidebarContainer) {
                sidebarContainer = document.createElement('div');
                sidebarContainer.id = 'sidebar-container';
                document.body.insertBefore(sidebarContainer, document.body.firstChild);
            }
            
            sidebarContainer.innerHTML = sidebarHTML;
        } catch (error) {
            console.error('Failed to load sidebar HTML:', error);
            // Fallback: create basic sidebar if component file not found
            this.createFallbackSidebar();
        }
    }

    createFallbackSidebar() {
        const sidebarHTML = `
            <div class="sidebar" id="sidebar">
                <div class="sidebar-header">
                    <h3><i class="fas fa-graduation-cap"></i> School Manager</h3>
                </div>
                <nav class="sidebar-nav">
                    <a href="dashboard.html" class="nav-item" data-page="dashboard">
                        <i class="fas fa-tachometer-alt"></i><span>Dashboard</span>
                    </a>
                    <a href="students.html" class="nav-item" data-page="students">
                        <i class="fas fa-user-graduate"></i><span>Students</span>
                    </a>
                    <a href="teachers.html" class="nav-item" data-page="teachers">
                        <i class="fas fa-chalkboard-teacher"></i><span>Teachers</span>
                    </a>
                    <a href="settings.html" class="nav-item" data-page="settings">
                        <i class="fas fa-cog"></i><span>Settings</span>
                    </a>
                </nav>
            </div>`;
        
        const container = document.createElement('div');
        container.id = 'sidebar-container';
        container.innerHTML = sidebarHTML;
        document.body.insertBefore(container, document.body.firstChild);
    }

    setupEventListeners() {
        // Navigation item clicks
        document.addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item');
            if (navItem) {
                this.handleNavigation(navItem);
            }
        });

        // Mobile sidebar overlay
        const overlay = document.getElementById('sidebar-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => {
                this.closeMobileSidebar();
            });
        }
    }

    handleNavigation(navItem) {
        const page = navItem.dataset.page;
        const href = navItem.href;
        
        if (page && href) {
            // Add loading state
            navItem.classList.add('loading');
            
            // Remove loading state after a short delay (simulates navigation)
            setTimeout(() => {
                navItem.classList.remove('loading');
            }, 500);
            
            // Let the browser handle the navigation normally
            console.log(`🔄 Navigating to: ${page}`);
        }
    }

    getCurrentPageFromURL() {
        const path = window.location.pathname;
        const filename = path.split('/').pop().split('.')[0];
        
        // Map common page names
        const pageMap = {
            'index': 'dashboard',
            'dashboard': 'dashboard',
            'students': 'students',
            'teachers': 'teachers',
            'classes': 'classes',
            'attendance': 'attendance',
            'grades': 'grades',
            'schedule': 'schedule',
            'reports': 'reports',
            'settings': 'settings'
        };
        
        return pageMap[filename] || 'dashboard';
    }

    setActiveNavItem() {
        // Remove active class from all nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to current page
        const activeItem = document.querySelector(`[data-page="${this.currentPage}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }

    loadUserProfile() {
        try {
            // Get user data from localStorage
            const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
            
            const userNameElement = document.getElementById('user-name');
            const userRoleElement = document.getElementById('user-role');
            const userAvatarElement = document.getElementById('user-avatar');
            
            if (userNameElement && userData.username) {
                userNameElement.textContent = userData.username || 'User';
            }
            
            if (userRoleElement) {
                userRoleElement.textContent = userData.role || 'Administrator';
            }
            
            if (userAvatarElement && userData.username) {
                // Show first letter of username
                userAvatarElement.textContent = userData.username.charAt(0).toUpperCase();
            }
        } catch (error) {
            console.log('No user data found, using defaults');
        }
    }

    initializeMobile() {
        // Add mobile menu toggle if needed
        this.createMobileToggle();
    }

    createMobileToggle() {
        // Check if we're on mobile and if toggle doesn't exist
        if (window.innerWidth <= 768 && !document.getElementById('mobile-sidebar-toggle')) {
            const toggle = document.createElement('button');
            toggle.id = 'mobile-sidebar-toggle';
            toggle.innerHTML = '<i class="fas fa-bars"></i>';
            toggle.style.cssText = `
                position: fixed;
                top: 1rem;
                left: 1rem;
                z-index: 1001;
                background: #3498db;
                color: white;
                border: none;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                font-size: 1.2rem;
                cursor: pointer;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            `;
            
            toggle.addEventListener('click', () => {
                this.toggleMobileSidebar();
            });
            
            document.body.appendChild(toggle);
        }
    }

    toggleMobileSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        
        if (sidebar && overlay) {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        }
    }

    closeMobileSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        
        if (sidebar && overlay) {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        }
    }

    // Public method to update active page (useful when navigating programmatically)
    setActivePage(pageName) {
        this.currentPage = pageName;
        this.setActiveNavItem();
    }

    // Public method to update user profile
    updateUserProfile(userData) {
        const userNameElement = document.getElementById('user-name');
        const userRoleElement = document.getElementById('user-role');
        const userAvatarElement = document.getElementById('user-avatar');
        
        if (userNameElement && userData.username) {
            userNameElement.textContent = userData.username;
        }
        
        if (userRoleElement && userData.role) {
            userRoleElement.textContent = userData.role;
        }
        
        if (userAvatarElement && userData.username) {
            userAvatarElement.textContent = userData.username.charAt(0).toUpperCase();
        }
    }
}

// Auto-initialize sidebar when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if we're not on the login page
    if (!window.location.pathname.includes('login.html')) {
        window.sidebarManager = new SidebarManager();
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SidebarManager;
}