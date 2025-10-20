// Navigation Management
class NavigationManager {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.init();
    }

    init() {
        this.setActiveMenuItem();
        this.bindEvents();
    }

    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop().split('.')[0];
        return page || 'index';
    }

    setActiveMenuItem() {
        // Remove all active classes
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });

        // Set active based on current page
        const activeSelectors = {
            'index': 0,
            'students': [1, 3, 5],
            'teachers': [2, 4], 
            'classes': 6,
            'results': 7
        };

        const menuItems = document.querySelectorAll('.menu-item');
        const activeIndexes = activeSelectors[this.currentPage];

        if (Array.isArray(activeIndexes)) {
            activeIndexes.forEach(index => {
                if (menuItems[index]) {
                    menuItems[index].classList.add('active');
                }
            });
        } else if (typeof activeIndexes === 'number' && menuItems[activeIndexes]) {
            menuItems[activeIndexes].classList.add('active');
        }
    }

    bindEvents() {
        // Handle navigation clicks
        document.querySelectorAll('.menu-item[onclick*="window.location"]').forEach(item => {
            item.addEventListener('click', (e) => {
                // Add loading state
                this.showLoadingState(item);
            });
        });
    }

    showLoadingState(item) {
        const originalContent = item.innerHTML;
        item.innerHTML = `<i class="fas fa-spinner fa-spin"></i><span>Loading...</span>`;
        
        // Restore after a short delay (in case navigation is instant)
        setTimeout(() => {
            item.innerHTML = originalContent;
        }, 500);
    }

    // Utility method to navigate programmatically
    navigateTo(page) {
        window.location.href = `${page}.html`;
    }

    // Show notifications
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
}

// Initialize navigation when DOM is loaded
let navigationManager;
document.addEventListener('DOMContentLoaded', function() {
    navigationManager = new NavigationManager();
});